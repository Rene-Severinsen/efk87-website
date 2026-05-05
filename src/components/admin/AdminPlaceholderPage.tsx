import { AdminPageSection } from "./AdminPagePrimitives";

interface AdminPlaceholderPageProps {
  title: string;
  description: string;
  futureItems?: string[];
}

export default function AdminPlaceholderPage({
  title,
  description,
  futureItems = [],
}: AdminPlaceholderPageProps) {
  return (
    <div className="admin-page-content">
      <AdminPageSection>
        <div style={{ display: "grid", gap: "20px" }}>
          <div>
            <h2 className="admin-section-title" style={{ marginBottom: "8px" }}>
              {title}
            </h2>
            <p className="admin-muted" style={{ margin: 0 }}>
              {description}
            </p>
          </div>

          {futureItems.length > 0 ? (
            <div>
              <div className="admin-badge admin-badge-warning" style={{ marginBottom: "14px" }}>
                Kommende funktionalitet
              </div>

              <ul className="admin-placeholder-list">
                {futureItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="admin-soft" style={{ margin: 0, fontStyle: "italic" }}>
            Real funktionalitet vil blive implementeret løbende.
          </p>
        </div>
      </AdminPageSection>
    </div>
  );
}
