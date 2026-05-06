"use client";

import { useState, useActionState } from "react";
import { ClubMemberMembershipType } from "@/generated/prisma";
import { submitPublicMemberSignupAction, PublicMemberSignupState } from "@/lib/publicSite/publicMemberSignupActions";
import { ThemedSectionCard } from "@/components/publicSite/ThemedBuildingBlocks";

interface PublicMemberSignupFormProps {
  clubSlug: string;
}

const initialState: PublicMemberSignupState = {};

export default function PublicMemberSignupForm({ clubSlug }: PublicMemberSignupFormProps) {
  const [state, action, isPending] = useActionState(
    submitPublicMemberSignupAction.bind(null, clubSlug),
    initialState
  );

  const [membershipType, setMembershipType] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [localFieldErrors, setLocalFieldErrors] = useState<Record<string, string>>({});

  const setLocalFieldError = (field: string, message: string | null) => {
    setLocalFieldErrors((current) => {
      const next = { ...current };

      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }

      return next;
    });
  };

  const validatePostalCodeOnBlur = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setLocalFieldError("postalCode", null);
      return;
    }

    setLocalFieldError(
      "postalCode",
      /^\d{4}$/.test(trimmed) ? null : "Postnummer skal være 4 cifre."
    );
  };

  const validateMdkNumberOnBlur = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setLocalFieldError("mdkNumber", null);
      return;
    }

    setLocalFieldError(
      "mdkNumber",
      /^\d{4}$/.test(trimmed) ? null : "MDK nr. skal være 4 cifre."
    );
  };

  const validateEmailOnBlur = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setLocalFieldError("email", null);
      return;
    }

    setLocalFieldError(
      "email",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? null : "Indtast en gyldig e-mailadresse."
    );
  };

  const validateMobilePhoneOnBlur = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setLocalFieldError("mobilePhone", null);
      return;
    }

    setLocalFieldError(
      "mobilePhone",
      /^\d+$/.test(trimmed) ? null : "Mobilnummer må kun indeholde tal."
    );
  };

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
          <div className="w-16 h-16 bg-[var(--public-success-soft)] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--public-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--public-text)] mb-4">Tak for din indmeldelse</h2>
        <p className="public-muted-text">
          Vi har modtaget din indmeldelse. Du modtager nu mail med en faktura med betalingsoplysninger. Når betalingen er registreret, aktiveres medlemskabet automatisk.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-8 public-link"
        >
          Send en anden indmeldelse
        </button>
      </ThemedSectionCard>
    );
  }

  return (
    <ThemedSectionCard>
      <form action={action} className="space-y-6">
        {state.error && (
          <div className="public-alert public-alert-danger">
            {state.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fornavn */}
          <div>
            <label htmlFor="firstName" className="public-label">
              Fornavn *
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              required
              className="public-input"
            />
            {state.fieldErrors?.firstName && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.firstName}</p>
            )}
          </div>

          {/* Efternavn */}
          <div>
            <label htmlFor="lastName" className="public-label">
              Efternavn *
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              required
              className="public-input"
            />
            {state.fieldErrors?.lastName && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label htmlFor="address" className="public-label">
            Adresse *
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            className="public-input"
          />
          {state.fieldErrors?.address && (
            <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Postnummer */}
          <div>
            <label htmlFor="postalCode" className="public-label">
              Postnummer *
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={4}
              onBlur={(event) => validatePostalCodeOnBlur(event.target.value)}
              className="public-input"
            />
            {(localFieldErrors.postalCode || state.fieldErrors?.postalCode) && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">
                {localFieldErrors.postalCode || state.fieldErrors?.postalCode}
              </p>
            )}
          </div>

          {/* By */}
          <div>
            <label htmlFor="city" className="public-label">
              By *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              className="public-input"
            />
            {state.fieldErrors?.city && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.city}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* E-mail */}
          <div>
            <label htmlFor="email" className="public-label">
              E-mail *
            </label>
            <input
                type="email"
                name="email"
                id="email"
                required
                autoComplete="email"
                onBlur={(event) => validateEmailOnBlur(event.target.value)}
                className="public-input"
            />
            {(localFieldErrors.email || state.fieldErrors?.email) && (
                <p className="mt-1 text-xs text-[var(--public-danger)]">
                  {localFieldErrors.email || state.fieldErrors?.email}
                </p>
            )}
          </div>

          {/* Mobilnummer */}
          <div>
            <label htmlFor="mobilePhone" className="public-label">
              Mobilnummer *
            </label>
            <input
                type="tel"
                name="mobilePhone"
                id="mobilePhone"
                required
                inputMode="numeric"
                onBlur={(event) => validateMobilePhoneOnBlur(event.target.value)}
                className="public-input"
            />
            {(localFieldErrors.mobilePhone || state.fieldErrors?.mobilePhone) && (
                <p className="mt-1 text-xs text-[var(--public-danger)]">
                  {localFieldErrors.mobilePhone || state.fieldErrors?.mobilePhone}
                </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fødselsdato */}
          <div>
            <label htmlFor="birthDate" className="public-label">
              Fødselsdato *
            </label>
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="public-input"
            />
            {state.fieldErrors?.birthDate && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">{state.fieldErrors.birthDate}</p>
            )}
          </div>

          {/* MDK nr. */}
          <div>
            <label htmlFor="mdkNumber" className="public-label">
              MDK nr. {membershipType === ClubMemberMembershipType.PASSIVE ? '(valgfri)' : '*'}
            </label>
            <input
              type="text"
              name="mdkNumber"
              id="mdkNumber"
              inputMode="numeric"
              maxLength={4}
              required={membershipType === ClubMemberMembershipType.SENIOR || membershipType === ClubMemberMembershipType.JUNIOR}
              onBlur={(event) => validateMdkNumberOnBlur(event.target.value)}
              className="public-input"
            />
            <p className="public-help-text mt-1" style={{ fontSize: '10px' }}>
              MDK nr. er påkrævet for Senior og Junior. Passivt medlemskab kan oprettes uden MDK nr.
            </p>
            {(localFieldErrors.mdkNumber || state.fieldErrors?.mdkNumber) && (
              <p className="mt-1 text-xs text-[var(--public-danger)]">
                {localFieldErrors.mdkNumber || state.fieldErrors?.mdkNumber}
              </p>
            )}
          </div>
        </div>

        {/* Medlemskab */}
        <div>
          <label htmlFor="membershipType" className="public-label">
            Medlemskab *
          </label>
          <select
            name="membershipType"
            id="membershipType"
            required
            value={membershipType}
            onChange={(e) => setMembershipType(e.target.value)}
            className="public-input appearance-none"
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
            disabled={isPending || !!ageError || Object.keys(localFieldErrors).length > 0}
            className="public-primary-button w-full"
          >
            {isPending ? "Sender indmeldelse..." : "Indsend indmeldelse"}
          </button>
        </div>
      </form>
    </ThemedSectionCard>
  );
}
