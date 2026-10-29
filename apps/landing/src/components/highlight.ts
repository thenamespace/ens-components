export function highlight(code: string) {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const parts = escaped.split(/(\"[^\"]*\")/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return `<span class="tok-str">${part}</span>`;
      return part
        .replace(
          /\b(import|from|const|export|default|return)\b/g,
          '<span class="tok-kw">$1</span>'
        )
        .replace(/(\{|\})/g, '<span class="tok-tag">$1</span>')
        .replace(/([A-Z][A-Za-z]+)/g, '<span class="tok-fn">$1</span>');
    })
    .join("");
}
