"use client";

import { useActionState, useState } from "react";
import { AdminMemberActionResponse } from "@/lib/admin/memberCreateActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import Link from "next/link";

interface MemberCreateFormProps {
  clubSlug: string;
  nextMemberNumber: number;
  createAction: (prevState: AdminMemberActionResponse | null, formData: FormData) => Promise<AdminMemberActionResponse>;
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

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false, error, readOnly = false, helperText }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean, error?: string, readOnly?: boolean, helperText?: string }) => (
  <div className={fullWidth ? "md:col-span-2" : "md:col-span-1"}>
    <label className="admin-form-label">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      readOnly={readOnly}
      className={`admin-input ${error ? "admin-input-error" : ""} ${readOnly ? "admin-input-readonly" : ""}`}
    />
    {error ? <p className="admin-error-text">{error}</p> : null}
    {helperText ? <p className="admin-form-help">{helperText}</p> : null}
  </div>
);

const Select = ({ label, name, options, defaultValue, onChange }: { label: string, name: string, options: { value: string, label: string }[], defaultValue?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
  <div className="md:col-span-1">
    <label className="admin-form-label">{label}</label>
    <select 
      name={name} 
      defaultValue={defaultValue}
      onChange={onChange}
      className="admin-select"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export function MemberCreateForm({ clubSlug, nextMemberNumber, createAction }: MemberCreateFormProps) {
  const [state, formAction] = useActionState(createAction, null);
  const [membershipType, setMembershipType] = useState("SENIOR");

  const isMdkRequired = membershipType === "SENIOR" || membershipType === "JUNIOR";

  const membershipOptions = [
    { value: 'SENIOR', label: 'Senior' },
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'PASSIVE', label: 'Passiv' },
  ];

  const today = new Date().toISOString().split('T')[0];

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
          <Section title="Stamdata">
            <Field label="Fornavn" name="firstName" error={state?.fieldErrors?.firstName} placeholder="Fornavn" />
            <Field label="Efternavn" name="lastName" error={state?.fieldErrors?.lastName} placeholder="Efternavn" />
            <Field label="Email" name="email" type="email" error={state?.fieldErrors?.email} placeholder="email@eksempel.dk" fullWidth />
            <Field label="Mobil" name="mobilePhone" placeholder="Mobilnummer" />
            <Field label="Adresse" name="addressLine" placeholder="Vejnavn og nummer" fullWidth />
            <Field label="Postnummer" name="postalCode" placeholder="f.eks. 1234" />
            <Field label="By" name="city" placeholder="By" />
            <Field label="Fødselsdato" name="birthDate" type="date" />
            <Field label="Indmeldt dato" name="joinedAt" type="date" defaultValue={today} />
          </Section>

          <Section title="Medlemsdata">
            <Select 
              label="Medlemskab" 
              name="membershipType" 
              options={membershipOptions} 
              defaultValue="SENIOR" 
              onChange={(e) => setMembershipType(e.target.value)}
            />
            <Field 
              label={`MDK nummer${isMdkRequired ? ' *' : ''}`} 
              name="mdkNumber" 
              placeholder={isMdkRequired ? "Påkrævet" : "Valgfrit"} 
              error={state?.fieldErrors?.mdkNumber}
              helperText="Påkrævet for Senior og Junior. Valgfri for Passiv."
            />
          </Section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="admin-card admin-member-side-card">
            <div className="admin-card-accent" />
            <h3 className="admin-kicker mb-4">Automatisk tildeling</h3>
            <div className="flex items-baseline gap-2">
              <span className="admin-member-number-display">{nextMemberNumber}</span>
              <span className="admin-muted text-sm font-medium">Næste medlemsnummer</span>
            </div>
            <p className="admin-muted mt-4 text-xs leading-relaxed">
              Medlemsnummeret tildeles automatisk ved oprettelse. Det kan ikke ændres manuelt.
            </p>
          </div>

          <div className="admin-card">
            <h3 className="admin-kicker mb-4">Standard værdier</h3>
            <ul className="space-y-3">
              {[
                { label: 'Status', value: 'Aktiv' },
                { label: 'Klubrolle', value: 'Almindelig medlem' },
                { label: 'Skolestatus', value: 'Elev i flyveskolen' },
                { label: 'Instruktør', value: 'Nej' }
              ].map(item => (
                <li key={item.label} className="admin-definition-row">
                  <span className="admin-muted">{item.label}</span>
                  <span className="admin-strong">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="admin-form-help mt-6 italic">
              Yderligere detaljer som certifikater og instruktørstatus kan tilføjes efter oprettelse.
            </p>
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
          Opret medlem
        </SubmitButton>
      </div>
    </form>
  );
}
