import { parseArgs } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { SoluCaptchaClient, validateTask } from "./client.mjs";
try {
  const { values } = parseArgs({
    options: {
      task: { type: "string" },
      "task-id": { type: "string" },
      "dry-run": { type: "boolean", default: false },
      output: { type: "string" },
      help: { type: "boolean", default: false },
    },
  });
  if (values.help) {
    console.log(
      "node examples/javascript/solve.mjs [--task payloads/turnstile.json | --task-id TASK_ID] [--dry-run] [--output solution.json]",
    );
    process.exit(0);
  }
  if (values.task && values["task-id"])
    throw new TypeError("Choose --task or --task-id");
  const task = values["task-id"]
    ? null
    : validateTask(
        JSON.parse(
          await readFile(
            values.task ||
              new URL("../../payloads/turnstile.json", import.meta.url),
            "utf8",
          ),
        ),
      );
  if (values["dry-run"])
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          taskId: values["task-id"] || null,
          task,
          networkRequests: 0,
        },
        null,
        2,
      ),
    );
  else {
    const client = SoluCaptchaClient.fromEnv(),
      id = values["task-id"] || (await client.createTask(task));
    console.log(`taskId: ${id}`);
    const result = await client.waitForResult(id);
    if (values.output) {
      await writeFile(
        values.output,
        JSON.stringify(result.solution, null, 2) + "\n",
        { flag: "wx", mode: 0o600 },
      );
      console.log("Completed. Solution saved to the requested local file.");
    } else
      console.log(
        "Completed. Pass --output to save the solution, or consume result.solution in your application.",
      );
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
