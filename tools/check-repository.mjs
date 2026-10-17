import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { validateTask, TASK_TYPES } from "../examples/javascript/client.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
async function files(path) {
  const out = [];
  for (const item of await readdir(path, { withFileTypes: true })) {
    if (
      [".git", "node_modules", "__pycache__", ".venv", "coverage"].includes(
        item.name,
      )
    )
      continue;
    const p = resolve(path, item.name);
    out.push(...(item.isDirectory() ? await files(p) : [p]));
  }
  return out;
}
const all = await files(root),
  markdown = [];
const secretPatterns = [
  /sc_live_[A-Za-z0-9_-]{24,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /github_pat_[A-Za-z0-9_]{30,}/,
  /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
];
for (const path of all) {
  const name = relative(root, path).replaceAll("\\", "/");
  assert.ok(
    !/(?:^|\/)(?:\.env(?:\..+)?|solution[^/]*\.json|[^/]+\.(?:sqlite|sqlite-wal|sqlite-shm|pem|key|log))$/.test(
      name,
    ) || name === ".env.example",
    "Sensitive file: " + name,
  );
  const body = await readFile(path, "utf8");
  if (!name.endsWith("check-repository.mjs"))
    for (const pattern of secretPatterns)
      assert.ok(!pattern.test(body), "Credential-like material: " + name);
  if (name.endsWith(".md")) markdown.push([path, body]);
  assert.ok(
    !/\b(?:\d{1,3}\.){3}\d{1,3}\b|\/opt\/solucaptcha|\/internal\/discord|discord\.com\/api\/webhooks\//.test(
      body,
    ),
    "Private infrastructure details: " + name,
  );
}
for (const [path, body] of markdown) {
  const content = body.replace(/```[\s\S]*?```/g, "");
  for (const match of content.matchAll(/!?\[[^\]]*\]\(([^\s)]+)\)/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    const target = resolve(
      dirname(path),
      decodeURIComponent(href.split("#")[0]),
    );
    assert.ok(!relative(root, target).startsWith(".."), "Escaping link");
    await stat(target).catch(() => {
      throw new Error("Broken link in " + relative(root, path) + ": " + href);
    });
  }
}
const payloads = await readdir(resolve(root, "payloads"));
assert.equal(payloads.length, TASK_TYPES.length);
for (const name of payloads) {
  const payload = JSON.parse(
    await readFile(resolve(root, "payloads", name), "utf8"),
  );
  validateTask(payload);
  assert.equal(payload.type, name.replace(".json", ""));
  assert.ok(!Object.hasOwn(payload, "clientKey"));
}
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
assert.ok(!pkg.dependencies);
assert.equal(pkg.private, true);
const generated = JSON.parse(
  await readFile(resolve(root, "generated/site-guides.json"), "utf8"),
);
assert.deepEqual(Object.keys(generated), ["pt-br", "en-us"]);
for (const pages of Object.values(generated))
  assert.equal(Object.keys(pages).length, 3);
console.log(
  `Repository checks passed: ${all.length} files, ${markdown.length} Markdown documents, nine payloads, six guides, no runtime dependencies or credential-like data.`,
);
