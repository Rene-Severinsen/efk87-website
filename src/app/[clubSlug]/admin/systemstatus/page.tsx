import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader, AdminPageSection, AdminStatTile, AdminStatTileGrid } from "../../../../components/admin/AdminPagePrimitives";
import { getMailRuntimeStatus } from "../../../../lib/email/mailService";
import { getMailTemplateRegistry, type MailTemplateStatus } from "../../../../lib/email/mailTemplateRegistry";
import { sendSystemStatusTestEmailAction } from "../../../../lib/admin/systemStatusActions";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams?: Promise<{
    mailTest?: string;
  }>;
}

function getProviderLabel(provider: string): string {
  switch (provider) {
    case "smtp":
      return "SMTP";
    case "auth-email-server":
      return "Auth email server";
    default:
      return "Ikke konfigureret";
  }
}

function getMailTestMessage(status?: string): { tone: "success" | "warning" | "danger"; text: string } | null {
  switch (status) {
    case "success":
      return {
        tone: "success",
        text: "Testmail blev sendt. Tjek modtagerens indbakke og spamfilter.",
      };
    case "error":
      return {
        tone: "danger",
        text: "Testmail kunne ikke sendes. Tjek SMTP-konfiguration og serverlog.",
      };
    case "invalid":
      return {
        tone: "warning",
        text: "Indtast en gyldig modtageradresse.",
      };
    default:
      return null;
  }
}

function getTemplateStatusBadgeClass(status: MailTemplateStatus): string {
  switch (status) {
    case "active":
      return "admin-badge admin-badge-success";
    case "ready":
      return "admin-badge admin-badge-neutral";
    case "disabled":
      return "admin-badge admin-badge-warning";
    default:
      return "admin-badge admin-badge-neutral";
  }
}

export default async function Page({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const mailStatus = getMailRuntimeStatus();
  const mailTemplateRegistry = getMailTemplateRegistry();
  const mailTestMessage = getMailTestMessage(resolvedSearchParams.mailTest);

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/systemstatus`);
  const sendTestEmailAction = sendSystemStatusTestEmailAction.bind(null, club.id, clubSlug, club.name);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Systemstatus"
        description="Teknisk overblik over platform, miljø og centrale driftskontroller."
      />

      <div className="admin-workspace pt-6">
        <AdminPageSection>
          <div className="mb-5">
            <h2 className="admin-section-title">Service status</h2>
            <p className="admin-muted m-0 text-sm leading-6">
              Tiles bruges her kun til hurtig driftsstatus. Tekniske detaljer vises længere nede.
            </p>
          </div>

          <AdminStatTileGrid columns="auto">
            <AdminStatTile
              label="Mailservice"
              value={mailStatus.configured ? "Oppe" : "Ikke konfigureret"}
              tone={mailStatus.configured ? "green" : "amber"}
              active={mailStatus.configured}
            />
          </AdminStatTileGrid>
        </AdminPageSection>

        {!mailStatus.configured ? (
          <div className="admin-alert admin-alert-warning">
            <span>⚠️</span>
            <div>
              <h3 className="admin-warning-text mb-1 text-base font-semibold">Mail er ikke konfigureret</h3>
              <p className="admin-warning-text m-0 text-sm leading-6">
                SMTP_HOST eller AUTH_EMAIL_SERVER mangler. Tilføj mailkonfiguration i .env før mail kan testes.
              </p>
            </div>
          </div>
        ) : null}

        {mailTestMessage ? (
          <div className={`admin-alert admin-alert-${mailTestMessage.tone}`}>
            <span>{mailTestMessage.tone === "success" ? "✅" : "⚠️"}</span>
            <div>
              <h3 className="mb-1 text-base font-semibold">Mailtest</h3>
              <p className="m-0 text-sm leading-6">{mailTestMessage.text}</p>
            </div>
          </div>
        ) : null}

        <AdminPageSection>
          <div className="mb-5">
            <h2 className="admin-section-title">Send teknisk testmail</h2>
            <p className="admin-muted m-0 text-sm leading-6">
              Bruges kun til at verificere grundlæggende SMTP-afsendelse. Mailinglister og automatiske mails kobles på senere.
            </p>
          </div>

          <form action={sendTestEmailAction} className="grid gap-4">
            <label className="grid gap-2">
              <span className="admin-muted text-sm font-semibold">Modtageradresse</span>
              <input
                type="email"
                name="testEmail"
                required
                defaultValue={viewer.email || ""}
                placeholder="mail@example.dk"
                className="admin-input"
              />
            </label>

            <div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Send testmail
              </button>
            </div>
          </form>
        </AdminPageSection>

        <AdminPageSection>
          <div className="mb-5">
            <h2 className="admin-section-title">Mail templates</h2>
            <p className="admin-muted m-0 text-sm leading-6">
              Oversigt over registrerede mailtemplates og deres aktuelle flowstatus. Redigering kommer senere i platform admin.
            </p>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Formål</th>
                  <th>Status</th>
                  <th>Funktion</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {mailTemplateRegistry.map((template) => (
                  <tr key={template.key}>
                    <td>
                      <div className="font-semibold">{template.name}</div>
                      <div className="admin-muted text-xs">{template.key}</div>
                    </td>
                    <td>{template.purpose}</td>
                    <td>
                      <span className={getTemplateStatusBadgeClass(template.status)}>
                        {template.statusLabel}
                      </span>
                    </td>
                    <td><code>{template.templateFunction}</code></td>
                    <td className="admin-muted">{template.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPageSection>

        <AdminPageSection>
          <div className="mb-5">
            <h2 className="admin-section-title">Mail runtime status</h2>
            <p className="admin-muted m-0 text-sm leading-6">
              Viser den aktuelle server-side mailkonfiguration uden at eksponere adgangskoder.
            </p>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <tbody>
                <tr>
                  <th>Provider</th>
                  <td>{getProviderLabel(mailStatus.provider)}</td>
                </tr>
                <tr>
                  <th>Konfigureret</th>
                  <td>{mailStatus.configured ? "Ja" : "Nej"}</td>
                </tr>
                <tr>
                  <th>Host</th>
                  <td><code>{mailStatus.host || "—"}</code></td>
                </tr>
                <tr>
                  <th>Port</th>
                  <td>{mailStatus.port || "—"}</td>
                </tr>
                <tr>
                  <th>Secure</th>
                  <td>{mailStatus.secure ? "Ja" : "Nej"}</td>
                </tr>
                <tr>
                  <th>SMTP login</th>
                  <td>{mailStatus.userConfigured ? "Konfigureret" : "Ikke konfigureret"}</td>
                </tr>
                <tr>
                  <th>Afsender</th>
                  <td><code>{mailStatus.from}</code></td>
                </tr>
                <tr>
                  <th>External notifications</th>
                  <td>{mailStatus.canSendExternalNotifications ? "Aktiveret for miljøet" : "Ikke generelt aktiveret for miljøet"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AdminPageSection>
      </div>
    </AdminShell>
  );
}
