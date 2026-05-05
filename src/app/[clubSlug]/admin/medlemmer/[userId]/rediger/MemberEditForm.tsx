"use client";

import { useActionState, useState, useRef } from "react";
import { AdminMemberActionResponse } from "@/lib/admin/memberAdminActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import Link from "next/link";
import { ClubMemberCertificateType, ClubMemberProfile } from "@/generated/prisma";
import { 
  MEMBERSHIP_TYPE_LABELS, 
  ROLE_TYPE_LABELS, 
  SCHOOL_STATUS_LABELS, 
  MEMBER_STATUS_LABELS,
  CERTIFICATE_LABELS
} from "@/lib/members/memberConstants";
import Avatar from "@/components/shared/Avatar";

interface MemberEditFormProps {
  clubSlug: string;
  member: ClubMemberProfile & { certificates: ClubMemberCertificateType[], displayName?: string | null, email?: string | null };
  updateAction: (prevState: AdminMemberActionResponse | null, formData: FormData) => Promise<AdminMemberActionResponse>;
}

const Section = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`admin-card admin-member-section ${className}`}>
    <div className="admin-card-accent" />
    <h3 className="admin-member-section-title">
      <span className="admin-member-section-marker" />
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false, error }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean, error?: string }) => (
  <div className={fullWidth ? "md:col-span-2" : "md:col-span-1"}>
    <label className="admin-form-label">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      className={`admin-input ${error ? "admin-input-error" : ""}`}
    />
    {error ? <p className="admin-error-text">{error}</p> : null}
  </div>
);

const Select = ({ label, name, options, defaultValue }: { label: string, name: string, options: { value: string, label: string }[], defaultValue?: string }) => (
  <div className="md:col-span-1">
    <label className="admin-form-label">{label}</label>
    <select 
      name={name} 
      defaultValue={defaultValue}
      className="admin-select"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <div className="admin-toggle-row">
    <label htmlFor={name} className="admin-toggle-label">{label}</label>
    <label className="admin-switch">
      <input 
        type="checkbox" 
        name={name} 
        defaultChecked={defaultChecked} 
        id={name} 
        className="sr-only peer"
      />
      <span className="admin-switch-thumb" />
    </label>
  </div>
);

const CertificateTile = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <label className="admin-certificate-tile">
    <input 
      type="checkbox" 
      name={name} 
      defaultChecked={defaultChecked} 
      className="sr-only peer" 
    />
    <div className="admin-certificate-check">
      <svg className="admin-certificate-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="admin-certificate-label">
      {label}
    </span>
  </label>
);

export function MemberEditForm({ clubSlug, member, updateAction }: MemberEditFormProps) {
  const [state, formAction] = useActionState(updateAction, null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(member.profileImageUrl);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setIsRemovingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    setIsRemovingPhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const membershipOptions = Object.entries(MEMBERSHIP_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const roleOptions = Object.entries(ROLE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const schoolStatusOptions = Object.entries(SCHOOL_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const statusOptions = Object.entries(MEMBER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && !state?.fieldErrors && (
        <div className="admin-alert admin-alert-danger flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Profilbillede" className="md:col-span-2">
            <div className="md:col-span-2 flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <Avatar 
                  imageUrl={previewUrl} 
                  name={member.displayName || "Medlem"} 
                  size="lg" 
                  className="admin-avatar-upload-preview" 
                  shape="rounded"
                  objectPosition="center 12%"
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="admin-icon-button-danger absolute -top-2 -right-2"
                    title="Fjern billede"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="flex-grow space-y-4 w-full md:w-auto">
                <div className="flex flex-col gap-2">
                  <label className="admin-form-label">Upload nyt billede</label>
                  <input 
                    type="file"
                    name="profilePhoto"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="admin-file-input"
                  />
                  <p className="admin-form-help">JPG, PNG eller WebP. Maks 2 MB.</p>
                </div>
                
                <div className="hidden">
                  <input type="hidden" name="removeProfilePhoto" value={isRemovingPhoto ? "true" : "false"} />
                  <Field 
                    label="Profilbillede URL (fallback)" 
                    name="profileImageUrl" 
                    defaultValue={member.profileImageUrl} 
                    placeholder="https://..."
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Profil">
            <Field label="Fornavn" name="firstName" defaultValue={member.firstName} error={state?.fieldErrors?.firstName} />
            <Field label="Efternavn" name="lastName" defaultValue={member.lastName} error={state?.fieldErrors?.lastName} />
            <Field label="Fødselsdato" name="birthDate" type="date" defaultValue={formatDate(member.birthDate)} />
            <Field label="Indmeldt dato" name="joinedAt" type="date" defaultValue={formatDate(member.joinedAt)} />
          </Section>

          <Section title="Kontaktoplysninger">
            <Field label="Adresse" name="addressLine" defaultValue={member.addressLine} fullWidth />
            <Field label="Postnummer" name="postalCode" defaultValue={member.postalCode} />
            <Field label="By" name="city" defaultValue={member.city} />
            <Field label="E-mail" name="email" defaultValue={member.email} error={state?.fieldErrors?.email} fullWidth />
            <Field label="Mobil" name="mobilePhone" defaultValue={member.mobilePhone} />
            <Field label="MDK nummer" name="mdkNumber" defaultValue={member.mdkNumber} />
          </Section>

          <Section title="Medlemsforhold">
            <Select label="Medlemskab" name="membershipType" options={membershipOptions} defaultValue={member.membershipType} />
            <Select label="Klubrolle" name="memberRoleType" options={roleOptions} defaultValue={member.memberRoleType} />
            <Select label="Status" name="memberStatus" options={statusOptions} defaultValue={member.memberStatus} />
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2 admin-muted ml-1">Medlemsnummer</label>
              <div className="admin-readonly-field">
                {member.memberNumber || 'Tildeles automatisk'}
              </div>
              <p className="admin-form-help">Kan ikke ændres manuelt</p>
            </div>
            <Select label="Skolestatus" name="schoolStatus" options={schoolStatusOptions} defaultValue={member.schoolStatus} />
            <Toggle label="Instruktør" name="isInstructor" defaultChecked={member.isInstructor} />
          </Section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="admin-card flex flex-col items-center">
            <h3 className="admin-kicker mb-6 w-full text-center">Profilbillede</h3>
            <Avatar 
              imageUrl={member.profileImageUrl} 
              name={member.displayName || ""} 
              className="admin-avatar-profile-preview"
              shape="rounded"
              objectPosition="center 12%"
            />
            <p className="admin-form-help text-center italic">Kun URL understøttes</p>
          </div>

          <div className="admin-card admin-member-section">
            <div className="admin-card-accent" />
            <h3 className="admin-member-section-title">
              <span className="admin-member-section-marker" />
              Certifikater
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(CERTIFICATE_LABELS).map(([cert, label]) => (
                <CertificateTile 
                  key={cert} 
                  label={label} 
                  name={`cert_${cert}`} 
                  defaultChecked={member.certificates?.includes(cert as ClubMemberCertificateType)} 
                />
              ))}
            </div>
          </div>

          <div className="backdrop-blur-md admin-card border admin-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="admin-card-accent" />
            <h3 className="admin-member-section-title">
              <span className="admin-member-section-marker" />
              Fakturering
            </h3>
            <div className="space-y-4">
              <button 
                type="button"
                disabled
                className="admin-btn admin-btn-disabled w-full justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Opret fakturagrundlag
              </button>
              <p className="admin-form-help italic text-center">
                Integration til Dinero/faktureringsmotor tilkobles senere.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-form-actions-sticky">
        <Link 
          href={`/${clubSlug}/admin/medlemmer`}
          className="admin-btn"
        >
          Annuller
        </Link>
        <SubmitButton 
          className="admin-btn admin-btn-primary"
        >
          Gem ændringer
        </SubmitButton>
      </div>
    </form>
  );
}
