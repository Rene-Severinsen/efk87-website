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
      className="admin-card scroll-mt-6 overflow-hidden"
    >
      <div className="admin-card-accent" />

      <div className="admin-card-header">
        <h2 className="admin-section-title">
          {title}
        </h2>
        <p className="admin-muted mt-1 max-w-3xl text-sm leading-6">
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
    <aside className="admin-card sticky top-6 hidden h-fit p-4 xl:block">
      <div className="mb-4 px-2">
        <div className="admin-kicker">
          Indstillinger
        </div>
        <p className="admin-soft mt-1 text-xs leading-5">
          Klubopsætning for public site.
        </p>
      </div>

      <nav className="grid gap-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={`/${clubSlug}/admin/site-settings${item.href}`}
            className="admin-settings-nav-item"
          >
            <div className="admin-strong">{item.title}</div>
            <div className="admin-soft mt-0.5 text-xs">{item.description}</div>
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

      <div className="admin-page-content">
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
    </AdminShell>
  );
}
