import { env } from "../config/env";

export type MailTemplateStatus = "active" | "ready" | "disabled";

export interface MailTemplateRegistryItem {
  key: string;
  name: string;
  purpose: string;
  templateFunction: string;
  status: MailTemplateStatus;
  statusLabel: string;
  note: string;
}

function hasMailTransport(): boolean {
  return Boolean(env.SMTP_HOST || env.AUTH_EMAIL_SERVER);
}

export function getMailTemplateRegistry(): MailTemplateRegistryItem[] {
  const mailTransportReady = hasMailTransport();
  const magicLinkActive = Boolean(
    env.AUTH_EMAIL_LOGIN_ENABLED &&
    env.AUTH_EMAIL_SERVER &&
    (env.MAIL_FROM || env.AUTH_EMAIL_FROM)
  );

  return [
    {
      key: "SYSTEM_TEST",
      name: "System testmail",
      purpose: "Teknisk SMTP-verifikation fra Systemstatus.",
      templateFunction: "renderSystemTestMailTemplate",
      status: mailTransportReady ? "active" : "ready",
      statusLabel: mailTransportReady ? "Aktiv" : "Klar",
      note: mailTransportReady
        ? "Kan sendes fra Systemstatus."
        : "Template findes, men mailtransport er ikke konfigureret.",
    },
    {
      key: "PASSWORD_RESET",
      name: "Nulstil adgangskode",
      purpose: "Mail til bruger ved nulstilling af adgangskode.",
      templateFunction: "renderPasswordResetMailTemplate",
      status: mailTransportReady ? "active" : "ready",
      statusLabel: mailTransportReady ? "Aktiv" : "Klar",
      note: mailTransportReady
        ? "Bruges af password reset-flowet."
        : "Template findes, men mailtransport er ikke konfigureret.",
    },
    {
      key: "FLIGHT_INTENT_CREATED",
      name: "Jeg flyver oprettet",
      purpose: "Mail til klubbens Jeg flyver-mailingliste når et medlem melder flyvning.",
      templateFunction: "renderFlightIntentCreatedMailTemplate",
      status: mailTransportReady ? "active" : "ready",
      statusLabel: mailTransportReady ? "Aktiv" : "Klar",
      note: mailTransportReady
        ? "Template er klar. Mail sendes kun hvis klubben har en aktiv FLIGHT_INTENT-mailingliste."
        : "Template findes, men mailtransport er ikke konfigureret.",
    },
    {
      key: "MAGIC_LINK",
      name: "Magic-link login",
      purpose: "Passwordless login via e-mail.",
      templateFunction: "renderMagicLinkMailTemplate",
      status: magicLinkActive ? "active" : "disabled",
      statusLabel: magicLinkActive ? "Aktiv" : "Deaktiveret",
      note: magicLinkActive
        ? "Auth.js e-mail login er aktivt."
        : "Template findes, men loginflowet er bevidst deaktiveret indtil tenant-aware magic-link flow bygges korrekt.",
    },
  ];
}
