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

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-line)', paddingBottom: '0.75rem' }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, type = "text", defaultValue, placeholder, fullWidth = false }: { label: string, name: string, type?: string, defaultValue?: string | number | null, placeholder?: string, fullWidth?: boolean }) => (
  <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1' }}>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{label}</label>
    <input 
      type={type} 
      name={name} 
      defaultValue={defaultValue ?? ""} 
      placeholder={placeholder}
      style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--admin-line)', backgroundColor: 'white' }} 
    />
  </div>
);

const Select = ({ label, name, options, defaultValue }: { label: string, name: string, options: { value: string, label: string }[], defaultValue?: string }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{label}</label>
    <select 
      name={name} 
      defaultValue={defaultValue}
      style={{ width: '100%', padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid var(--admin-line)', backgroundColor: 'white' }}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Checkbox = ({ label, name, defaultChecked }: { label: string, name: string, defaultChecked?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <input type="checkbox" name={name} defaultChecked={defaultChecked} id={name} />
    <label htmlFor={name} style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</label>
  </div>
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
      <div className="admin-page-container">
        <div className="admin-header">
          <h1 className="admin-title">Rediger medlem</h1>
          <p className="admin-description">Opdater stamdata, medlemskab og certifikater for {member.displayName || member.email}.</p>
        </div>

        <form action={updateAction}>
          <Section title="Stamdata">
            <Field label="Fornavn" name="firstName" defaultValue={member.firstName} />
            <Field label="Efternavn" name="lastName" defaultValue={member.lastName} />
            <Field label="Fødselsdato" name="birthDate" type="date" defaultValue={formatDate(member.birthDate)} />
            <Field label="Indmeldt dato" name="joinedAt" type="date" defaultValue={formatDate(member.joinedAt)} />
            <Field label="Profilbillede URL" name="profileImageUrl" defaultValue={member.profileImageUrl} fullWidth />
          </Section>

          <Section title="Kontakt">
            <Field label="Adresse" name="addressLine" defaultValue={member.addressLine} fullWidth />
            <Field label="Postnummer" name="postalCode" defaultValue={member.postalCode} />
            <Field label="By" name="city" defaultValue={member.city} />
            <Field label="Mobil" name="mobilePhone" defaultValue={member.mobilePhone} />
            <Field label="MDK nummer" name="mdkNumber" defaultValue={member.mdkNumber} />
          </Section>

          <Section title="Medlemskab">
            <Select label="Medlemskab" name="membershipType" options={membershipOptions} defaultValue={member.membershipType} />
            <Select label="Klubrolle" name="memberRoleType" options={roleOptions} defaultValue={member.memberRoleType} />
            <Select label="Status" name="memberStatus" options={statusOptions} defaultValue={member.memberStatus} />
            <div style={{ alignSelf: 'center' }}>
                <Checkbox label="Instruktør" name="isInstructor" defaultChecked={member.isInstructor} />
            </div>
          </Section>

          <Section title="Skolestatus">
            <Select label="Skolestatus" name="schoolStatus" options={schoolStatusOptions} defaultValue={member.schoolStatus} />
          </Section>

          <div className="admin-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid var(--admin-line)', paddingBottom: '0.75rem' }}>Certifikater</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
              {Object.values(ClubMemberCertificateType).map(cert => (
                <Checkbox 
                  key={cert} 
                  label={cert.replace(/_/g, ' ').replace('CERTIFICATE', 'certifikat')} 
                  name={`cert_${cert}`} 
                  defaultChecked={member.certificates.includes(cert)} 
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '4rem' }}>
            <Link 
              href={`/${clubSlug}/admin/medlemmer`}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium"
            >
              Annuller
            </Link>
            <SubmitButton>Gem ændringer</SubmitButton>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
