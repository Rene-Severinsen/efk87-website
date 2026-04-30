import { HomepageContent, HomepageContentSignup } from "../../generated/prisma";

export type HomepageContentWithSignups = HomepageContent & {
  signups: (HomepageContentSignup & {
    user: {
      name: string | null;
      email: string;
      memberProfiles: {
        firstName: string | null;
        lastName: string | null;
      }[];
    };
  })[];
  _count: {
    signups: number;
  };
  quantityTotal: number;
};

/**
 * Checks if signup for a homepage content post is closed.
 * Rules:
 * - Manually closed (isSignupClosed === true)
 * - OR Deadline has passed (signupDeadlineAt exists and now > signupDeadlineAt)
 */
export function isHomepageContentSignupClosed(
  content: Pick<HomepageContent, 'isSignupClosed' | 'signupDeadlineAt'>,
  now: Date = new Date()
): boolean {
  if (content.isSignupClosed) return true;
  if (content.signupDeadlineAt && now > content.signupDeadlineAt) return true;
  return false;
}
