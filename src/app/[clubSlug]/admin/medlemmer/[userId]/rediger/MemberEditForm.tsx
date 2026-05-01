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
  member: ClubMemberProfile & { certificates: ClubMemberCertificateType[], displayName?: string | null };
  updateAction: (prevState: AdminMemberActionResponse | null, formData: FormData) => Promise<AdminMemberActionResponse>;
}

const Section = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
    <h3 className="text-xl font-bold mb-6 pb-3 border-b border-white/10 text-white flex items-center gap-2">
      <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false, error }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean, error?: string }) => (
  <div className={fullWidth ? 'md:col-span-2' : 'md:col-span-1'}>
    <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl bg-slate-900/40 border ${error ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500/40' : 'border-white/10 focus:ring-sky-500/40 focus:border-sky-500/40'} text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner`}
    />
    {error && <p className="mt-1.5 ml-1 text-xs text-red-400 font-medium">{error}</p>}
  </div>
);

const Select = ({ label, name, options, defaultValue }: { label: string, name: string, options: { value: string, label: string }[], defaultValue?: string }) => (
  <div className="md:col-span-1">
    <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">{label}</label>
    <select 
      name={name} 
      defaultValue={defaultValue}
      className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all appearance-none shadow-inner"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
    >
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>)}
    </select>
  </div>
);

const Toggle = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <div className="md:col-span-1 flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-white/5 group transition-all hover:bg-slate-900/40 shadow-inner">
    <label htmlFor={name} className="text-sm font-medium text-slate-400 cursor-pointer flex-grow">{label}</label>
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500/40 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 bg-slate-700 has-[:checked]:bg-emerald-600">
      <input 
        type="checkbox" 
        name={name} 
        defaultChecked={defaultChecked} 
        id={name} 
        className="sr-only peer"
      />
      <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-0 peer-checked:translate-x-5" />
    </label>
  </div>
);

const CertificateTile = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <label className="relative flex items-center p-3 rounded-xl bg-slate-900/40 border border-white/10 cursor-pointer transition-all hover:bg-slate-800/60 has-[:checked]:bg-sky-500/10 has-[:checked]:border-sky-500/50 group min-h-[56px]">
    <input 
      type="checkbox" 
      name={name} 
      defaultChecked={defaultChecked} 
      className="sr-only peer" 
    />
    <div className="w-5 h-5 shrink-0 rounded-full border border-white/20 peer-checked:bg-sky-500 peer-checked:border-sky-500 flex items-center justify-center transition-all mr-3">
      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-[13px] leading-snug font-medium text-slate-400 peer-checked:text-sky-100 group-hover:text-white transition-colors line-clamp-2">
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
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
                  className="w-32 h-32 text-4xl border-2 border-white/20 shadow-xl group-hover:border-sky-500/50 transition-all duration-300" 
                  objectPosition="center 25%"
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/40"
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
                  <label className="block text-sm font-medium text-slate-400">Upload nyt billede</label>
                  <input 
                    type="file"
                    name="profilePhoto"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block w-full text-sm text-slate-400
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-sky-500/10 file:text-sky-400
                      hover:file:bg-sky-500/20
                      cursor-pointer file:cursor-pointer transition-all"
                  />
                  <p className="text-xs text-slate-500 ml-1">JPG, PNG eller WebP. Maks 2 MB.</p>
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
            <Field label="Mobil" name="mobilePhone" defaultValue={member.mobilePhone} />
            <Field label="MDK nummer" name="mdkNumber" defaultValue={member.mdkNumber} />
          </Section>

          <Section title="Medlemsforhold">
            <Select label="Medlemskab" name="membershipType" options={membershipOptions} defaultValue={member.membershipType} />
            <Select label="Klubrolle" name="memberRoleType" options={roleOptions} defaultValue={member.memberRoleType} />
            <Select label="Status" name="memberStatus" options={statusOptions} defaultValue={member.memberStatus} />
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">Medlemsnummer</label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 font-semibold shadow-inner">
                {member.memberNumber || 'Tildeles automatisk'}
              </div>
              <p className="mt-1.5 ml-1 text-xs text-slate-500">Kan ikke ændres manuelt</p>
            </div>
            <Select label="Skolestatus" name="schoolStatus" options={schoolStatusOptions} defaultValue={member.schoolStatus} />
            <Toggle label="Instruktør" name="isInstructor" defaultChecked={member.isInstructor} />
          </Section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 w-full text-center">Profilbillede</h3>
            <Avatar 
              imageUrl={member.profileImageUrl} 
              name={member.displayName || ""} 
              className="w-48 h-48 rounded-3xl !text-5xl"
              objectPosition="center 25%"
            />
            <p className="mt-4 text-xs text-slate-500 text-center italic">Kun URL understøttes</p>
          </div>

          <div className="backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
            <h3 className="text-xl font-bold mb-6 pb-3 border-b border-white/10 text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
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

          <div className="backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 to-orange-500/50 opacity-30" />
            <h3 className="text-xl font-bold mb-6 pb-3 border-b border-white/10 text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              Fakturering
            </h3>
            <div className="space-y-4">
              <button 
                type="button"
                disabled
                className="w-full px-6 py-3 rounded-xl bg-slate-800 text-slate-500 font-bold border border-white/5 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Opret fakturagrundlag
              </button>
              <p className="text-xs text-slate-500 italic text-center">
                Integration til Dinero/faktureringsmotor tilkobles senere.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 z-10 flex gap-4 items-center justify-center md:justify-end bg-[#0b1220]/80 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl">
        <Link 
          href={`/${clubSlug}/admin/medlemmer`}
          className="px-8 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all font-semibold"
        >
          Annuller
        </Link>
        <SubmitButton 
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          Gem ændringer
        </SubmitButton>
      </div>
    </form>
  );
}
