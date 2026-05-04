"use client";

import { useMemo, useState } from "react";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import Avatar from "../../../components/shared/Avatar";
import { getMemberDirectoryForClub } from "../../../lib/members/memberProfileService";

type MemberDirectoryItem = Awaited<ReturnType<typeof getMemberDirectoryForClub>>[number];

interface MembersDirectoryProps {
    members: MemberDirectoryItem[];
}

function getDisplayName(firstName: string | null, lastName: string | null): string {
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();
    return name || "Medlem";
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

function getSearchValue(member: MemberDirectoryItem): string {
    const displayName = getDisplayName(member.firstName, member.lastName);

    return [
        displayName,
        member.firstName,
        member.lastName,
        member.addressLine,
        member.postalCode,
        member.city,
        member.email,
        member.mobilePhone,
        member.memberNumber?.toString(),
        member.mdkNumber,
        ...member.certificates,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}

function MemberCard({ member }: { member: MemberDirectoryItem }) {
    const displayName = getDisplayName(member.firstName, member.lastName);
    const addressLines = getAddressLines(member.addressLine, member.postalCode, member.city);
    const certificateCount = member.certificates.length;

    return (
        <ThemedSectionCard className="flex h-full min-h-[23rem] flex-col p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-4">
                <Avatar
                    imageUrl={member.profileImageUrl}
                    name={displayName}
                    size="lg"
                    shape="rounded"
                    className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold leading-tight text-[var(--public-text)] sm:text-xl">
                                {displayName}
                            </h2>

                            {addressLines.length > 0 ? (
                                <div className="mt-1 text-sm font-normal leading-snug text-[var(--public-text)] sm:text-base">
                                    {addressLines.map((line) => (
                                        <span key={line} className="block">
                      {line}
                    </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm font-normal text-[var(--public-text-muted)] sm:text-base">
                                    Adresse ikke angivet
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="inline-flex items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] px-2.5 py-1 text-xs font-semibold leading-none text-[var(--public-primary)]">
                Nr. {member.memberNumber ?? "—"}
              </span>

                            {member.mdkNumber ? (
                                <span className="inline-flex items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] px-2.5 py-1 text-xs font-semibold leading-none text-[var(--public-primary)]">
                  MDK {member.mdkNumber}
                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
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

            <div className="mt-auto pt-5">
                {certificateCount > 0 ? (
                    <details className="group border-t border-[var(--public-card-border)] pt-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 py-1 text-sm font-semibold text-[var(--public-text)] transition hover:text-[var(--public-primary)] [&::-webkit-details-marker]:hidden">
                            <span>Certifikater ({certificateCount})</span>

                            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-[var(--public-primary)] shadow-sm transition group-open:rotate-180">
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
                      strokeWidth="2.5"
                      d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
                        </summary>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {member.certificates.map((certificate) => (
                                <span
                                    key={certificate}
                                    className="inline-flex items-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface-muted)] px-2.5 py-1 text-xs font-medium leading-none text-[var(--public-text)]"
                                >
                  {formatCertificate(certificate)}
                </span>
                            ))}
                        </div>
                    </details>
                ) : (
                    <div className="border-t border-[var(--public-card-border)] pt-4">
            <span className="text-sm font-normal text-[var(--public-text-muted)]">
              Ingen certifikater registreret
            </span>
                    </div>
                )}
            </div>
        </ThemedSectionCard>
    );
}

export default function MembersDirectory({ members }: MembersDirectoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    const filteredMembers = useMemo(() => {
        if (!normalizedSearchTerm) return members;

        return members.filter((member) => getSearchValue(member).includes(normalizedSearchTerm));
    }, [members, normalizedSearchTerm]);

    return (
        <section className="space-y-5">
            <ThemedSectionCard className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <label
                            htmlFor="member-search"
                            className="public-label text-sm font-semibold text-[var(--public-text)]"
                        >
                            Søg medlem
                        </label>

                        <p className="mt-1 text-sm font-normal text-[var(--public-text-muted)]">
                            Søg på navn, adresse, telefon, email, medlemsnr., MDK nr. eller certifikat.
                        </p>
                    </div>

                    <div className="w-full sm:max-w-md">
                        <input
                            id="member-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Skriv for at søge..."
                            className="public-input w-full"
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="mt-3 text-sm font-normal text-[var(--public-text-muted)]">
                    Viser {filteredMembers.length} af {members.length} medlemmer
                </div>
            </ThemedSectionCard>

            {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                    {filteredMembers.map((member) => (
                        <MemberCard key={member.userId} member={member} />
                    ))}
                </div>
            ) : (
                <ThemedSectionCard className="py-10 text-center">
                    <p className="text-base font-normal text-[var(--public-text-muted)]">
                        Ingen medlemmer matcher din søgning.
                    </p>
                </ThemedSectionCard>
            )}
        </section>
    );
}