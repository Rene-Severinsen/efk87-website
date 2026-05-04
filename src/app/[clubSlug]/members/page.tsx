import { resolvePublicPageForClub } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { publicRoutes } from "../../../lib/publicRoutes";
import { getMemberDirectoryForClub } from "../../../lib/members/memberProfileService";
import styles from "./MembersPage.module.css";

interface MembersPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getDisplayName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Medlem";
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim();

  return initials || "M";
}

function getAddressLines(
    addressLine: string | null,
    postalCode: string | null,
    city: string | null,
): string[] {
  const lines: string[] = [];
  const address = addressLine?.trim();
  const postalAndCity = [postalCode, city].filter(Boolean).join(" ").trim();

  if (address) lines.push(address);
  if (postalAndCity) lines.push(postalAndCity);

  return lines;
}

function formatCertificate(certificate: string): string {
  return certificate
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
}

function getPhoneHref(phone: string): string {
  return `tel:${phone.replaceAll(" ", "")}`;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { clubSlug } = await params;
  const pageSlug = "members";

  const {
    club,
    page,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolvePublicPageForClub(clubSlug, pageSlug);

  const members = await getMemberDirectoryForClub(club.id);

  const introText =
      page?.body && page.body !== "Member access foundation will be added later."
          ? page.body
          : "";

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={club.name}
          clubDisplayName={publicSettings?.displayName || club.name}
          theme={theme}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title="Medlemmer"
          currentPath={publicRoutes.members(clubSlug)}
      >
        {introText ? (
            <section className={styles.pageIntro} aria-label="Introduktion">
              <p>{introText}</p>
            </section>
        ) : null}

        {members.length > 0 ? (
            <section className={styles.memberDirectory} aria-label="Medlemsliste">
              <div className={styles.memberCount}>{members.length} medlemmer</div>

              <ol className={styles.memberList}>
                {members.map((member) => {
                  const displayName = getDisplayName(member.firstName, member.lastName);
                  const addressLines = getAddressLines(member.addressLine, member.postalCode, member.city);

                  return (
                      <li key={member.userId} className={styles.memberRow}>
                        <div className={styles.avatarColumn}>
                          <div className={styles.avatarWrap}>
                            {member.profileImageUrl ? (
                                <img
                                    src={member.profileImageUrl}
                                    alt={`Profilbillede af ${displayName}`}
                                    className={styles.avatarImage}
                                />
                            ) : (
                                <div className={styles.avatarFallback} aria-hidden="true">
                                  {getInitials(member.firstName, member.lastName)}
                                </div>
                            )}
                          </div>

                          <div className={styles.memberChips}>
                            <span className={styles.metaBadge}>Nr. {member.memberNumber ?? "—"}</span>

                            {member.mdkNumber ? (
                                <span className={styles.metaBadge}>MDK {member.mdkNumber}</span>
                            ) : null}
                          </div>
                        </div>

                        <div className={styles.memberText}>
                          <h2>{displayName}</h2>

                          {addressLines.length > 0 ? (
                              <address className={styles.addressBlock}>
                                {addressLines.map((line) => (
                                    <span key={line}>{line}</span>
                                ))}
                              </address>
                          ) : (
                              <p className={styles.mutedText}>Adresse ikke angivet</p>
                          )}

                          <div className={styles.contactStack}>
                            <div className={styles.contactItem}>
                              <span>Mobil: </span>
                              {member.mobilePhone ? (
                                  <a href={getPhoneHref(member.mobilePhone)}>{member.mobilePhone}</a>
                              ) : (
                                  <span>ikke angivet</span>
                              )}
                            </div>

                            <div className={styles.contactItem}>
                              <span>Email: </span>
                              {member.email ? (
                                  <a href={`mailto:${member.email}`}>{member.email}</a>
                              ) : (
                                  <span>ikke angivet</span>
                              )}
                            </div>
                          </div>

                          {member.certificates.length > 0 ? (
                              <div className={styles.certificateList}>
                                {member.certificates.map((certificate) => (
                                    <span key={certificate} className={styles.certificateBadge}>
                            {formatCertificate(certificate)}
                          </span>
                                ))}
                              </div>
                          ) : null}
                        </div>
                      </li>
                  );
                })}
              </ol>
            </section>
        ) : (
            <section className={styles.emptyState} aria-label="Ingen medlemmer">
              <h2>Ingen medlemmer fundet</h2>
              <p>Der er endnu ikke registreret medlemmer til visning.</p>
            </section>
        )}
      </ThemedClubPageShell>
  );
}