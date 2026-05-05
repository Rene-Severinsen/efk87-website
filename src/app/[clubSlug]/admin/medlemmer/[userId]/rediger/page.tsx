import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "@/lib/tenancy/tenantService";
import { requireClubAdminForClub } from "@/lib/auth/adminAccessGuards";
import AdminShell from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPagePrimitives";
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
      <AdminPageHeader
        title="Rediger medlem"
        description="Opdater stamdata og indstillinger for medlemmet."
      />

      <div className="admin-page-content">
        <div className="max-w-6xl mx-auto">
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
