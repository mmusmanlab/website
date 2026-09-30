import { NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ error: "The submitted form is too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Please submit a valid form." }, { status: 400 });
  }

  const { name, email, message, website } = payload as Record<string, unknown>;
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ success: true });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !emailPattern.test(email.trim()) ||
    email.trim().length > 254 ||
    message.trim().length < 10 ||
    message.trim().length > 5000
  ) {
    return NextResponse.json(
      { error: "Enter a valid name and email, and a message between 10 and 5,000 characters." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return NextResponse.json(
      { error: "Contact delivery is not configured yet. Please email mmusmanlab@gmail.com directly." },
      { status: 503 }
    );
  }

  const safeName = name.trim().replace(/[\r\n]+/g, " ");
  const safeEmail = email.trim();
  const safeMessage = message.trim();
  const safeNameHtml = escapeHtml(safeName);
  const safeEmailHtml = escapeHtml(safeEmail);
  const safeMessageHtml = escapeHtml(safeMessage);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: safeEmail,
        subject: `Portfolio contact from ${safeName}`,
        text: `New portfolio enquiry\n\nName: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${safeMessage}\n\nReply directly to this email to respond.`,
        html: `
          <div style="margin:0;padding:32px 16px;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;color:#18212b;">
            <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e7ec;border-radius:12px;overflow:hidden;">
              <div style="padding:24px 30px;background:#101820;color:#ffffff;">
                <p style="margin:0 0 8px;color:#85d2c1;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">MMUsmanLab</p>
                <h1 style="margin:0;font-size:23px;line-height:1.35;font-weight:700;">New portfolio enquiry</h1>
              </div>
              <div style="padding:28px 30px 32px;">
                <p style="margin:0 0 22px;color:#56616d;font-size:15px;line-height:1.6;">Someone has sent a message through the contact form.</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
                  <tr>
                    <td style="width:90px;padding:10px 0;color:#697582;font-size:13px;font-weight:700;vertical-align:top;">Name</td>
                    <td style="padding:10px 0;color:#18212b;font-size:14px;line-height:1.5;">${safeNameHtml}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid #edf0f2;color:#697582;font-size:13px;font-weight:700;vertical-align:top;">Email</td>
                    <td style="padding:10px 0;border-top:1px solid #edf0f2;font-size:14px;line-height:1.5;"><a href="mailto:${safeEmailHtml}" style="color:#147d70;text-decoration:underline;">${safeEmailHtml}</a></td>
                  </tr>
                </table>
                <h2 style="margin:0 0 10px;color:#18212b;font-size:14px;">Message</h2>
                <div style="padding:16px 18px;border-left:3px solid #27a18e;border-radius:4px;background:#f5f8f8;color:#28343e;font-size:14px;line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere;">${safeMessageHtml}</div>
                <p style="margin:24px 0 0;color:#697582;font-size:12px;line-height:1.6;">Reply to this email to respond directly to ${safeNameHtml}.</p>
              </div>
            </div>
            <p style="max-width:620px;margin:16px auto 0;color:#89939c;text-align:center;font-size:11px;line-height:1.5;">Sent from the contact form at mmusmanlab.vercel.app</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const providerError = await response.text();
      console.error("Contact delivery provider rejected a message:", response.status, providerError);
      const senderNotVerified = response.status === 403 && /domain is not verified|verify.*domain/i.test(providerError);
      return NextResponse.json(
        {
          error: senderNotVerified
            ? "Email delivery is not configured: verify the CONTACT_FROM_EMAIL domain in Resend, then try again."
            : "Your message could not be delivered right now. Please email mmusmanlab@gmail.com directly.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Contact delivery request failed:", error);
    return NextResponse.json(
      { error: "Your message could not be delivered right now. Please email mmusmanlab@gmail.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}