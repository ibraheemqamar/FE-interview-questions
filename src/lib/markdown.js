// Tiny markdown renderer ported verbatim from the original deck.
// Escapes first, then formats. Output is trusted (authored in the data files)
// and injected via dangerouslySetInnerHTML, exactly like the original innerHTML.

export function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineFmt(s) {
  return s
    .replace(/`([^`]+)`/g, (m, c) => "<code>" + c + "</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function renderMD(src) {
  const blocks = [];
  // pull out fenced code blocks first
  src = src.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, (m, code) => {
    const i = blocks.length;
    blocks.push('<pre class="code"><code>' + esc(code.replace(/\n+$/, "")) + "</code></pre>");
    return "@@CODE" + i + "@@";
  });
  const chunks = src.split(/\n{2,}/);
  let html = "";
  for (let raw of chunks) {
    const block = raw.trim();
    if (!block) continue;
    if (/^@@CODE\d+@@$/.test(block)) {
      html += block;
      continue;
    }
    const lines = block.split("\n");
    const isList = lines.every((l) => /^[-*]\s+/.test(l.trim()));
    if (isList) {
      html +=
        "<ul>" +
        lines
          .map((l) => "<li>" + inlineFmt(esc(l.trim().replace(/^[-*]\s+/, ""))) + "</li>")
          .join("") +
        "</ul>";
    } else {
      // separate any code-block placeholders so <pre> never nests inside <p>
      block.split(/(@@CODE\d+@@)/).forEach((part) => {
        if (/^@@CODE\d+@@$/.test(part)) {
          html += part;
          return;
        }
        const txt = part.trim();
        if (txt) html += "<p>" + txt.split("\n").map((l) => inlineFmt(esc(l))).join("<br>") + "</p>";
      });
    }
  }
  // reinsert code blocks
  html = html.replace(/@@CODE(\d+)@@/g, (m, i) => blocks[+i]);
  return html;
}
