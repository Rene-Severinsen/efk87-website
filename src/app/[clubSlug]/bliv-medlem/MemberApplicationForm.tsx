"use client";

import { useState, useActionState } from "react";
import { ClubMemberMembershipType } from "@/generated/prisma";
import { submitPublicMemberApplicationAction, ApplicationState } from "@/lib/publicSite/memberApplicationActions";
import { ThemedSectionCard } from "@/components/publicSite/ThemedBuildingBlocks";

interface MemberApplicationFormProps {
  clubSlug: string;
}

const initialState: ApplicationState = {};

export default function MemberApplicationForm({ clubSlug }: MemberApplicationFormProps) {
  const [state, action, isPending] = useActionState(
    submitPublicMemberApplicationAction.bind(null, clubSlug),
    initialState
  );

  const [membershipType, setMembershipType] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");

  // Local validation for membership type vs age
  const getAgeError = () => {
    if (!birthDate || !membershipType) return null;
    
    const birthYear = new Date(birthDate).getFullYear();
    if (isNaN(birthYear)) return null;
    
    const currentYear = new Date().getFullYear();
    const ageInCalendarYear = currentYear - birthYear;

    if (membershipType === ClubMemberMembershipType.SENIOR && ageInCalendarYear < 18) {
      return "Ud fra fødselsåret skal medlemskabet være Junior.";
    }
    if (membershipType === ClubMemberMembershipType.JUNIOR && ageInCalendarYear >= 18) {
      return "Ud fra fødselsåret skal medlemskabet være Senior.";
    }
    return null;
  };

  const ageError = getAgeError();

  if (state.success) {
    return (
      <ThemedSectionCard className="text-center py-12">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--club-text)] mb-4">Tak for din ansøgning</h2>
        <p className="text-[var(--club-muted)]">
          Vi har modtaget din indmeldelse. Vi kontakter dig, når den er gennemgået.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 text-[var(--public-primary)] hover:opacity-80 transition-colors"
        >
          Send en anden ansøgning
        </button>
      </ThemedSectionCard>
    );
  }

  return (
    <ThemedSectionCard>
      <form action={action} className="space-y-6">
        {state.error && (
          <div className="p-4 bg-[var(--public-danger)]/10 border border-[var(--public-danger)]/30 rounded-md text-[var(--public-danger)] text-sm">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fornavn */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium opacity-80 mb-2">
              Fornavn *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.firstName && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.firstName}</p>
            )}
          </div>

          {/* Efternavn */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium opacity-80 mb-2">
              Efternavn *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.lastName && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium opacity-80 mb-2">
            Adresse *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
          />
          {state.fieldErrors?.address && (
            <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Postnummer */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium opacity-80 mb-2">
              Postnummer *
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              required
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.postalCode && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.postalCode}</p>
            )}
          </div>

          {/* By */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium opacity-80 mb-2">
              By *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.city && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium opacity-80 mb-2">
              E-mail *
            </label>
            <input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.email}</p>
            )}
          </div>

          {/* Mobilnummer */}
          <div>
            <label htmlFor="mobilePhone" className="block text-sm font-medium opacity-80 mb-2">
              Mobilnummer *
            </label>
            <input
                type="tel"
                name="mobilePhone"
                id="mobilePhone"
                required
                className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            {state.fieldErrors?.mobilePhone && (
                <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.mobilePhone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fødselsdato */}
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium opacity-80 mb-2">
              Fødselsdato *
            </label>
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)]"
            />
            {state.fieldErrors?.birthDate && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.birthDate}</p>
            )}
          </div>

          {/* MDK nr. */}
          <div>
            <label htmlFor="mdkNumber" className="block text-sm font-medium opacity-80 mb-2">
              MDK nr. {membershipType === ClubMemberMembershipType.PASSIVE ? '(valgfri)' : '*'}
            </label>
            <input
              type="text"
              name="mdkNumber"
              id="mdkNumber"
              required={membershipType === ClubMemberMembershipType.SENIOR || membershipType === ClubMemberMembershipType.JUNIOR}
              className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] placeholder-[var(--club-text)]/30"
            />
            <p className="mt-1 text-[10px] text-[var(--club-muted)]">
              MDK nr. er påkrævet for Senior og Junior. Passivt medlemskab kan oprettes uden MDK nr.
            </p>
            {state.fieldErrors?.mdkNumber && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.mdkNumber}</p>
            )}
          </div>
        </div>

        {/* Medlemskab */}
        <div>
          <label htmlFor="membershipType" className="block text-sm font-medium opacity-80 mb-2">
            Medlemskab *
          </label>
          <select
            name="membershipType"
            id="membershipType"
            required
            value={membershipType}
            onChange={(e) => setMembershipType(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--public-surface)] border border-[var(--club-line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--public-primary)]/50 text-[var(--club-text)] appearance-none"
          >
            <option value="" disabled>Vælg medlemskab</option>
            <option value={ClubMemberMembershipType.SENIOR}>Senior</option>
            <option value={ClubMemberMembershipType.JUNIOR}>Junior</option>
            <option value={ClubMemberMembershipType.PASSIVE}>Passiv</option>
          </select>
          {ageError && (
            <p className="mt-1 text-xs text-[var(--public-danger)]">{ageError}</p>
          )}
          {state.fieldErrors?.membershipType && (
            <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.membershipType}</p>
          )}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isPending || !!ageError}
            className="w-full py-4 px-6 bg-[var(--public-primary)] hover:opacity-90 disabled:bg-[var(--public-primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-[0.98]"
          >
            {isPending ? "Sender ansøgning..." : "Indsend indmeldelse"}
          </button>
        </div>
      </form>
    </ThemedSectionCard>
  );
}
