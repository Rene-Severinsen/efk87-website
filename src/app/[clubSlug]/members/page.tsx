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

function formatAddress(addressLine: string | null, postalCode: string | null, city: string | null): string {
  const address = addressLine?.trim();
  const postalAndCity = [postalCode, city].filter(Boolean).join(" ").trim();

  if (address && postalAndCity) return `${address}, ${postalAndCity}`;
  if (address) return address;
  if (postalAndCity) return postalAndCity;

  return "Adresse ikke angivet";
}

function formatCertificate(certificate: string): string {
  return certificate
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
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

  const title = page?.title || "Medlemmer";
  const introText =
      page?.body ||
      "Her kan klubbens medlemmer se kontaktoplysninger og relevante medlemsinformationer.";

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={club.name}
          clubDisplayName={publicSettings?.displayName || club.name}
          theme={theme}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title={title}
          currentPath={publicRoutes.members(clubSlug)}
      >
        <section className={styles.pageIntro} aria-label="Introduktion">
          <p>{introText}</p>
        </section>

        {members.length > 0 ? (
            <section className={styles.memberGrid} aria-label="Medlemsliste">
              {members.map((member) => {
                const displayName = getDisplayName(member.firstName, member.lastName);
                const address = formatAddress(member.addressLine, member.postalCode, member.city);

                return (
                    <article key={member.userId} className={styles.memberCard}>
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

                      <div className={styles.memberContent}>
                        <div className={styles.memberHeader}>
                          <div>
                            <h2>{displayName}</h2>
                            <p>Medlemsnr. {member.memberNumber ?? "ikke angivet"}</p>
                          </div>

                          {member.mdkNumber ? (
                              <span className={styles.mdkBadge}>MDK {member.mdkNumber}</span>
                          ) : (
                              <span className={styles.mutedBadge}>MDK ikke angivet</span>
                          )}
                        </div>

                        <dl className={styles.memberDetails}>
                          <div>
                            <dt>Adresse</dt>
                            <dd>{address}</dd>
                          </div>

                          <div>
                            <dt>Telefon</dt>
                            <dd>
                              {member.mobilePhone ? (
                                  <a className="public-link" href={`tel:${member.mobilePhone}`}>
                                    {member.mobilePhone}
                                  </a>
                              ) : (
                                  "Ikke angivet"
                              )}
                            </dd>
                          </div>

                          <div>
                            <dt>Mail</dt>
                            <dd>
                              {member.email ? (
                                  <a className="public-link" href={`mailto:${member.email}`}>
                                    {member.email}
                                  </a>
                              ) : (
                                  "Ikke angivet"
                              )}
                            </dd>
                          </div>
                        </dl>

                        <div className={styles.certificates}>
                          <span className={styles.certificatesLabel}>Certifikater</span>

                          {member.certificates.length > 0 ? (
                              <div className={styles.certificateList}>
                                {member.certificates.map((certificate) => (
                                    <span key={certificate} className={styles.certificateBadge}>
                            {formatCertificate(certificate)}
                          </span>
                                ))}
                              </div>
                          ) : (
                              <span className={styles.noCertificates}>Ingen registreret</span>
                          )}
                        </div>
                      </div>
                    </article>
                );
              })}
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