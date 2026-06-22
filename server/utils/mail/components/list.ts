function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function renderEmailListItem(title: string, body: string, meta?: string) {
    const metaHtml = meta ? `<div style="margin-top:6px;font-size:12px;color:#64748b;">${ escapeHtml(meta) }</div>` : '';

    return `<div style="padding:12px 14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;margin-bottom:10px;">
  <div style="font-size:14px;font-weight:600;color:#0f172a;">${ escapeHtml(title) }</div>
  <div style="margin-top:4px;font-size:13px;line-height:1.45;color:#334155;">${ escapeHtml(body) }</div>
  ${ metaHtml }
</div>`;
}
