import { readFile, writeFile, mkdir } from "node:fs/promises";
import { guides, updatedAt } from "./guide-source.mjs";
const check = process.argv.includes("--check");
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const inline = (value) =>
  escape(value).replace(/`([^`]+)`/g, "<code>$1</code>");
function safeHref(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !["solucaptcha.com", "github.com"].includes(url.hostname)
  )
    throw new Error("Unexpected guide link");
  return escape(value);
}
const md = (b) =>
  b.type === "heading"
    ? `## ${b.text}`
    : b.type === "paragraph"
      ? b.text
      : b.type === "code"
        ? `\`\`\`${b.language}\n${b.content}\n\`\`\``
        : b.type === "list"
          ? b.items.map((i) => `- ${i}`).join("\n")
          : b.type === "links"
            ? b.items.map((i) => `[${i.label}](${i.href})`).join(" · ")
            : b.type === "table"
              ? `| ${b.headers.join(" | ")} |\n| ${b.headers.map(() => "---").join(" | ")} |\n${b.rows.map((row) => `| ${row.join(" | ")} |`).join("\n")}`
              : (() => {
                  throw new Error("Unknown block");
                })();
const html = (b) =>
  b.type === "heading"
    ? `<h2>${escape(b.text)}</h2>`
    : b.type === "paragraph"
      ? `<p>${inline(b.text)}</p>`
      : b.type === "code"
        ? `<pre><code class="language-${escape(b.language)}">${escape(b.content)}</code></pre>`
        : b.type === "list"
          ? `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`
          : b.type === "links"
            ? `<p>${b.items.map((i) => `<a href="${safeHref(i.href)}">${escape(i.label)}</a>`).join(" · ")}</p>`
            : b.type === "table"
              ? `<div class="docs-table-wrap"><table><thead><tr>${b.headers.map((i) => `<th>${escape(i)}</th>`).join("")}</tr></thead><tbody>${b.rows.map((row) => `<tr>${row.map((i) => `<td>${inline(i)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
              : (() => {
                  throw new Error("Unknown block");
                })();
async function save(path, content) {
  const url = new URL("../" + path, import.meta.url);
  if (check) {
    if ((await readFile(url, "utf8")) !== content)
      throw new Error("Generated guide drift: " + path);
  } else {
    await mkdir(new URL(".", url), { recursive: true });
    await writeFile(url, content);
  }
}
const site = {};
for (const [locale, pages] of Object.entries(guides)) {
  site[locale] = {};
  for (const [slug, page] of Object.entries(pages)) {
    const filename = slug.slice(7) + ".md",
      date =
        locale === "pt-br"
          ? `Atualizado em ${updatedAt}.`
          : `Updated ${updatedAt}.`;
    await save(
      `docs/${locale}/${filename}`,
      `# ${page.title}\n\n${page.description}\n\n${date}\n\n${page.blocks.map(md).join("\n\n")}\n`,
    );
    site[locale][slug] = {
      title: page.title,
      description: page.description,
      englishFallback: false,
      html:
        `<h1>${escape(page.title)}</h1><p class="lead">${escape(page.description)}</p><p class="docs-updated">${date}</p>` +
        page.blocks.map(html).join(""),
    };
  }
}
await save("generated/site-guides.json", JSON.stringify(site, null, 2) + "\n");
console.log(
  `${check ? "Checked" : "Built"} six bilingual guides from one source.`,
);
