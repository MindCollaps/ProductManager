function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function renderEmailButton(label: string, url: string) {
    return `<a href="${ escapeHtml(url) }" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;line-height:1.2;">${ escapeHtml(label) }</a>`;
}
