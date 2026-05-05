import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPagePrimitives";
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

function SettingsCard({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#121b2e]/80 shadow-2xl backdrop-blur-md"
    >
      <div className="h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-40" />

      <div className="border-b border-white/10 px-7 py-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <div className="p-7">
        {children}
      </div>
    </section>
  );
}

function SettingsNav({
  clubSlug,
}: {
  clubSlug: string;
}) {
  const items = [
    {
      href: "#offentligt-tema",
      title: "Offentligt tema",
      description: "Lys/mørk public visning",
    },
    {
      href: "#public-forside",
      title: "Public forside",
      description: "Hero, intro og CTA",
    },
    {
      href: "#vejr",
      title: "Vejr",
      description: "Koordinater til hero",
    },
  ];

  return (
    <aside className="sticky top-6 hidden h-fit rounded-3xl border border-white/10 bg-[#121b2e]/80 p-4 shadow-2xl backdrop-blur-md xl:block">
      <div className="mb-4 px-2">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
          Indstillinger
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Klubopsætning for public site.
        </p>
      </div>

      <nav className="grid gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={`/${clubSlug}/admin/site-settings${item.href}`}
            className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm transition hover:border-sky-500/40 hover:bg-white/[0.06]"
          >
            <div className="font-extrabold text-white">{item.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">{item.description}</div>
          </a>
        ))}
      </nav>
    </aside>
  );
}

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

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/site-settings`,
  );

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
      <AdminPageHeader
        title="Site settings"
        description="Konfiguration af klub-indstillinger, public forside, tema og vejr."
      />

      <div className="-m-6 min-h-screen bg-[#0b1220] p-6">
        <div className="mx-auto max-w-[1180px] pt-6">

          <div className="grid gap-8">
            

            <div className="grid gap-8">
              <SettingsCard
                id="offentligt-tema"
                title="Offentligt tema"
                description="Vælg om public site skal vises med lyst eller mørkt tema. Light premium er standard."
              >
                <PublicThemeSettingsForm
                  clubId={club.id}
                  clubSlug={clubSlug}
                  initialThemeMode={settings?.publicThemeMode ?? "light"}
                />
              </SettingsCard>

              <SettingsCard
                id="public-forside"
                title="Public forside"
                description="Vedligehold hero, knapper, introsektion og public CTA-band på forsiden."
              >
                <PublicHomepageSettingsForm
                  clubId={club.id}
                  clubSlug={clubSlug}
                  initialValues={settings}
                  mediaAssets={mediaAssets}
                />
              </SettingsCard>

              <SettingsCard
                id="vejr"
                title="Vejr"
                description="Koordinater bruges til vejrudsigten i hero-sektionen på forsiden."
              >
                <WeatherSettingsForm
                  clubId={club.id}
                  clubSlug={clubSlug}
                  initialLatitude={settings?.weatherLatitude ?? null}
                  initialLongitude={settings?.weatherLongitude ?? null}
                />
              </SettingsCard>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
