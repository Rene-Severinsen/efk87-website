"use client";

import React from "react";
import { formatMemberName } from "../../../../../../lib/members/memberHelpers";
import { adminCancelHomepageContentSignupAction } from "../../../../../../lib/homepageContent/homepageContentActions";
import { User, ClubMemberProfile, HomepageContentSignup } from "../../../../../../generated/prisma";
import { Trash2 } from "lucide-react";

interface SignupListProps {
  signups: (HomepageContentSignup & {
    user: User & {
      memberProfiles: ClubMemberProfile[];
    };
  })[];
  clubSlug: string;
}

export default function SignupList({ signups, clubSlug }: SignupListProps) {
  const activeSignups = signups.filter(s => !s.cancelledAt);
  const totalQuantity = activeSignups.reduce((sum, s) => sum + s.quantity, 0);

  const handleCancel = async (signupId: string, name: string) => {
    if (confirm(`Er du sikker på, at du vil afmelde ${name}?`)) {
      try {
        await adminCancelHomepageContentSignupAction(clubSlug, signupId);
      } catch (error) {
        alert("Der skete en fejl: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Deltager</th>
              <th>Dato</th>
              <th>Antal</th>
              <th>Note</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {signups.length > 0 ? signups.map((signup) => (
              <tr key={signup.id} style={{ opacity: signup.cancelledAt ? 0.6 : 1 }}>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatMemberName(signup.user)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{signup.user.email}</div>
                </td>
                <td>{new Date(signup.createdAt).toLocaleString('da-DK')}</td>
                <td>{signup.quantity}</td>
                <td>
                   <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={signup.note || ''}>
                    {signup.note || '-'}
                  </div>
                </td>
                <td>
                  {signup.cancelledAt ? (
                    <span className="admin-badge admin-badge-error" style={{ background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      Afmeldt
                    </span>
                  ) : (
                    <span className="admin-badge admin-badge-success" style={{ background: 'rgba(82, 196, 26, 0.1)', color: '#52c41a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      Aktiv
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {!signup.cancelledAt && (
                    <button
                      onClick={() => handleCancel(signup.id, formatMemberName(signup.user))}
                      className="admin-btn admin-btn-ghost"
                      style={{ color: '#ff4d4f', padding: '6px' }}
                      title="Afmeld"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                  Ingen tilmeldinger endnu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(activeSignups.length > 0) && (
        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Aktive tilmeldinger</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeSignups.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Antal</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{totalQuantity}</div>
          </div>
        </div>
      )}
    </div>
  );
}
