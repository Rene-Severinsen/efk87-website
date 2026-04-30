"use client";

import React from "react";
import { HomepageContent, HomepageContentSignupMode, HomepageContentVisibility } from "../../../../generated/prisma";
import { Edit2, Users, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { deleteHomepageContentAction, updateHomepageContentSortOrderAction } from "../../../../lib/homepageContent/homepageContentActions";
import { isHomepageContentSignupClosed } from "../../../../lib/homepageContent/homepageContentUtils";

interface HomepageContentListProps {
  contents: (HomepageContent & { _count: { signups: number } })[];
  clubSlug: string;
}

const HomepageContentList: React.FC<HomepageContentListProps> = ({ contents, clubSlug }) => {
  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Er du sikker på, at du vil slette "${title}"?`)) {
      try {
        await deleteHomepageContentAction(clubSlug, id);
      } catch (error) {
        alert("Der skete en fejl ved sletning: " + (error as Error).message);
      }
    }
  };

  const handleSort = async (id: string, currentSort: number, direction: 'up' | 'down') => {
    const newSort = direction === 'up' ? currentSort - 1 : currentSort + 1;
    try {
      await updateHomepageContentSortOrderAction(clubSlug, id, newSort);
    } catch (error) {
      console.error("Sort order update failed", error);
    }
  };

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Sort</th>
              <th>Titel</th>
              <th>Status</th>
              <th>Synlighed</th>
              <th>Tilmelding</th>
              <th style={{ textAlign: 'right' }}>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {contents.length > 0 ? contents.map((content) => (
              <tr key={content.id}>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={() => handleSort(content.id, content.sortOrder, 'up')}
                      className="admin-btn admin-btn-ghost"
                      style={{ padding: '4px' }}
                      title="Flyt op"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleSort(content.id, content.sortOrder, 'down')}
                      className="admin-btn admin-btn-ghost"
                      style={{ padding: '4px' }}
                      title="Flyt ned"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{content.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    Ordre: {content.sortOrder}
                  </div>
                </td>
                <td>
                  <span className={`admin-badge ${content.isActive ? 'admin-badge-success' : 'admin-badge-draft'}`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: content.isActive ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: content.isActive ? '#52c41a' : 'var(--admin-text-muted)'
                  }}>
                    {content.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    {content.isActive ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  {(content.visibleFrom || content.visibleUntil) && (
                    <div style={{ fontSize: '0.7rem', marginTop: '4px', color: 'var(--admin-text-muted)' }}>
                      {content.visibleFrom ? new Date(content.visibleFrom).toLocaleDateString('da-DK') : '...'} 
                      {' - '}
                      {content.visibleUntil ? new Date(content.visibleUntil).toLocaleDateString('da-DK') : '...'}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem' }}>
                    {content.visibility === HomepageContentVisibility.PUBLIC ? 'Offentlig' : 'Kun medlemmer'}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.85rem' }}>
                    {content.signupMode === HomepageContentSignupMode.NONE ? (
                      <span style={{ color: 'var(--admin-text-muted)' }}>Ingen</span>
                    ) : (
                      <>
                        <div>{content.signupMode === HomepageContentSignupMode.ONE_PER_MEMBER ? 'En pr. medlem' : 'Antal'}</div>
                        <div style={{ fontWeight: 600, color: '#1890ff' }}>{content._count.signups} tilmeldte</div>
                        
                        {content.isSignupClosed && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '3px', fontWeight: 600 }}>Lukket manuelt</span>
                          </div>
                        )}
                        
                        {content.signupDeadlineAt && (
                          <div style={{ marginTop: '4px', fontSize: '0.7rem', color: isHomepageContentSignupClosed(content) ? '#ff4d4f' : 'var(--admin-text-muted)' }}>
                            Frist: {new Date(content.signupDeadlineAt).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            {isHomepageContentSignupClosed(content) && !content.isSignupClosed && (
                              <div style={{ background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '3px', fontWeight: 600, marginTop: '2px', display: 'inline-block' }}>Tilmelding lukket</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {content.signupMode !== HomepageContentSignupMode.NONE && (
                      <Link 
                        href={`/${clubSlug}/admin/forside-indhold/${content.id}/tilmeldinger`}
                        className="admin-btn admin-btn-ghost"
                        style={{ padding: '6px' }}
                        title="Deltagere"
                      >
                        <Users size={16} />
                      </Link>
                    )}
                    <Link 
                      href={`/${clubSlug}/admin/forside-indhold/${content.id}/rediger`}
                      className="admin-btn admin-btn-ghost"
                      style={{ padding: '6px' }}
                      title="Rediger"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(content.id, content.title)}
                      className="admin-btn admin-btn-ghost"
                      style={{ padding: '6px', color: '#ff4d4f' }}
                      title="Slet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Ingen opslag fundet. Opret det første ved at trykke på &quot;Nyt opslag&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomepageContentList;
