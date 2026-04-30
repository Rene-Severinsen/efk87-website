import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import LoginForm from "./LoginForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    reason?: string;
    callbackUrl?: string;
    error?: string;
    success?: string;
  }>;
}

/**
 * Validates the callbackUrl to prevent open redirects.
 */
function validateCallbackUrl(url: string | undefined, clubSlug: string): string {
  if (!url) {
    return `/${clubSlug}`;
  }
  const prefix = `/${clubSlug}`;
  const isValid = url.startsWith(prefix) && !url.startsWith("//") && !url.includes("://");
  return isValid ? url : `/${clubSlug}`;
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const { reason, callbackUrl: rawCallbackUrl, error: authError, success: authSuccess } = await searchParams;

  const callbackUrl = validateCallbackUrl(rawCallbackUrl, clubSlug);
  const { club, theme, footerData, navigationItems, actionItems } = await resolveClubContext(clubSlug);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Log ind"
      currentPath={`/${clubSlug}/login`}
      maxWidth="500px"
    >
      <LoginForm 
        clubSlug={clubSlug}
        callbackUrl={callbackUrl}
        reason={reason}
        authError={authError}
        authSuccess={authSuccess}
      />
    </ThemedClubPageShell>
  );
}
