export interface RenderedMailTemplate {
  subject: string;
  text: string;
  html: string;
}

interface MailLayoutParams {
  title: string;
  intro?: string;
  contentHtml: string;
  footerText?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMailLayout({
  title,
  intro,
  contentHtml,
  footerText = "Denne mail er sendt automatisk fra EFK87-platformen.",
}: MailLayoutParams): string {
  return `
    <div style="margin:0;padding:0;background:#f3f6fb;">
      <div style="max-width:680px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#111827;">
        <div style="background:#ffffff;border:1px solid #d8e0ec;border-radius:18px;overflow:hidden;box-shadow:0 14px 34px rgba(15,23,42,0.08);">
          <div style="padding:28px 30px 20px;border-bottom:1px solid #e5edf7;background:#f8fbff;">
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">
              EFK87 Platform
            </div>
            <h1 style="margin:0;font-size:24px;line-height:1.25;color:#0f172a;">${escapeHtml(title)}</h1>
            ${intro ? `<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(intro)}</p>` : ""}
          </div>

          <div style="padding:28px 30px;">
            ${contentHtml}
          </div>

          <div style="padding:18px 30px;border-top:1px solid #e5edf7;background:#f8fbff;">
            <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">${escapeHtml(footerText)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderKeyValueRows(rows: Array<{ label: string; value: string }>): string {
  return `
    <table style="border-collapse:collapse;width:100%;margin:20px 0;border:1px solid #e5edf7;border-radius:12px;overflow:hidden;">
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td style="width:34%;padding:11px 12px;border-bottom:1px solid #e5edf7;background:#f8fafc;font-size:13px;font-weight:700;color:#334155;">${escapeHtml(row.label)}</td>
                <td style="padding:11px 12px;border-bottom:1px solid #e5edf7;font-size:13px;color:#111827;">${escapeHtml(row.value)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

export function renderFlightIntentCreatedMailTemplate(params: {
  clubName: string;
  createdByName: string;
  flightDateLabel: string;
  plannedTimeLabel: string;
  message: string | null;
  listUrl: string;
  todayIntents: Array<{
    displayName: string;
    plannedTimeLabel: string;
    message: string | null;
  }>;
}): RenderedMailTemplate {
  const subject = `Jeg flyver: ${params.createdByName} flyver`;

  const todayListText = params.todayIntents.length > 0
    ? params.todayIntents
        .map((intent) => {
          const messagePart = intent.message ? ` — ${intent.message}` : "";
          return `- ${intent.displayName}, ${intent.plannedTimeLabel}${messagePart}`;
        })
        .join("\n")
    : "- Ingen aktive flyvemeldinger fundet.";

  const text = `Hej.

${params.createdByName} har meldt: Jeg flyver.

Dato: ${params.flightDateLabel}
Tidspunkt: ${params.plannedTimeLabel}
${params.message ? `Besked: ${params.message}\n` : ""}
Dagens aktive 'Jeg flyver'-meldinger:
${todayListText}

Denne mail er sendt, fordi et medlem har oprettet en aktiv "Jeg flyver"-melding.

Venlig hilsen
${params.clubName}`;

  const createdMessageHtml = params.message
    ? `
      <div style="margin-top:14px;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e5edf7;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">Besked</div>
        <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">${escapeHtml(params.message)}</p>
      </div>
    `
    : "";

  const todayRowsHtml = params.todayIntents.length > 0
    ? params.todayIntents
        .map((intent) => `
          <tr>
            <td style="width:30%;padding:12px;border-bottom:1px solid #e5edf7;font-size:14px;color:#111827;font-weight:700;vertical-align:top;">${escapeHtml(intent.displayName)}</td>
            <td style="width:5%;padding:12px 8px;border-bottom:1px solid #e5edf7;font-size:14px;color:#334155;white-space:nowrap;vertical-align:top;">${escapeHtml(intent.plannedTimeLabel)}</td>
            <td style="width:65%;padding:12px;border-bottom:1px solid #e5edf7;font-size:14px;color:#334155;vertical-align:top;word-break:break-word;">${intent.message ? escapeHtml(intent.message) : "—"}</td>
          </tr>
        `)
        .join("")
    : `
          <tr>
            <td colspan="3" style="padding:12px;border-bottom:1px solid #e5edf7;font-size:14px;color:#64748b;">Ingen aktive flyvemeldinger fundet.</td>
          </tr>
        `;

  const html = renderMailLayout({
    title: "Jeg flyver",
    intro: `${params.createdByName} har meldt, at der flyves i dag.`,
    contentHtml: `
      ${renderKeyValueRows([
        { label: "Medlem", value: params.createdByName },
        { label: "Dato", value: params.flightDateLabel },
        { label: "Tidspunkt", value: params.plannedTimeLabel },
      ])}

      ${createdMessageHtml}

      <h2 style="margin:28px 0 10px;font-size:18px;line-height:1.3;color:#0f172a;">Dagens aktive 'Jeg flyver'-meldinger</h2>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#475569;">
        Her er den aktuelle liste over medlemmer, der har meldt flyvning.
      </p>

      <table style="border-collapse:collapse;width:100%;margin:0;border:1px solid #e5edf7;border-radius:12px;overflow:hidden;">
        <thead>
          <tr>
            <th style="width:30%;text-align:left;padding:12px;background:#f8fafc;border-bottom:1px solid #e5edf7;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Medlem</th>
            <th style="width:5%;text-align:left;padding:12px 8px;background:#f8fafc;border-bottom:1px solid #e5edf7;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;white-space:nowrap;">Tid</th>
            <th style="width:65%;text-align:left;padding:12px;background:#f8fafc;border-bottom:1px solid #e5edf7;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#64748b;">Besked</th>
          </tr>
        </thead>
        <tbody>
          ${todayRowsHtml}
        </tbody>
      </table>

      <div style="margin:24px 0 0;">
        <a href="${escapeHtml(params.listUrl)}" style="display:inline-block;background:#0f4c81;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700;">
          Se dagens liste
        </a>
      </div>

      <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
        Denne mail er sendt, fordi et medlem har oprettet en aktiv "Jeg flyver"-melding.
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
  };
}

export function renderMagicLinkMailTemplate(params: {
  loginUrl: string;
  clubName?: string;
}): RenderedMailTemplate {
  const platformName = params.clubName || "EFK87";
  const subject = `Log ind på ${platformName}`;

  const text = `Hej.

Du kan logge ind på ${platformName} ved at klikke på nedenstående link:
${params.loginUrl}

Linket er gyldigt i 24 timer.

Hvis du ikke har anmodet om at logge ind, kan du blot ignorere denne e-mail.

Venlig hilsen
${platformName}`;

  const html = renderMailLayout({
    title: `Log ind på ${platformName}`,
    intro: "Klik på knappen nedenfor for at logge ind på din konto.",
    contentHtml: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Brug dette sikre login-link til at fortsætte.
      </p>

      <div style="margin:26px 0;">
        <a href="${escapeHtml(params.loginUrl)}" style="display:inline-block;background:#0f4c81;color:#ffffff;padding:13px 22px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700;">
          Log ind
        </a>
      </div>

      <p style="margin:18px 0 8px;font-size:14px;line-height:1.6;color:#475569;">
        Eller kopier og indsæt dette link i din browser:
      </p>

      <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#334155;">
        ${escapeHtml(params.loginUrl)}
      </p>

      <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
        Linket er gyldigt i 24 timer. Hvis du ikke har anmodet om at logge ind, kan du blot ignorere denne e-mail.
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
  };
}

export function renderPasswordResetMailTemplate(params: {
  resetUrl: string;
  clubName?: string;
}): RenderedMailTemplate {
  const platformName = params.clubName || "EFK87";
  const subject = `Nulstil din adgangskode til ${platformName}`;

  const text = `Hej.

Du har anmodet om at nulstille din adgangskode til ${platformName}.

Du kan nulstille din adgangskode ved at klikke på nedenstående link:
${params.resetUrl}

Linket er gyldigt i 60 minutter.

Hvis du ikke har anmodet om at nulstille din adgangskode, kan du blot ignorere denne e-mail.

Venlig hilsen
${platformName}`;

  const html = renderMailLayout({
    title: "Nulstil adgangskode",
    intro: `Du har anmodet om at nulstille din adgangskode til ${platformName}.`,
    contentHtml: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
        Klik på knappen nedenfor for at vælge en ny adgangskode.
      </p>

      <div style="margin:26px 0;">
        <a href="${escapeHtml(params.resetUrl)}" style="display:inline-block;background:#0f4c81;color:#ffffff;padding:13px 22px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700;">
          Nulstil adgangskode
        </a>
      </div>

      <p style="margin:18px 0 8px;font-size:14px;line-height:1.6;color:#475569;">
        Eller kopier og indsæt dette link i din browser:
      </p>

      <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;color:#334155;">
        ${escapeHtml(params.resetUrl)}
      </p>

      <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b;">
        Linket er gyldigt i 60 minutter. Hvis du ikke har anmodet om at nulstille din adgangskode, kan du blot ignorere denne e-mail.
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
  };
}

export function renderSystemTestMailTemplate(params: {
  clubSlug: string;
  requestedBy: string;
  provider: string;
  smtpHost?: string;
  smtpPort?: number;
}): RenderedMailTemplate {
  const subject = "EFK87 platform mailtest";

  const rows = [
    { label: "Klub/tenant", value: params.clubSlug },
    { label: "Udløst af", value: params.requestedBy },
    { label: "Mail provider", value: params.provider },
    { label: "SMTP host", value: params.smtpHost ?? "ikke angivet" },
    { label: "SMTP port", value: params.smtpPort ? String(params.smtpPort) : "ikke angivet" },
  ];

  const text = `Hej.

Dette er en teknisk testmail fra EFK87-platformen.

Klub/tenant: ${params.clubSlug}
Udløst af: ${params.requestedBy}
Mail provider: ${params.provider}
SMTP host: ${params.smtpHost ?? "ikke angivet"}
SMTP port: ${params.smtpPort ?? "ikke angivet"}

Hvis du modtager denne mail, virker den grundlæggende SMTP-afsendelse.

Venlig hilsen
EFK87 platform`;

  const html = renderMailLayout({
    title: "EFK87 platform mailtest",
    intro: "Dette er en teknisk testmail fra EFK87-platformen.",
    contentHtml: `
      ${renderKeyValueRows(rows)}
      <p style="margin:18px 0 0;font-size:15px;line-height:1.6;color:#334155;">
        Hvis du modtager denne mail, virker den grundlæggende SMTP-afsendelse.
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
  };
}
