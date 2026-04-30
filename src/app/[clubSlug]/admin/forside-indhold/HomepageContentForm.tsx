"use client";

import React from "react";
import dynamic from "next/dynamic";
import { HomepageContent, HomepageContentSignupMode, HomepageContentVisibility } from "../../../../generated/prisma";
import Link from "next/link";
import { saveHomepageContentAction } from "../../../../lib/homepageContent/homepageContentActions";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";

const RichTextEditor = dynamic(() => import("../../../../components/admin/articles/ArticleRichTextEditor"), {
  ssr: false,
});

interface HomepageContentFormProps {
  clubSlug: string;
  initialData?: HomepageContent;
}

export default function HomepageContentForm({
  clubSlug,
  initialData,
}: HomepageContentFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [bodyHtml, setBodyHtml] = React.useState(initialData?.bodyHtml || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get("title") as string,
      bodyHtml: bodyHtml,
      isActive: formData.get("isActive") === "true",
      visibility: formData.get("visibility") as HomepageContentVisibility,
      visibleFrom: formData.get("visibleFrom") ? new Date(formData.get("visibleFrom") as string) : null,
      visibleUntil: formData.get("visibleUntil") ? new Date(formData.get("visibleUntil") as string) : null,
      sortOrder: parseInt(formData.get("sortOrder") as string, 10) || 0,
      signupMode: formData.get("signupMode") as HomepageContentSignupMode,
      signupLabel: (formData.get("signupLabel") as string) || null,
      isSignupClosed: formData.get("isSignupClosed") === "true",
      signupDeadlineAt: formData.get("signupDeadlineAt") ? new Date(formData.get("signupDeadlineAt") as string) : null,
    };

    try {
      await saveHomepageContentAction(clubSlug, initialData?.id || null, data);
      router.push(`/${clubSlug}/admin/forside-indhold`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Der skete en fejl");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label className="admin-form-label">Titel (overskrift)</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialData?.title}
              className="admin-input"
              placeholder="Indtast overskrift..."
            />
          </div>

          <div style={{ marginBottom: '0' }}>
            <label className="admin-form-label">Indhold (tekst/HTML)</label>
            <div style={{ minHeight: '300px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <RichTextEditor
                content={bodyHtml}
                onChange={setBodyHtml}
              />
            </div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '24px' }}>
          <h3 className="admin-section-title">Tilmelding</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="admin-form-label">Tilmeldings-type</label>
              <select
                name="signupMode"
                defaultValue={initialData?.signupMode || HomepageContentSignupMode.NONE}
                className="admin-select"
              >
                <option value={HomepageContentSignupMode.NONE}>Ingen tilmelding</option>
                <option value={HomepageContentSignupMode.ONE_PER_MEMBER}>Én pr. medlem</option>
                <option value={HomepageContentSignupMode.QUANTITY}>Antal (f.eks. madbestilling)</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label">Knap tekst (valgfri)</label>
              <input
                name="signupLabel"
                type="text"
                defaultValue={initialData?.signupLabel || ""}
                className="admin-input"
                placeholder="F.eks. 'Tilmeld', 'Bestil'..."
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label className="admin-form-label">Tilmeldingsfrist</label>
            <input
              name="signupDeadlineAt"
              type="datetime-local"
              defaultValue={initialData?.signupDeadlineAt ? new Date(initialData.signupDeadlineAt.getTime() - initialData.signupDeadlineAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
              className="admin-input"
            />
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '6px' }}>
              Når fristen er passeret, vises opslaget stadig, men medlemmer kan ikke længere tilmelde eller ændre tilmelding.
            </p>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 500 }}>
              <input
                name="isSignupClosed"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.isSignupClosed}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Luk for tilmelding manuelt</span>
            </label>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '6px', marginLeft: '28px' }}>
              Overstyrer tidsfristen og lukker med det samme.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="admin-card" style={{ padding: '24px' }}>
          <h3 className="admin-section-title">Publicering</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="admin-form-label">Status</label>
            <select
              name="isActive"
              defaultValue={initialData?.isActive ? "true" : "false"}
              className="admin-select"
            >
              <option value="false">Inaktiv (skjult)</option>
              <option value="true">Aktiv (vises)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="admin-form-label">Synlighed</label>
            <select
              name="visibility"
              defaultValue={initialData?.visibility || HomepageContentVisibility.PUBLIC}
              className="admin-select"
            >
              <option value={HomepageContentVisibility.PUBLIC}>Offentlig (alle)</option>
              <option value={HomepageContentVisibility.MEMBERS_ONLY}>Kun medlemmer</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="admin-form-label">Rækkefølge (sortOrder)</label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={initialData?.sortOrder || 0}
              className="admin-input"
            />
          </div>
        </div>

        <div className="admin-card" style={{ padding: '24px' }}>
          <h3 className="admin-section-title">Periode (valgfri)</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label className="admin-form-label">Vis fra</label>
            <input
              name="visibleFrom"
              type="datetime-local"
              defaultValue={initialData?.visibleFrom ? new Date(initialData.visibleFrom.getTime() - initialData.visibleFrom.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
              className="admin-input"
            />
          </div>

          <div style={{ marginBottom: '0' }}>
            <label className="admin-form-label">Vis indtil</label>
            <input
              name="visibleUntil"
              type="datetime-local"
              defaultValue={initialData?.visibleUntil ? new Date(initialData.visibleUntil.getTime() - initialData.visibleUntil.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
              className="admin-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Save size={18} />
            {isPending ? 'Gemmer...' : 'Gem opslag'}
          </button>
          <Link
            href={`/${clubSlug}/admin/forside-indhold`}
            className="admin-btn"
            style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ChevronLeft size={18} />
            Fortryd
          </Link>
        </div>
      </div>
    </form>
  );
}
