"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useActionState } from "react";
import { ClubMemberMembershipType } from "@/generated/prisma";
import { submitPublicMemberSignupAction, PublicMemberSignupState } from "@/lib/publicSite/publicMemberSignupActions";
import { ThemedSectionCard } from "@/components/publicSite/ThemedBuildingBlocks";

interface PublicMemberSignupFormProps {
  clubSlug: string;
}

interface TurnstileGlobal {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      size: "invisible";
      execution: "execute";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
    }
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const initialState: PublicMemberSignupState = {};

export default function PublicMemberSignupForm({ clubSlug }: PublicMemberSignupFormProps) {
  const [state, action, isPending] = useActionState(
    submitPublicMemberSignupAction.bind(null, clubSlug),
    initialState
  );

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const pendingFormRef = useRef<HTMLFormElement | null>(null);

  const [membershipType, setMembershipType] = useState<string>(state.values?.membershipType ?? "");
  const [birthDate, setBirthDate] = useState<string>(state.values?.birthDate ?? "");
  const [isSubmittingProtectedForm, setIsSubmittingProtectedForm] = useState(false);
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
  const showFormBusy = isPending || isSubmittingProtectedForm;

  const resetTurnstileToken = () => {
    const formElement = pendingFormRef.current;
    const tokenInput = formElement?.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');

    if (tokenInput) {
      tokenInput.value = "";
    }

    pendingFormRef.current = null;
    setIsSubmittingProtectedForm(false);

    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  };

  useEffect(() => {
    if (!isPending) {
      resetTurnstileToken();
      setIsSubmittingProtectedForm(false);
    }
  }, [isPending, state]);

  const renderTurnstile = () => {
    if (!turnstileSiteKey || !turnstileContainerRef.current || !window.turnstile) {
      return;
    }

    if (turnstileWidgetIdRef.current) {
      return;
    }

    turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      size: "invisible",
      execution: "execute",
      callback: (token: string) => {
        const formElement = pendingFormRef.current;
        if (!formElement) return;

        const tokenInput = formElement.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
        if (tokenInput) {
          tokenInput.value = token;
        }

        formElement.requestSubmit();
      },
      "error-callback": () => {
        pendingFormRef.current = null;
        alert("Vi kunne ikke verificere formularen. Prøv igen.");
      },
      "expired-callback": () => {
        if (turnstileWidgetIdRef.current && window.turnstile) {
          window.turnstile.reset(turnstileWidgetIdRef.current);
        }
      },
    });
  };

  const handleTurnstileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formElement = event.currentTarget;
    const tokenInput = formElement.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');

    if (tokenInput?.value) {
      return;
    }

    event.preventDefault();
    setIsSubmittingProtectedForm(true);

    if (!turnstileSiteKey) {
      setIsSubmittingProtectedForm(false);
      alert("Formularbeskyttelse mangler konfiguration.");
      return;
    }

    if (!window.turnstile || !turnstileWidgetIdRef.current) {
      setIsSubmittingProtectedForm(false);
      alert("Formularbeskyttelse er ikke klar endnu. Prøv igen om et øjeblik.");
      return;
    }

    pendingFormRef.current = formElement;
    window.turnstile.reset(turnstileWidgetIdRef.current);
    window.turnstile.execute(turnstileWidgetIdRef.current);
  };

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
    <div className="public-form-shell">
      <ThemedSectionCard>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        async
        defer
        onLoad={renderTurnstile}
      />

      <form action={action} onSubmit={handleTurnstileSubmit} className="space-y-6">
        <input type="hidden" name="cf-turnstile-response" value="" />
        <div ref={turnstileContainerRef} />
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
              defaultValue={state.values?.firstName ?? ""}
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
              defaultValue={state.values?.lastName ?? ""}
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
            defaultValue={state.values?.address ?? ""}
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
              defaultValue={state.values?.postalCode ?? ""}
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
              defaultValue={state.values?.city ?? ""}
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
                defaultValue={state.values?.email ?? ""}
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
                defaultValue={state.values?.mobilePhone ?? ""}
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
              defaultValue={state.values?.mdkNumber ?? ""}
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
            disabled={showFormBusy || !!ageError || Object.keys(localFieldErrors).length > 0}
            className="public-primary-button w-full"
          >
            {showFormBusy ? "Sender indmeldelse..." : "Indsend indmeldelse"}
          </button>

          <div className="public-turnstile-trust-row" aria-label="Cloudflare formularbeskyttelse">
            <img
              src="/images/brand/cloudflare/BDES-5287_ProtectedByCloudflareBadge_web_badges_3.png"
              alt="Protected by Cloudflare"
              className="public-turnstile-badge"
            />
          </div>
        </div>
      </form>

      {showFormBusy ? (
        <div className="public-form-busy-overlay" role="status" aria-live="polite">
          <div className="public-form-busy-box">
            <div className="public-form-busy-logo" aria-hidden="true">
              <img
                src={`/uploads/${clubSlug}/branding/apple-touch-icon.png`}
                alt=""
                className="public-form-busy-logo-image"
              />
            </div>
            <div>
              <p className="public-form-busy-title">Sender indmeldelse…</p>
              <p className="public-form-busy-text">Vent venligst et øjeblik.</p>
            </div>
          </div>
        </div>
      ) : null}
    </ThemedSectionCard>
    </div>
  );
}
