import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminMemberByUserId } from "@/lib/admin/memberAdminService";
import { updateAdminMemberProfileAction } from "@/lib/admin/memberAdminActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { 
  ClubMemberCertificateType
} from "@/generated/prisma";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    userId: string;
  }>;
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

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean }) => (
  <div className={fullWidth ? 'md:col-span-2' : 'md:col-span-1'}>
    <label className="block text-sm font-medium mb-2 text-slate-400 ml-1">{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all shadow-inner"
    />
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
  <label className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/40 border border-white/10 cursor-pointer transition-all hover:bg-slate-800/60 has-[:checked]:bg-sky-500/10 has-[:checked]:border-sky-500/50 group text-center min-h-[80px]">
    <input 
      type="checkbox" 
      name={name} 
      defaultChecked={defaultChecked} 
      className="sr-only peer" 
    />
    <div className="absolute top-2 right-2 w-5 h-5 rounded-full border border-white/20 peer-checked:bg-sky-500 peer-checked:border-sky-500 flex items-center justify-center transition-all">
      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <span className="text-xs font-semibold text-slate-300 peer-checked:text-sky-400 group-hover:text-white transition-colors">
      {label}
    </span>
  </label>
);

export default async function Page({ params }: PageProps) {
  const { clubSlug, userId } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/medlemmer/${userId}/rediger`);

  const member = await getAdminMemberByUserId(club.id, userId);
  if (!member) {
    notFound();
  }

  const updateAction = updateAdminMemberProfileAction.bind(null, clubSlug, userId);

  const membershipOptions = [
    { value: 'SENIOR', label: 'Senior' },
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'PASSIVE', label: 'Passiv' },
  ];

  const roleOptions = [
    { value: 'REGULAR', label: 'Almindelig medlem' },
    { value: 'BOARD_MEMBER', label: 'Bestyrelsesmedlem' },
    { value: 'BOARD_SUPPLEANT', label: 'Bestyrelsessuppleant' },
    { value: 'TREASURER', label: 'Kasserer' },
    { value: 'CHAIRMAN', label: 'Formand' },
    { value: 'VICE_CHAIRMAN', label: 'Næstformand' },
  ];

  const schoolStatusOptions = [
    { value: 'APPROVED', label: 'Godkendt' },
    { value: 'STUDENT', label: 'Elev i flyveskolen' },
    { value: 'NOT_APPROVED', label: 'Ikke godkendt' },
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Aktiv' },
    { value: 'RESIGNED', label: 'Udmeldt' },
    { value: 'NEW', label: 'Ny' },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="min-h-screen bg-[#0b1220] -m-6 p-6">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Rediger medlem</h1>
            <p className="text-slate-400 text-lg">
              Opdater stamdata og indstillinger for <span className="text-sky-400 font-semibold">{member.displayName || member.email}</span>
            </p>
          </div>

          <form action={updateAction} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Section title="Profil">
                  <Field label="Fornavn" name="firstName" defaultValue={member.firstName} />
                  <Field label="Efternavn" name="lastName" defaultValue={member.lastName} />
                  <Field label="Fødselsdato" name="birthDate" type="date" defaultValue={formatDate(member.birthDate)} />
                  <Field label="Indmeldt dato" name="joinedAt" type="date" defaultValue={formatDate(member.joinedAt)} />
                  <Field label="Profilbillede URL" name="profileImageUrl" defaultValue={member.profileImageUrl} fullWidth />
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
                  <Select label="Skolestatus" name="schoolStatus" options={schoolStatusOptions} defaultValue={member.schoolStatus} />
                  <Toggle label="Instruktør" name="isInstructor" defaultChecked={member.isInstructor} />
                </Section>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col items-center">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 w-full text-center">Profilbillede</h3>
                  <div className="w-48 h-48 rounded-3xl overflow-hidden bg-slate-900 border-2 border-white/10 shadow-2xl relative group">
                    {member.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={member.profileImageUrl} 
                        alt="Profilbillede" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-slate-500 text-center italic">Kun URL understøttes</p>
                </div>

                <div className="backdrop-blur-md bg-[#121b2e]/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500/50 to-emerald-500/50 opacity-30" />
                  <h3 className="text-xl font-bold mb-6 pb-3 border-b border-white/10 text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    Certifikater
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(ClubMemberCertificateType).map(cert => (
                      <CertificateTile 
                        key={cert} 
                        label={cert.replace(/_/g, ' ').replace('CERTIFICATE', 'certifikat')} 
                        name={`cert_${cert}`} 
                        defaultChecked={member.certificates.includes(cert)} 
                      />
                    ))}
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
        </div>
      </div>
    </AdminShell>
  );
}
