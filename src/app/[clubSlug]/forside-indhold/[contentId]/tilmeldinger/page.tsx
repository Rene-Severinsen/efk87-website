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
    redirect(`/${clubSlug}/login?callbackUrl=/${clubSlug}/forside-indhold/${contentId}/tilmeldinger`);
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
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={`Tilmeldinger: ${content.title}`}
      currentPath={`/${clubSlug}/forside-indhold/${contentId}/tilmeldinger`}
    >
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <Users size={16} className="text-sky-400" />
          <span className="text-white font-medium">{signups.length}</span>
          <span>{content.signupMode === HomepageContentSignupMode.QUANTITY ? 'bestillinger' : 'deltagere'}</span>
        </div>
        {content.signupMode === HomepageContentSignupMode.QUANTITY && quantityTotal > signups.length && (
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Hash size={16} className="text-emerald-400" />
            <span className="text-white font-medium">{quantityTotal}</span>
            <span>antal i alt</span>
          </div>
        )}
      </div>

      <ThemedSectionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Deltager</th>
                {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Antal</th>
                )}
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Note</th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Tilmeldt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {signups.length > 0 ? signups.map((signup) => (
                <tr key={signup.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white group-hover:text-sky-400 transition-colors">
                      {formatMemberName(signup.user)}
                    </div>
                  </td>
                  {content.signupMode === HomepageContentSignupMode.QUANTITY && (
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-white/5 px-2.5 py-0.5 rounded text-sm font-medium text-emerald-400 border border-emerald-500/20">
                          {signup.quantity}
                        </span>
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {signup.note ? (
                      <div className="flex items-start gap-2 text-slate-400 text-sm italic max-w-xs sm:max-w-md">
                        <MessageSquare size={14} className="mt-1 flex-shrink-0 opacity-50" />
                        <span>{signup.note}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5 text-xs text-slate-500">
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
                  <td colSpan={content.signupMode === HomepageContentSignupMode.QUANTITY ? 4 : 3} className="px-5 py-12 text-center text-slate-500">
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
          href={`/${clubSlug}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all text-sm font-semibold"
        >
          Tilbage til forsiden
        </Link>
      </div>
    </ThemedClubPageShell>
  );
}
