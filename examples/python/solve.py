"""Create once, poll safely, or resume an existing SoluCaptcha task."""
import argparse
import json
import os
from pathlib import Path
import sys
from solucaptcha_client import SoluCaptchaClient, SoluCaptchaError, validate_task

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--task", type=Path, help="JSON payload file; defaults to payloads/turnstile.json")
    group.add_argument("--task-id", help="Resume polling; does not create a new task")
    parser.add_argument("--dry-run", action="store_true", help="Validate locally; no API key, network or charge")
    parser.add_argument("--output", type=Path, help="Save the solution privately; refuses to overwrite existing files")
    args = parser.parse_args()
    task = None
    if not args.task_id:
        path = args.task or Path(__file__).resolve().parents[2] / "payloads/turnstile.json"
        task = validate_task(json.loads(path.read_text(encoding="utf-8")))
    if args.dry_run:
        print(json.dumps({"mode": "dry-run", "taskId": args.task_id, "task": task, "networkRequests": 0}, indent=2))
        return
    client = SoluCaptchaClient.from_env()
    identifier = args.task_id or client.create_task(task)
    print(f"taskId: {identifier}", flush=True)
    result = client.wait_for_result(identifier)
    if args.output:
        fd = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as file:
            json.dump(result["solution"], file, indent=2)
        print("Completed. Solution saved to the requested local file.")
    else:
        print("Completed. Pass --output to save the solution, or consume result['solution'] in your application.")

if __name__ == "__main__":
    try:
        main()
    except (SoluCaptchaError, ValueError, OSError) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
