import { redirect } from "next/navigation";
import { publicRoutes } from "../../../lib/publicRoutes";

interface MemberHomeRedirectPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function MemberHomeRedirectPage({
  params,
}: MemberHomeRedirectPageProps) {
  const { clubSlug } = await params;

  redirect(publicRoutes.home(clubSlug));
}
