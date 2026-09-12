import { Resend } from "resend";
import { BRAND } from "./constants";



interface Result { name: string; description: string; url: string; contact?: string; }

interface Args { email: string; topic: string; results: Result[]; via: "paid" | "promo"; }

export async function sendResultsEmail({ email, topic, results, via }: Args) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set — cannot email results.");
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const rows = results.map((r) => `<tr><td style="padding:12px 0;border-bottom:1px solid #d6e3f7;">
    <div style="font-weight:700;color:#0a1628;">${esc(r.name)}</div>
    <div style="color:#3f5878;font-size:14px;margin:4px 0;">${esc(r.description)}</div>
    <a href="${r.url}" style="color:#0f56c4;font-size:13px;">${esc(r.url)}</a>
    ${r.contact ? `<div style="color:#3f5878;font-size:13px;">${esc(r.contact)}</div>` : ""}
  </td></tr>`).join("");

  const ctas = BRAND.ctaLinks
    .map((c) => `<a href="${c.url}" style="color:#0f56c4;margin-right:16px;">${c.label}</a>`)
    .join("");

  const hasContacts = results.some((r) => r.contact);

  const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#eef3fb;padding:32px;">
    <h1 style="color:#0a1628;font-size:20px;">Your list: ${esc(topic)}</h1>
    <p style="color:#3f5878;font-size:14px;">${results.length} results</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="margin-top:24px;">${ctas}</div>
    ${via === "promo" ? `<p style="font-size:12px;color:#8296b3;">Powered by High Lvl AI</p>` : ""}
    ${hasContacts ? `<p style="font-size:11px;color:#93a6c2;margin-top:16px;">Contact information above is drawn from public listings only. Reply STOP to opt out of future lists.</p>` : ""}
  </div>`;

  await resend.emails.send({
    from: "High Lvl Lead Magnet <lists@highlvlmedia.com>",
    to: email,
    subject: `Your list: ${topic}`,
    html,
  });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}
