import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import { getNextMemberNumber } from "@/lib/members/memberNumberService";
import { createAdminMemberAction } from "@/lib/admin/memberCreateActions";
import { MemberCreateForm } from "./MemberCreateForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/medlemmer/ny`);

  const nextNumber = await getNextMemberNumber(club.id);
  const createAction = createAdminMemberAction.bind(null, clubSlug);

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
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Opret medlem</h1>
            <p className="text-slate-400 text-lg">
              Tilføj et nyt medlem til <span className="text-sky-400 font-semibold">{club.name}</span>
            </p>
          </div>

          <MemberCreateForm 
            clubSlug={clubSlug} 
            nextMemberNumber={nextNumber}
            createAction={createAction} 
          />
        </div>
      </div>
    </AdminShell>
  );
}
