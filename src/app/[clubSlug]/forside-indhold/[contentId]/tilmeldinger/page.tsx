import React from "react";
import { resolveClubContext } from "../../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../../components/publicSite/ThemedClubPageShell";
import { ThemedSectionCard } from "../../../../../components/publicSite/ThemedBuildingBlocks";
import { getHomepageContentById, getVisibleSignupsForContent } from "../../../../../lib/homepageContent/homepageContentService";
import { notFound, redirect } from "next/navigation";
import { formatMemberName } from "../../../../../lib/members/memberHelpers";
import { HomepageContentSignupMode } from "../../../../../generated/prisma";
import { Users, Calendar, Hash, MessageSquare } from "lucide-react";
import Link from "next/link";
import { publicRoutes } from "../../../../../lib/publicRoutes";

interface ParticipantListPageProps {
  params: Promise<{
    clubSlug: string;
    contentId: string;
  }>;
}

export default async function ParticipantListPage({ params }: ParticipantListPageProps) {
  const { clubSlug, contentId } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems, viewer } = context;

  if (!viewer.isAuthenticated || !viewer.isMember) {
    redirect(`${publicRoutes.login(clubSlug)}?callbackUrl=${publicRoutes.homepageContentSignups(clubSlug, contentId)}`);
  }

  const content = await getHomepageContentById(contentId, club.id);
  if (!content || content.signupMode === HomepageContentSignupMode.NONE) {
    notFound();
  }

  const signups = await getVisibleSignupsForContent(contentId, club.id);
  const quantityTotal = signups.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      logoUrl={club.settings?.logoUrl ?? null}
      logoAltText={club.settings?.logoAltText ?? null}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={`Tilmeldinger: ${content.title}`}
      currentPath={publicRoutes.homepageContentSignups(clubSlug, contentId)}
    >
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[var(--public-text-soft)]">
        <div className="flex items-center gap-1.5 bg-[var(--public-surface)] px-3 py-1.5 rounded-lg border border-[var(--public-card-border)]">
          <Users size={16} className="text-[var(--public-primary)]" />
          <span className="text-[var(--public-text)] font-medium">{signups.length}</span>
          <span>{content.signupMode === HomepageContentSignupMode.QUANTITY ? 'bestillinger' : 'deltagere'}</span>
        </div>
        {content.signupMode === HomepageContentSignupMode.QUANTITY && quantityTotal > signups.length && (
          <div className="flex items-center gap-1.5 bg-[var(--public-surface)] px-3 py-1.5 rounded-lg border border-[var(--public-card-border)]">
            <Hash size={16} className="text-[var(--public-success)]" />
            <span className="text-[var(--public-text)] font-medium">{quantityTotal}</span>
            <span>antal i alt</span>
          </div>
        )}
      </div>

      <ThemedSectionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--public-card-border)]">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--public-text-soft)]">Deltager</th>
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--public-text-soft)]">Antal</th>
                )}
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--public-text-soft)]">Note</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--public-text-soft)]">Tilmeldt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--public-card-border)]">
              {signups.length > 0 ? signups.map((signup) => (
                <tr key={signup.id} className="group hover:bg-[var(--public-surface)] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--public-text)] group-hover:text-[var(--public-primary)] transition-colors">
                      {formatMemberName(signup.user)}
                    </div>
                  </td>
                  {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[var(--public-surface)] px-2.5 py-0.5 rounded text-sm font-medium text-[var(--public-success)] border border-[var(--public-success-border)]">
                          {signup.quantity}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {signup.note ? (
                      <div className="flex items-start gap-2 text-[var(--public-text-muted)] text-sm italic max-w-xs sm:max-w-md">
                        <MessageSquare size={14} className="mt-1 flex-shrink-0 opacity-50" />
                        <span>{signup.note}</span>
                      </div>
                    ) : (
                      <span className="text-[var(--public-text-soft)]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5 text-xs text-[var(--public-text-soft)]">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(signup.createdAt).toLocaleDateString('da-DK')}
                      </div>
                      <div>
                        {new Date(signup.createdAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={content.signupMode === HomepageContentSignupMode.QUANTITY ? 4 : 3} className="px-5 py-12 text-center text-[var(--public-text-soft)]">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="opacity-20" />
                      <p>Ingen tilmeldinger endnu.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ThemedSectionCard>

      <div className="mt-8 flex justify-center">
        <Link 
          href={publicRoutes.home(clubSlug)}
          className="public-secondary-button"
        >
          Tilbage til forsiden
        </Link>
      </div>
    </ThemedClubPageShell>
  );
}
