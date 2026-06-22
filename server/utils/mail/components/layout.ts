const BASE_FONT = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export interface EmailLayoutInput {
    previewText: string;
    title: string;
    intro: string;
    contentHtml: string;
    footerText?: string;
}

export function renderEmailLayout(input: EmailLayoutInput) {
    const footerText = input.footerText || 'Product Manager - Automated email';

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${ escapeHtml(input.title) }</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:${ BASE_FONT };color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${ escapeHtml(input.previewText) }</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:26px 28px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#f8fafc;">
              <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">Product Manager</div>
              <h1 style="margin:12px 0 6px;font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;">${ escapeHtml(input.title) }</h1>
              <p style="margin:0;font-size:14px;line-height:1.5;color:#cbd5e1;">${ escapeHtml(input.intro) }</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 20px;">
              ${ input.contentHtml }
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #e5e7eb;font-size:12px;line-height:1.6;color:#64748b;">
              ${ escapeHtml(footerText) }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
