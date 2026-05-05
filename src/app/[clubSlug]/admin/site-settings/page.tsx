import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import WeatherSettingsForm from "./WeatherSettingsForm";
import PublicThemeSettingsForm from "./PublicThemeSettingsForm";
import PublicHomepageSettingsForm from "./PublicHomepageSettingsForm";
import { getClubSettings } from "@/lib/admin/siteSettingsService";
import { listClubMediaAssets } from "@/lib/media/mediaStorageService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    {children}
  </div>
);

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/site-settings`);
  const settings = await getClubSettings(club.id);
  const mediaAssets = await listClubMediaAssets(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="min-h-screen bg-[#0b1220] -m-6 p-6">
        <div className="max-w-[800px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Site Settings</h1>
            <p className="text-slate-400 text-lg">Konfiguration af klub-indstillinger og præferencer.</p>
          </div>

          <GlassCard className="p-8 mb-8">
            <PublicThemeSettingsForm
              clubId={club.id}
              clubSlug={clubSlug}
              initialThemeMode={settings?.publicThemeMode ?? "light"}
            />
          </GlassCard>

          <GlassCard className="p-8 mb-8">
            <PublicHomepageSettingsForm
              clubId={club.id}
              clubSlug={clubSlug}
              initialValues={settings}
              mediaAssets={mediaAssets}
            />
          </GlassCard>

          <GlassCard className="p-8">
            <WeatherSettingsForm 
              clubId={club.id} 
              clubSlug={clubSlug} 
              initialLatitude={settings?.weatherLatitude ?? null}
              initialLongitude={settings?.weatherLongitude ?? null}
            />
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  );
}
