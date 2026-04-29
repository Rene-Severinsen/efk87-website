import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import PublicClubShell from "../../../components/publicSite/PublicClubShell";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { ClubFlightIntentType } from "../../../generated/prisma";
import { createFlightIntentAction } from "../../../lib/flightIntents/createFlightIntentAction";

interface JegFlyverPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
}

/**
 * "Jeg flyver" submission page for members.
 */
export default async function JegFlyverPage({ params, searchParams }: JegFlyverPageProps) {
  const { clubSlug } = await params;
  const { created } = await searchParams;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, club.slug);

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <PublicClubShell club={club}>
      <div className="flex flex-col items-center justify-center p-6 text-slate-900 mt-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            Jeg flyver
          </h1>
          
          {created === "1" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md">
              Din flyvemelding er oprettet!
            </div>
          )}

          <p className="text-lg text-slate-600 mb-8">
            Her kan medlemmer melde, at de tager ud på pladsen.
          </p>

          <form action={createFlightIntentAction} className="space-y-6">
            <input type="hidden" name="clubSlug" value={clubSlug} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="flightDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Dato *
                </label>
                <input
                  type="date"
                  id="flightDate"
                  name="flightDate"
                  required
                  defaultValue={todayStr}
                  min={todayStr}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="plannedTime" className="block text-sm font-medium text-slate-700 mb-1">
                  Forventet tidspunkt (valgfrit)
                </label>
                <input
                  type="time"
                  id="plannedTime"
                  name="plannedTime"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-slate-700 mb-1">
                Aktivitetstype *
              </label>
              <select
                id="activityType"
                name="activityType"
                required
                defaultValue={ClubFlightIntentType.FLYING}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={ClubFlightIntentType.FLYING}>Flyvning</option>
                <option value={ClubFlightIntentType.TRAINING}>Skoleflyvning / Træning</option>
                <option value={ClubFlightIntentType.MAINTENANCE}>Vedligeholdelse</option>
                <option value={ClubFlightIntentType.WEATHER_DEPENDENT}>Vejrafhængig flyvning</option>
                <option value={ClubFlightIntentType.SOCIAL}>Socialt samvær</option>
                <option value={ClubFlightIntentType.OTHER}>Andet</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                Besked (valgfrit, max 240 tegn)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                maxLength={240}
                placeholder="F.eks. hvilke fly du tager med, eller om der er noget specielt..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Meld ankomst
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-sm text-slate-500 italic text-center">
              Dagens offentlige aktivitetsliste vises på forsiden.
            </p>
          </div>
        </div>
      </div>
    </PublicClubShell>
  );
}
