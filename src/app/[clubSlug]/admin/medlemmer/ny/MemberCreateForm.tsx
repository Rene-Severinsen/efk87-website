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

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false, error, readOnly = false, helperText }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean, error?: string, readOnly?: boolean, helperText?: string }) => (
  <div className={fullWidth ? 'md:col-span-2' : 'md:col-span-1'}>
    <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-4 py-3 rounded-xl bg-slate-900/40 border ${error ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500/40' : 'border-white/10 focus:ring-sky-500/40 focus:border-sky-500/40'} ${readOnly ? 'opacity-70 cursor-not-allowed bg-slate-900/60' : ''} text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all shadow-inner`}
    />
    {error && <p className="mt-1.5 ml-1 text-xs text-red-400 font-medium">{error}</p>}
    {helperText && <p className="mt-1.5 ml-1 text-xs text-slate-500">{helperText}</p>}
  </div>
);

const Select = ({ label, name, options, defaultValue, onChange }: { label: string, name: string, options: { value: string, label: string }[], defaultValue?: string, onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
  <div className="md:col-span-1">
    <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">{label}</label>
    <select 
      name={name} 
      defaultValue={defaultValue}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all appearance-none shadow-inner"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
    >
      {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">{opt.label}</option>)}
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
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
          <div className="backdrop-blur-md bg-sky-500/5 border border-sky-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-sky-400 mb-4">Automatisk tildeling</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{nextMemberNumber}</span>
              <span className="text-slate-500 text-sm font-medium">Næste medlemsnummer</span>
            </div>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              Medlemsnummeret tildeles automatisk ved oprettelse. Det kan ikke ændres manuelt.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Standard værdier</h3>
            <ul className="space-y-3">
              {[
                { label: 'Status', value: 'Under oprettelse' },
                { label: 'Klubrolle', value: 'Almindelig medlem' },
                { label: 'Skolestatus', value: 'Elev i flyveskolen' },
                { label: 'Instruktør', value: 'Nej' }
              ].map(item => (
                <li key={item.label} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-slate-200 font-semibold">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-500 italic">
              Yderligere detaljer som certifikater og instruktørstatus kan tilføjes efter oprettelse.
            </p>
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
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white transition-all font-bold shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          Opret medlem
        </SubmitButton>
      </div>
    </form>
  );
}
