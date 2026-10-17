import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SoluCaptchaClient,
  SoluCaptchaError,
  validateTask,
} from "../../examples/javascript/client.mjs";
const key = "isolated-test-key",
  task = {
    type: "turnstile",
    websiteURL: "https://solucaptcha.com/en-us/demos/turnstile",
    websiteKey: "1x00000000000000000000AA",
  };
const response = (data) => Response.json(data);
function client(sequence) {
  const calls = [];
  return {
    calls,
    client: new SoluCaptchaClient(key, {
      fetchImpl: async (url, options) => {
        calls.push({ url, ...options });
        const next = sequence.shift();
        if (next instanceof Error) throw next;
        return typeof next === "function" ? next() : response(next);
      },
    }),
  };
}
test("create once, poll pending/processing/completed, keep credentials in JSON body", async () => {
  const { client: c, calls } = client([
    { errorId: 0, taskId: "task-123" },
    { errorId: 0, status: "pending" },
    { errorId: 0, status: "processing" },
    { errorId: 0, status: "completed", solution: { token: "test-token" } },
  ]);
  const id = await c.createTask(task),
    result = await c.waitForResult(id, { intervalMs: 1 });
  assert.equal(result.solution.token, "test-token");
  assert.equal(calls.filter((c) => c.url.endsWith("/createTask")).length, 1);
  for (const call of calls) {
    assert.ok(call.url.startsWith("https://api.solucaptcha.com/"));
    assert.ok(!call.url.includes(key));
    assert.equal(call.redirect, "error");
    assert.equal(JSON.parse(call.body).clientKey, key);
  }
});
test("balance 0 is valid", async () =>
  assert.equal(
    await client([{ errorId: 0, balance: 0 }]).client.getBalance(),
    0,
  ));
test("health never sends credentials or a request body", async () => {
  let options;
  const c = new SoluCaptchaClient("", {
    fetchImpl: async (url, o) => {
      options = o;
      assert.equal(url, "https://api.solucaptcha.com/health");
      return response({ status: "ok", supportedTaskTypes: ["turnstile"] });
    },
  });
  assert.equal((await c.health()).status, "ok");
  assert.equal(options.method, "GET");
  assert.equal(options.body, undefined);
});
test("HTTP 200 API errors remain errors and do not disclose descriptions", async () => {
  const { client: c } = client([
    {
      errorId: 1,
      errorCode: "ERROR_KEY_DOES_NOT_EXIST",
      errorDescription: key,
    },
  ]);
  await assert.rejects(
    c.getBalance(),
    (error) =>
      error.code === "ERROR_KEY_DOES_NOT_EXIST" && !error.message.includes(key),
  );
});
test("create network failures never issue another create", async () => {
  const { client: c, calls } = client([new TypeError(key)]);
  await assert.rejects(c.createTask(task), /CHECK_DASHBOARD/);
  assert.equal(calls.length, 1);
});
test("resuming an existing task does not call createTask", async () => {
  const { client: c, calls } = client([
    { errorId: 0, status: "completed", solution: { value: "sample" } },
  ]);
  await c.waitForResult("existing-id");
  assert.ok(calls.every((c) => c.url.endsWith("/getTaskResult")));
});
test("pending timeout retains existing task ID", async () => {
  const c = new SoluCaptchaClient(key, {
    fetchImpl: async () => response({ errorId: 0, status: "pending" }),
  });
  await assert.rejects(
    c.waitForResult("existing-id", { timeoutMs: 8, intervalMs: 2 }),
    (e) =>
      e.code === "POLL_TIMEOUT_RESUME_EXISTING_TASK" &&
      e.taskId === "existing-id",
  );
});
for (const [label, data, expected] of [
  ["failed", { errorId: 0, status: "failed" }, "TASK_FAILED"],
  [
    "unknown state",
    { errorId: 0, status: "mystery" },
    "UNEXPECTED_TASK_STATUS",
  ],
  ["missing solution", { errorId: 0, status: "completed" }, "MISSING_SOLUTION"],
  ["missing errorId", { status: "pending" }, "MISSING_ERROR_ID"],
])
  test(label, async () => {
    await assert.rejects(
      client([data]).client.waitForResult("task-id"),
      (e) => e.code === expected && e.taskId === "task-id",
    );
  });
test("redirect or fetch failure does not echo secret", async () =>
  await assert.rejects(
    client([new Error(key)]).client.getBalance(),
    (e) => e.code === "NETWORK_ERROR" && !e.message.includes(key),
  ));
test("non-JSON and invalid JSON fail clearly", async () => {
  await assert.rejects(
    client([
      () =>
        new Response("<html/>", { headers: { "content-type": "text/html" } }),
    ]).client.getBalance(),
    /UNEXPECTED_CONTENT_TYPE/,
  );
  await assert.rejects(
    client([
      () =>
        new Response("{", { headers: { "content-type": "application/json" } }),
    ]).client.getBalance(),
    /INVALID_JSON/,
  );
});
test("non-2xx HTTP status is surfaced without response body", async () =>
  await assert.rejects(
    client([() => new Response(key, { status: 429 })]).client.getBalance(),
    (e) => e.code === "HTTP_429" && !e.message.includes(key),
  ));
test("known oversized response is rejected", async () =>
  await assert.rejects(
    client([
      () =>
        new Response("{}", {
          headers: {
            "content-type": "application/json",
            "content-length": String(3 * 1024 * 1024),
          },
        }),
    ]).client.getBalance(),
    /RESPONSE_TOO_LARGE/,
  ));
test("invalid inputs rejected before HTTP", () => {
  assert.throws(() => validateTask({ ...task, type: "ocr" }));
  assert.throws(() => validateTask({ ...task, websiteKey: "" }));
  assert.throws(() =>
    validateTask({
      ...task,
      websiteURL: "https://user:secret@solucaptcha.com/",
    }),
  );
  assert.throws(() => new SoluCaptchaClient("key\n"));
  assert.throws(() => new SoluCaptchaClient(key, { requestTimeoutMs: 0 }));
});
