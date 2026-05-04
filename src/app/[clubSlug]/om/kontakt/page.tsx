import { resolvePublicPageForClub } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { getPublicInstructorContacts } from "../../../../lib/members/instructorContactService";
import Avatar from "../../../../components/shared/Avatar";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface ContactPageProps {
    params: Promise<{
        clubSlug: string;
    }>;
}

type ContactPerson = Awaited<
    ReturnType<typeof getPublicInstructorContacts>
>[number];

const primaryBoardContactRoles = ["CHAIRMAN", "TREASURER"];

function getRoleLabel(role?: string | null) {
    switch (role) {
        case "CHAIRMAN":
            return "Formand";
        case "VICE_CHAIRMAN":
            return "Næstformand";
        case "TREASURER":
            return "Kasserer";
        case "BOARD_MEMBER":
            return "Bestyrelsesmedlem";
        case "BOARD_SUPPLEANT":
            return "Suppleant";
        case "REGULAR":
            return "Medlem";
        default:
            return role || null;
    }
}

function ContactCard({
                         person,
                         badgeLabel,
                     }: {
    person: ContactPerson;
    badgeLabel: string;
}) {
    const roleLabel = getRoleLabel(person.memberRoleType);

    return (
        <ThemedSectionCard className="flex h-full flex-col p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-4">
                <Avatar
                    imageUrl={person.profileImageUrl}
                    name={person.displayName}
                    size="lg"
                    shape="rounded"
                    className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                />

                <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold leading-tight text-[var(--public-text)] sm:text-xl">
                        {person.displayName}
                    </h3>

                    {roleLabel && roleLabel !== "Medlem" ? (
                        <p className="mt-1 truncate text-sm font-semibold text-[var(--public-text-muted)]">
                            {roleLabel}
                        </p>
                    ) : null}

                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--public-primary)]">
                        {badgeLabel}
                    </p>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-3">
                {person.email ? (
                    <a
                        href={`mailto:${person.email}`}
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
              {person.email}
            </span>
                    </a>
                ) : null}

                {person.mobilePhone ? (
                    <a
                        href={`tel:${person.mobilePhone.replaceAll(" ", "")}`}
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
              {person.mobilePhone}
            </span>
                    </a>
                ) : null}
            </div>
        </ThemedSectionCard>
    );
}

function ContactSection({
                            title,
                            description,
                            people,
                            badgeLabel,
                            emptyText,
                        }: {
    title: string;
    description: string;
    people: ContactPerson[];
    badgeLabel: string;
    emptyText: string;
}) {
    return (
        <section>
            <div className="mb-5">
                <h2 className="text-2xl font-bold tracking-tight text-[var(--public-text)]">
                    {title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--public-text-muted)] sm:text-base">
                    {description}
                </p>
            </div>

            {people.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {people.map((person) => (
                        <ContactCard
                            key={person.id ?? person.displayName}
                            person={person}
                            badgeLabel={badgeLabel}
                        />
                    ))}
                </div>
            ) : (
                <ThemedSectionCard className="py-10 text-center">
                    <p className="text-base italic text-[var(--public-text-muted)]">
                        {emptyText}
                    </p>
                </ThemedSectionCard>
            )}
        </section>
    );
}

export default async function ContactPage({ params }: ContactPageProps) {
    const { clubSlug } = await params;
    const pageSlug = "kontakt";

    const {
        club,
        theme,
        footerData,
        navigationItems,
        actionItems,
        publicSettings,
    } = await resolvePublicPageForClub(clubSlug, pageSlug);

    const contacts = await getPublicInstructorContacts(club.id);

    const primaryBoardContacts = contacts.filter((person) =>
        primaryBoardContactRoles.includes(person.memberRoleType || "")
    );

    const instructors = contacts.filter((person) => person.isInstructor);

    return (
        <ThemedClubPageShell
            clubSlug={clubSlug}
            clubName={club.settings?.shortName || club.name}
            clubDisplayName={club.settings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
            theme={theme}
            publicThemeMode={publicSettings?.publicThemeMode}
            footerData={footerData}
            navigationItems={navigationItems}
            actionItems={actionItems}
            title="Kontakt"
            subtitle="Find klubbens formand, kasserer og instruktører."
            currentPath={publicRoutes.contact(clubSlug)}
        >
            <div className="mt-6 space-y-12">
                <ContactSection
                    title="Formand og kasserer"
                    description="Her finder du klubbens primære kontaktpersoner for ledelse og økonomi."
                    people={primaryBoardContacts}
                    badgeLabel="Bestyrelse"
                    emptyText="Der er endnu ikke registreret formand eller kasserer til offentlig visning."
                />

                <div className="border-t border-[var(--public-card-border)] pt-10">
                    <ContactSection
                        title="Instruktører"
                        description="Her finder du klubbens instruktører, som kan hjælpe med skoleflyvning, certifikater og praktiske spørgsmål."
                        people={instructors}
                        badgeLabel="Instruktør"
                        emptyText="Der er endnu ikke registreret instruktører til offentlig visning."
                    />
                </div>
            </div>
        </ThemedClubPageShell>
    );
}