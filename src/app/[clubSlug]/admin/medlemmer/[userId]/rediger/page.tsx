import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminMemberByUserId } from "@/lib/admin/memberAdminService";
import { updateAdminMemberProfileAction } from "@/lib/admin/memberAdminActions";
import { MemberEditForm } from "./MemberEditForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    userId: string;
  }>;
}

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
              Opdater stamdata og indstillinger for <span className="text-sky-400 font-semibold">{member.displayName}</span>
            </p>
          </div>

          <MemberEditForm 
            clubSlug={clubSlug} 
            member={member} 
            updateAction={updateAction} 
          />
        </div>
      </div>
    </AdminShell>
  );
}
