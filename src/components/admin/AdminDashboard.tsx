import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDashboardOverview } from "../../lib/admin/adminDashboardService";
import "./AdminDashboard.css";

interface AdminDashboardProps {
  clubSlug: string;
  clubName: string;
  dashboard: AdminDashboardOverview;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DashboardCard({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ color: "white", fontSize: "1.1rem", fontWeight: 850, margin: 0 }}>
            {title}
          </h2>
          {description ? (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>
              {description}
            </p>
          ) : null}
        </div>

        {href ? (
          <Link href={href} className="admin-btn" style={{ whiteSpace: "nowrap" }}>
            Åbn
          </Link>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  href,
  tone = "blue",
}: {
  label: string;
  value: number;
  href: string;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const toneMap = {
    blue: {
      bg: "rgba(14, 165, 233, 0.12)",
      border: "rgba(14, 165, 233, 0.28)",
      color: "#7dd3fc",
    },
    green: {
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.28)",
      color: "#86efac",
    },
    amber: {
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.28)",
      color: "#fcd34d",
    },
    slate: {
      bg: "rgba(148, 163, 184, 0.10)",
      border: "rgba(148, 163, 184, 0.18)",
      color: "#cbd5e1",
    },
  }[tone];

  return (
    <Link
      href={href}
      style={{
        display: "grid",
        gap: "8px",
        padding: "18px",
        borderRadius: "20px",
        background: toneMap.bg,
        border: `1px solid ${toneMap.border}`,
        textDecoration: "none",
      }}
    >
      <div style={{ color: toneMap.color, fontSize: "2rem", fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: "0.86rem", fontWeight: 750 }}>
        {label}
      </div>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#94a3b8",
        fontSize: "0.9rem",
      }}
    >
      {text}
    </div>
  );
}

export default function AdminDashboard({
  clubSlug,
  clubName,
  dashboard,
}: AdminDashboardProps) {
  const latestForumActivity = dashboard.latestForumActivity ?? [];
  const latestHomepageSignups = dashboard.latestHomepageSignups ?? [];

  return (
    <div className="admin-dashboard">
      <header
        className="admin-card"
        style={{
          padding: "28px",
          marginBottom: "24px",
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.16), rgba(15,23,42,0.78))",
        }}
      >
        <div style={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Overblik
        </div>
        <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 900, marginTop: "8px", marginBottom: "8px" }}>
          {clubName} Admin
        </h1>
        <p style={{ color: "#cbd5e1", maxWidth: "760px", lineHeight: 1.6 }}>
          Driftsblik på medlemmer, forum, public site, flyveskole og dagens aktivitet.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <KpiCard
          label="Aktive medlemmer"
          value={dashboard.kpis.activeMembers}
          href={`/${clubSlug}/admin/medlemmer`}
          tone="green"
        />
        <KpiCard
          label="Forumtråde"
          value={dashboard.kpis.forumThreads}
          href={`/${clubSlug}/admin/forum`}
          tone="amber"
        />
        <KpiCard
          label="Publicerede artikler"
          value={dashboard.kpis.publishedArticles}
          href={`/${clubSlug}/admin/artikler`}
          tone="blue"
        />
        <KpiCard
          label="Publicerede gallerier"
          value={dashboard.kpis.publishedGalleryAlbums}
          href={`/${clubSlug}/admin/galleri`}
          tone="slate"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.25fr) minmax(360px, 0.75fr)",
          gap: "24px",
        }}
      >
        <div style={{ display: "grid", gap: "24px" }}>
          <DashboardCard
            title="Dagens aktivitet"
            description="Aktivitet i dag på tværs af flyvemeldinger, flyveskole og forsidetilmeldinger."
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
              <KpiCard label="Jeg flyver" value={dashboard.today.flightIntents} href={`/${clubSlug}/admin/flyvemeldinger`} />
              <KpiCard label="Skoledage" value={dashboard.today.flightSchoolSessions} href={`/${clubSlug}/admin/flyveskole`} />
              <KpiCard label="Skolebookinger" value={dashboard.today.flightSchoolBookings} href={`/${clubSlug}/admin/flyveskole`} />
              <KpiCard label="Forside-tilmeldinger" value={dashboard.today.homepageSignups} href={`/${clubSlug}/admin/forside-indhold`} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Public site"
            description="De vigtigste public-indholdsflader."
            href={`/${clubSlug}`}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
              <KpiCard label="Aktive forsidebokse" value={dashboard.content.activeHomepageBoxes} href={`/${clubSlug}/admin/forside-indhold`} />
              <KpiCard label="Tilmeldingsopslag" value={dashboard.content.signupEnabledHomepageBoxes} href={`/${clubSlug}/admin/forside-indhold`} />
              <KpiCard label="Forumkategorier" value={dashboard.content.forumCategories} href={`/${clubSlug}/admin/forum`} />
              <KpiCard label="Forside-gallerier" value={dashboard.content.publicHomepageGalleryAlbums} href={`/${clubSlug}/admin/galleri`} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Forum aktivitet"
            description="Seneste aktivitet i klubbens forum."
            href={`/${clubSlug}/admin/forum`}
          >
            {latestForumActivity.length > 0 ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {latestForumActivity.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/${clubSlug}/forum/${thread.categorySlug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      gap: "12px",
                      alignItems: "center",
                      padding: "14px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      textDecoration: "none",
                      color: "white",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        {thread.isPinned ? <span title="Fastgjort">📌</span> : null}
                        {thread.isLocked ? <span title="Låst">🔒</span> : null}
                        <span style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {thread.title}
                        </span>
                      </div>
                      <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "0.82rem" }}>
                        {thread.categoryTitle} · {thread.replyCount} svar · {thread.authorName || "Ukendt"} · {formatDateTime(thread.lastActivityAt)}
                      </div>
                    </div>

                    <span style={{ color: "#7dd3fc", fontSize: "0.8rem", fontWeight: 850 }}>
                      Åbn
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState text="Ingen forumaktivitet endnu." />
            )}
          </DashboardCard>
        </div>

        <div style={{ display: "grid", gap: "24px" }}>
          <DashboardCard
            title="Seneste forsidetilmeldinger"
            description="Tilmeldinger til opslag på forsiden."
            href={`/${clubSlug}/admin/forside-indhold`}
          >
            {latestHomepageSignups.length > 0 ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {latestHomepageSignups.map((signup) => (
                  <div
                    key={signup.id}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ color: "white", fontWeight: 800 }}>{signup.userName || "Ukendt bruger"}</div>
                    <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "0.82rem" }}>
                      {signup.contentTitle} · Antal {signup.quantity} · {formatDateTime(signup.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="Ingen aktive tilmeldinger." />
            )}
          </DashboardCard>

          <DashboardCard
            title="Hurtige genveje"
            description="De steder du sandsynligvis bruger mest."
          >
            <div style={{ display: "grid", gap: "10px" }}>
              {[
                ["Medlemmer", `/${clubSlug}/admin/medlemmer`],
                ["Forum", `/${clubSlug}/admin/forum`],
                ["Forsideindhold", `/${clubSlug}/admin/forside-indhold`],
                ["Flyveskole", `/${clubSlug}/admin/flyveskole`],
                ["Galleri", `/${clubSlug}/admin/galleri`],
                ["Site indstillinger", `/${clubSlug}/admin/site-settings`],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="admin-btn"
                  style={{ justifyContent: "space-between" }}
                >
                  {label}
                  <span>→</span>
                </Link>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
