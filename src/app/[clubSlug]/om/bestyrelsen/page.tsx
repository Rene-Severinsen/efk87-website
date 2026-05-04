import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import Avatar from "../../../../components/shared/Avatar";
import { getPublicBoardContacts } from "../../../../lib/members/boardContactService";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface BoardPageProps {
    params: Promise<{
        clubSlug: string;
    }>;
}

type BoardContact = Awaited<ReturnType<typeof getPublicBoardContacts>>[number];

function getPhoneHref(phone: string): string {
    return `tel:${phone.replaceAll(" ", "")}`;
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

function BoardMemberCard({ member }: { member: BoardContact }) {
    const addressLines = getAddressLines(member.addressLine, member.postalCode, member.city);

    return (
        <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-4">
                <Avatar
                    imageUrl={member.profileImageUrl}
                    name={member.displayName}
                    size="lg"
                    shape="rounded"
                    className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                />

                <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold leading-tight text-[var(--public-text)] sm:text-xl">
                        {member.displayName}
                    </h3>

                    {addressLines.length > 0 ? (
                        <div className="mt-1 text-sm font-normal not-italic leading-snug text-[var(--public-text)] sm:text-base">
                            {addressLines.map((line) => (
                                <span key={line} className="block not-italic">
                  {line}
                </span>
                            ))}
                        </div>
                    ) : null}

                    <p className="mt-2 truncate text-sm font-normal text-[var(--public-text-muted)]">
                        {member.roleLabel}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                {member.email ? (
                    <a
                        href={`mailto:${member.email}`}
                        className="flex min-h-0 items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3 text-[var(--public-text)] transition hover:border-[var(--public-primary)] hover:bg-[var(--public-primary-soft)]"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--public-primary-soft)] text-[var(--public-primary)]">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>

                        <span className="min-w-0 truncate text-sm font-semibold text-[var(--public-primary)]">
              {member.email}
            </span>
                    </a>
                ) : null}

                {member.mobilePhone ? (
                    <a
                        href={getPhoneHref(member.mobilePhone)}
                        className="flex min-h-0 items-center gap-3 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3 text-[var(--public-text)] transition hover:border-[var(--public-primary)] hover:bg-[var(--public-primary-soft)]"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--public-primary-soft)] text-[var(--public-primary)]">
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                        </div>

                        <span className="text-sm font-semibold text-[var(--public-primary)]">
              {member.mobilePhone}
            </span>
                    </a>
                ) : null}
            </div>
        </ThemedSectionCard>
    );
}

export default async function BoardPage({ params }: BoardPageProps) {
    const { clubSlug } = await params;
    const pageSlug = "bestyrelsen";

    const {
        club,
        theme,
        footerData,
        navigationItems,
        actionItems,
        publicSettings,
    } = await resolvePublicPageForClub(clubSlug, pageSlug);

    const boardMembers = await getPublicBoardContacts(club.id);

    return (
        <ThemedClubPageShell
            clubSlug={clubSlug}
            clubName={club.settings?.shortName || club.name}
            clubDisplayName={club.settings?.displayName || publicSettings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
            theme={theme}
            publicThemeMode={publicSettings?.publicThemeMode}
            footerData={footerData}
            navigationItems={navigationItems}
            actionItems={actionItems}
            title="Bestyrelsen"
            subtitle="Her finder du klubbens bestyrelse og centrale kontaktpersoner."
            currentPath={publicRoutes.board(clubSlug)}
        >
            <div className="mt-6 space-y-8">
                <section>
                    {boardMembers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            {boardMembers.map((member) => (
                                <BoardMemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    ) : (
                        <ThemedSectionCard className="py-10 text-center">
                            <p className="text-base italic text-[var(--public-text-muted)]">
                                Der er endnu ikke registreret bestyrelsesmedlemmer til offentlig visning.
                            </p>
                        </ThemedSectionCard>
                    )}
                </section>
            </div>
        </ThemedClubPageShell>
    );
}