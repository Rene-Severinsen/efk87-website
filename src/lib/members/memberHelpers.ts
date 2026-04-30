import { User, ClubMemberProfile } from "../../generated/prisma";

/**
 * Formaterer et medlems navn baseret på profil og brugerdata.
 * Fallback rækkefølge: 
 * 1. ClubMemberProfile firstName + lastName
 * 2. User.name
 * 3. User.email
 * 4. "Medlem"
 */
export function formatMemberName(
  user: User & { memberProfiles?: ClubMemberProfile[] }
): string {
  const profile = user.memberProfiles?.[0];
  
  if (profile?.firstName || profile?.lastName) {
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }
  
  if (user.name) {
    return user.name;
  }
  
  if (user.email) {
    return user.email;
  }
  
  return "Medlem";
}
