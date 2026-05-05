import Link from "next/link";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: ReactNode;
  };
}

export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-page-hero">
      <div className="admin-page-hero-copy">
        {kicker ? <div className="admin-page-kicker">{kicker}</div> : null}
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>

      {action ? (
        <Link href={action.href} className="admin-btn admin-btn-primary admin-page-action">
          {action.icon}
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}

interface AdminStatTileProps {
  label: string;
  value: number | string;
  href?: string;
  tone?: "blue" | "green" | "amber" | "slate" | "rose" | "violet";
  active?: boolean;
}

export function AdminStatTile({
  label,
  value,
  href,
  tone = "blue",
  active = false,
}: AdminStatTileProps) {
  const content = (
    <>
      <div className="admin-stat-tile-label">{label}</div>
      <div className="admin-stat-tile-value">{value}</div>
      {active ? <span className="admin-stat-tile-dot" /> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`admin-stat-tile admin-stat-tile--${tone} ${active ? "is-active" : ""}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`admin-stat-tile admin-stat-tile--${tone} ${active ? "is-active" : ""}`}>
      {content}
    </div>
  );
}

export function AdminStatTileGrid({
  children,
  columns = "auto",
}: {
  children: ReactNode;
  columns?: "auto" | "four" | "nine";
}) {
  return (
    <div className={`admin-stat-tile-grid admin-stat-tile-grid--${columns}`}>
      {children}
    </div>
  );
}

export function AdminPageSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`admin-card admin-page-section ${className}`}>{children}</section>;
}
