import importlib.util
from email.message import Message
from pathlib import Path
import sys
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'examples/python'))
from solucaptcha_client import SoluCaptchaClient,SoluCaptchaError,NoRedirect,validate_task
KEY='isolated-test-key'
TASK={'type':'turnstile','websiteURL':'https://solucaptcha.com/en-us/demos/turnstile','websiteKey':'1x00000000000000000000AA'}
class Response:
 def __init__(self,data,content_type='application/json',status=200):
  self.status=status;self.headers=Message();self.headers['Content-Type']=content_type;self.raw=json.dumps(data).encode()
 def __enter__(self):return self
 def __exit__(self,*args):return False
 def read(self,n):return self.raw[:n]
class ClientTests(unittest.TestCase):
 def make(self,sequence):
  calls=[]
  def transport(request,timeout):
   calls.append(request);value=sequence.pop(0)
   if isinstance(value,Exception):raise value
   return value if isinstance(value,Response) else Response(value)
  return SoluCaptchaClient(KEY,transport=transport),calls
 def test_create_poll_complete(self):
  c,calls=self.make([{'errorId':0,'taskId':'task-123'},{'errorId':0,'status':'pending'},{'errorId':0,'status':'processing'},{'errorId':0,'status':'completed','solution':{'token':'sample'}}])
  result=c.wait_for_result(c.create_task(TASK),interval=.001)
  self.assertEqual(result['solution']['token'],'sample');self.assertEqual(sum(r.full_url.endswith('/createTask') for r in calls),1)
  for request in calls:
   self.assertTrue(request.full_url.startswith('https://api.solucaptcha.com/'));self.assertNotIn(KEY,request.full_url);self.assertEqual(json.loads(request.data)['clientKey'],KEY)
 def test_zero_balance(self):
  c,calls=self.make([{'errorId':0,'balance':0}]);self.assertEqual(c.get_balance(),0);self.assertEqual(calls[0].get_method(),'POST');self.assertEqual(json.loads(calls[0].data)['clientKey'],KEY)
 def test_public_health(self):
  def transport(request,timeout):self.assertEqual(request.get_method(),'GET');self.assertIsNone(request.data);return Response({'status':'ok'})
  self.assertEqual(SoluCaptchaClient(transport=transport).health()['status'],'ok')
 def test_api_error_on_200(self):
  c,_=self.make([{'errorId':1,'errorCode':'ERROR_KEY_DOES_NOT_EXIST','errorDescription':KEY}])
  with self.assertRaises(SoluCaptchaError) as result:c.get_balance()
  self.assertEqual(result.exception.code,'ERROR_KEY_DOES_NOT_EXIST');self.assertNotIn(KEY,str(result.exception))
 def test_create_never_retried(self):
  c,calls=self.make([URLError(KEY)])
  with self.assertRaisesRegex(SoluCaptchaError,'CHECK_DASHBOARD'):c.create_task(TASK)
  self.assertEqual(len(calls),1)
 def test_resume(self):
  c,calls=self.make([{'errorId':0,'status':'completed','solution':{'value':'sample'}}]);c.wait_for_result('existing-id');self.assertTrue(all(r.full_url.endswith('/getTaskResult') for r in calls))
 def test_pending_deadline(self):
  def transport(request,timeout):return Response({'errorId':0,'status':'pending'})
  c=SoluCaptchaClient(KEY,transport=transport)
  with self.assertRaises(SoluCaptchaError) as result:c.wait_for_result('existing-id',timeout=.005,interval=.001)
  self.assertEqual(result.exception.code,'POLL_TIMEOUT_RESUME_EXISTING_TASK');self.assertEqual(result.exception.task_id,'existing-id')
 def test_terminal_states(self):
  for data,code in [({'errorId':0,'status':'failed'},'TASK_FAILED'),({'errorId':0,'status':'unexpected'},'UNEXPECTED_TASK_STATUS'),({'errorId':0,'status':'completed'},'MISSING_SOLUTION'),({'status':'pending'},'MISSING_ERROR_ID')]:
   with self.subTest(code=code):
    with self.assertRaises(SoluCaptchaError) as result:self.make([data])[0].wait_for_result('existing-id')
    self.assertEqual(result.exception.code,code);self.assertEqual(result.exception.task_id,'existing-id')
 def test_non_json(self):
  with self.assertRaisesRegex(SoluCaptchaError,'UNEXPECTED_CONTENT_TYPE'):self.make([Response({},'text/html')])[0].get_balance()
 def test_invalid_json(self):
  r=Response({});r.raw=b'not JSON'
  with self.assertRaisesRegex(SoluCaptchaError,'INVALID_JSON'):self.make([r])[0].get_balance()
 def test_http_error(self):
  with self.assertRaisesRegex(SoluCaptchaError,'HTTP_429'):self.make([HTTPError('https://api.solucaptcha.com/getBalance',429,KEY,Message(),None)])[0].get_balance()
 def test_size_limit(self):
  r=Response({});r.raw=b'x'*(2*1024*1024+1)
  with self.assertRaisesRegex(SoluCaptchaError,'RESPONSE_TOO_LARGE'):self.make([r])[0].get_balance()
 def test_no_redirect(self):self.assertIsNone(NoRedirect().redirect_request(None,None,307,'','', 'https://other.invalid'))
 def test_input_validation(self):
  for task in [{**TASK,'type':'ocr'},{**TASK,'websiteKey':''},{**TASK,'websiteURL':'https://user:secret@solucaptcha.com'}]:
   with self.assertRaises(ValueError):validate_task(task)
  with self.assertRaises(ValueError):SoluCaptchaClient('key\n')
  with self.assertRaises(ValueError):SoluCaptchaClient(KEY,request_timeout=0)
if __name__=='__main__':unittest.main()
