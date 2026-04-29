export function getMemberDisplayName(
  profile: { firstName: string | null; lastName: string | null },
  user: { name: string | null; email: string }
): string {
  if (profile.firstName || profile.lastName) {
    return `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim();
  }
  if (user.name) {
    return user.name;
  }
  return user.email;
}
