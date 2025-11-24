import { NextResponse, type NextRequest } from 'next/server';

const MAILERLITE_KEY = process.env.MAILERLITE_API_KEY;
const CONTACT_FORWARD_EMAIL =
  process.env.CONTACT_FORWARD_EMAIL || process.env.CONTACT_FORM_FORWARD_EMAIL;
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'no-reply@example.com';
const CONTACT_FROM_NAME = process.env.CONTACT_FROM_NAME || 'WC26 Fan Zone';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEmailBody({
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const plain = [
    `New contact form submission`,
    `Subject: ${subject}`,
    '',
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <p><strong>New contact form submission</strong></p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}<br/>
    <strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-line;">${escapeHtml(message)}</p>
  `;

  return { plain, html };
}

export async function POST(req: NextRequest) {
  if (!MAILERLITE_KEY) {
    return NextResponse.json(
      { error: 'mailerlite_not_configured' },
      { status: 500 },
    );
  }

  if (!CONTACT_FORWARD_EMAIL) {
    return NextResponse.json(
      { error: 'contact_forward_email_missing' },
      { status: 500 },
    );
  }

  let payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { firstName, lastName, email, subject, message } = payload;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !subject ||
    !message ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof email !== 'string' ||
    typeof subject !== 'string' ||
    typeof message !== 'string'
  ) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const emailContent = buildEmailBody({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: trimmedMessage,
  });

  try {
    const mailerRes = await fetch('https://api.mailerlite.com/api/v2/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAILERLITE_KEY}`,
        'X-MailerLite-ApiKey': MAILERLITE_KEY,
      },
      body: JSON.stringify({
        subject: `New contact form message: ${subject}`.slice(0, 120),
        from: {
          email: CONTACT_FROM_EMAIL,
          name: CONTACT_FROM_NAME,
        },
        recipients: [
          {
            email: CONTACT_FORWARD_EMAIL,
          },
        ],
        content: {
          html: emailContent.html,
          plain: emailContent.plain,
        },
      }),
    });

    if (!mailerRes.ok) {
      const errorBody = await mailerRes.text().catch(() => '');
      console.error('MailerLite send failed', mailerRes.status, errorBody);
      return NextResponse.json(
        { error: 'mailerlite_failed' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact send error', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
