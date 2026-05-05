"use client";

import { useState } from "react";
import { updatePublicHomepageSettingsAction } from "@/lib/admin/siteSettingsActions";
import MediaUrlPicker from "@/components/admin/media/MediaUrlPicker";
import { ClubMediaAssetDTO } from "@/lib/media/mediaTypes";

interface PublicHomepageSettingsValues {
  publicHeroImageUrl?: string | null;
  publicHeroImageAltText?: string | null;
  publicHeroTitle?: string | null;
  publicHeroSubtitle?: string | null;
  publicHeroPrimaryCtaLabel?: string | null;
  publicHeroPrimaryCtaHref?: string | null;
  publicHeroSecondaryCtaLabel?: string | null;
  publicHeroSecondaryCtaHref?: string | null;
  publicHeroTertiaryCtaLabel?: string | null;
  publicHeroTertiaryCtaHref?: string | null;
  publicHeroQuaternaryCtaLabel?: string | null;
  publicHeroQuaternaryCtaHref?: string | null;

  publicIntroTitle?: string | null;
  publicIntroLinkLabel?: string | null;
  publicIntroLinkHref?: string | null;
  publicIntroCard1Icon?: string | null;
  publicIntroCard1Title?: string | null;
  publicIntroCard1Text?: string | null;
  publicIntroCard1Href?: string | null;
  publicIntroCard2Icon?: string | null;
  publicIntroCard2Title?: string | null;
  publicIntroCard2Text?: string | null;
  publicIntroCard2Href?: string | null;
  publicIntroCard3Icon?: string | null;
  publicIntroCard3Title?: string | null;
  publicIntroCard3Text?: string | null;
  publicIntroCard3Href?: string | null;

  publicCtaSectionTitle?: string | null;
  publicCtaSectionLinkLabel?: string | null;
  publicCtaSectionLinkHref?: string | null;
  publicCtaBoxIcon?: string | null;
  publicCtaBoxTitle?: string | null;
  publicCtaBoxText?: string | null;
  publicCtaPrimaryLabel?: string | null;
  publicCtaPrimaryHref?: string | null;
  publicCtaSecondaryLabel?: string | null;
  publicCtaSecondaryHref?: string | null;
}

interface PublicHomepageSettingsFormProps {
  clubId: string;
  clubSlug: string;
  initialValues: PublicHomepageSettingsValues | null;
  mediaAssets: ClubMediaAssetDTO[];
}

const fallbackValues: Record<keyof PublicHomepageSettingsValues, string> = {
  publicHeroImageUrl: "",
  publicHeroImageAltText: "",
  publicHeroTitle: "Velkommen til EFK87",
  publicHeroSubtitle: "Modelsvæveflyvning, fællesskab og flyveskole i en aktiv klub med plads til både nye og erfarne piloter.",
  publicHeroPrimaryCtaLabel: "Bliv medlem",
  publicHeroPrimaryCtaHref: "/bliv-medlem",
  publicHeroSecondaryCtaLabel: "Flyveskole",
  publicHeroSecondaryCtaHref: "/flyveskole",
  publicHeroTertiaryCtaLabel: "Se galleri",
  publicHeroTertiaryCtaHref: "/galleri",
  publicHeroQuaternaryCtaLabel: "Om klubben",
  publicHeroQuaternaryCtaHref: "/about",

  publicIntroTitle: "En klub for dig, der vil flyve rigtigt",
  publicIntroLinkLabel: "Læs om klubben",
  publicIntroLinkHref: "/about",
  publicIntroCard1Icon: "🎓",
  publicIntroCard1Title: "Flyveskole",
  publicIntroCard1Text: "Kom trygt i gang med instruktører, struktur og hjælp fra første dag.",
  publicIntroCard1Href: "/flyveskole",
  publicIntroCard2Icon: "📸",
  publicIntroCard2Title: "Fællesskab",
  publicIntroCard2Text: "Se billeder og aktiviteter fra et klubmiljø med plads til både nye og erfarne piloter.",
  publicIntroCard2Href: "/galleri",
  publicIntroCard3Icon: "📍",
  publicIntroCard3Title: "Flyvepladsen",
  publicIntroCard3Text: "Find praktisk information om pladsen, klubhuset og hvordan du besøger os.",
  publicIntroCard3Href: "/om/her-bor-vi",

  publicCtaSectionTitle: "Kom i gang med modelflyvning",
  publicCtaSectionLinkLabel: "Læs om flyveskolen",
  publicCtaSectionLinkHref: "/flyveskole",
  publicCtaBoxIcon: "✈️",
  publicCtaBoxTitle: "Ny i sporten?",
  publicCtaBoxText: "EFK87 har flyveskole, instruktører og et klubmiljø hvor nye medlemmer kan komme trygt i gang.",
  publicCtaPrimaryLabel: "Bliv medlem",
  publicCtaPrimaryHref: "/bliv-medlem",
  publicCtaSecondaryLabel: "Se flyveskole",
  publicCtaSecondaryHref: "/flyveskole",
};

function fieldValue(
  initialValues: PublicHomepageSettingsValues | null,
  key: keyof PublicHomepageSettingsValues,
): string {
  return initialValues?.[key] ?? fallbackValues[key];
}

function TextInput({
  name,
  label,
  defaultValue,
}: {
  name: keyof PublicHomepageSettingsValues;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="admin-form-label">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="admin-input"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
}: {
  name: keyof PublicHomepageSettingsValues;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="admin-form-label">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="admin-input"
      />
    </label>
  );
}

function SectionCard({
  title,
  description,
  children,
  wide = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`admin-card ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-5">
        <h3 className="admin-section-title">{title}</h3>
        {description ? (
          <p className="admin-muted mt-1 text-sm leading-6">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-4">
        {children}
      </div>
    </section>
  );
}

function IntroCardFields({
  cardNumber,
  iconKey,
  titleKey,
  textKey,
  hrefKey,
  initialValues,
}: {
  cardNumber: number;
  iconKey: keyof PublicHomepageSettingsValues;
  titleKey: keyof PublicHomepageSettingsValues;
  textKey: keyof PublicHomepageSettingsValues;
  hrefKey: keyof PublicHomepageSettingsValues;
  initialValues: PublicHomepageSettingsValues | null;
}) {
  return (
    <div className="admin-card grid gap-4 p-4">
      <h4 className="admin-strong">Kort {cardNumber}</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[90px_1fr_1fr]">
        <TextInput
          name={iconKey}
          label="Ikon"
          defaultValue={fieldValue(initialValues, iconKey)}
        />
        <TextInput
          name={titleKey}
          label="Titel"
          defaultValue={fieldValue(initialValues, titleKey)}
        />
        <TextInput
          name={hrefKey}
          label="Link"
          defaultValue={fieldValue(initialValues, hrefKey)}
        />
      </div>

      <TextArea
        name={textKey}
        label="Tekst"
        defaultValue={fieldValue(initialValues, textKey)}
      />
    </div>
  );
}

export default function PublicHomepageSettingsForm({
  clubId,
  clubSlug,
  initialValues,
  mediaAssets,
}: PublicHomepageSettingsFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus(null);

    const result = await updatePublicHomepageSettingsAction(
      clubId,
      clubSlug,
      formData,
    );

    setStatus(result.success ? "Public forside er gemt." : result.error || "Public forside kunne ikke gemmes.");
  }

  return (
    <form action={handleSubmit} className="grid gap-6">
      <div>
        <h2 className="admin-section-title">Public forside</h2>
        <p className="admin-muted mt-1 text-sm leading-6">
          Vedligehold de faste public-forside elementer. Forsideopslag håndteres stadig separat under Forsideindhold.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Hero"
          description="Øverste visuelle område på public forsiden."
          wide
        >
          <TextInput
            name="publicHeroTitle"
            label="Hero titel"
            defaultValue={fieldValue(initialValues, "publicHeroTitle")}
          />

          <TextArea
            name="publicHeroSubtitle"
            label="Hero tekst"
            defaultValue={fieldValue(initialValues, "publicHeroSubtitle")}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <MediaUrlPicker
              name="publicHeroImageUrl"
              label="Hero billede"
              value={initialValues?.publicHeroImageUrl ?? ""}
              assets={mediaAssets}
              placeholder="Vælg hero billede fra Media"
              previewFit="cover"
              compact
            />

            <TextInput
              name="publicHeroImageAltText"
              label="Alt-tekst"
              defaultValue={fieldValue(initialValues, "publicHeroImageAltText")}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Hero knapper"
          description="De fire knapper i hero-sektionen."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput name="publicHeroPrimaryCtaLabel" label="Primær label" defaultValue={fieldValue(initialValues, "publicHeroPrimaryCtaLabel")} />
            <TextInput name="publicHeroPrimaryCtaHref" label="Primær link" defaultValue={fieldValue(initialValues, "publicHeroPrimaryCtaHref")} />
            <TextInput name="publicHeroSecondaryCtaLabel" label="CTA 2 label" defaultValue={fieldValue(initialValues, "publicHeroSecondaryCtaLabel")} />
            <TextInput name="publicHeroSecondaryCtaHref" label="CTA 2 link" defaultValue={fieldValue(initialValues, "publicHeroSecondaryCtaHref")} />
            <TextInput name="publicHeroTertiaryCtaLabel" label="CTA 3 label" defaultValue={fieldValue(initialValues, "publicHeroTertiaryCtaLabel")} />
            <TextInput name="publicHeroTertiaryCtaHref" label="CTA 3 link" defaultValue={fieldValue(initialValues, "publicHeroTertiaryCtaHref")} />
            <TextInput name="publicHeroQuaternaryCtaLabel" label="CTA 4 label" defaultValue={fieldValue(initialValues, "publicHeroQuaternaryCtaLabel")} />
            <TextInput name="publicHeroQuaternaryCtaHref" label="CTA 4 link" defaultValue={fieldValue(initialValues, "publicHeroQuaternaryCtaHref")} />
          </div>
        </SectionCard>

        <SectionCard
          title="Introsektion"
          description="Overskrift og link over de tre intro-kort."
        >
          <TextInput
            name="publicIntroTitle"
            label="Sektionstitel"
            defaultValue={fieldValue(initialValues, "publicIntroTitle")}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput name="publicIntroLinkLabel" label="Toplink label" defaultValue={fieldValue(initialValues, "publicIntroLinkLabel")} />
            <TextInput name="publicIntroLinkHref" label="Toplink href" defaultValue={fieldValue(initialValues, "publicIntroLinkHref")} />
          </div>
        </SectionCard>

        <SectionCard
          title="Intro-kort"
          description="De tre små kort på public forsiden."
          wide
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <IntroCardFields
              cardNumber={1}
              iconKey="publicIntroCard1Icon"
              titleKey="publicIntroCard1Title"
              textKey="publicIntroCard1Text"
              hrefKey="publicIntroCard1Href"
              initialValues={initialValues}
            />

            <IntroCardFields
              cardNumber={2}
              iconKey="publicIntroCard2Icon"
              titleKey="publicIntroCard2Title"
              textKey="publicIntroCard2Text"
              hrefKey="publicIntroCard2Href"
              initialValues={initialValues}
            />

            <IntroCardFields
              cardNumber={3}
              iconKey="publicIntroCard3Icon"
              titleKey="publicIntroCard3Title"
              textKey="publicIntroCard3Text"
              hrefKey="publicIntroCard3Href"
              initialValues={initialValues}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="CTA-sektion"
          description="Sektionen nederst på public forsiden før galleri/footer."
          wide
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput name="publicCtaSectionTitle" label="Sektionstitel" defaultValue={fieldValue(initialValues, "publicCtaSectionTitle")} />
            <TextInput name="publicCtaSectionLinkLabel" label="Toplink label" defaultValue={fieldValue(initialValues, "publicCtaSectionLinkLabel")} />
            <TextInput name="publicCtaSectionLinkHref" label="Toplink href" defaultValue={fieldValue(initialValues, "publicCtaSectionLinkHref")} />
            <TextInput name="publicCtaBoxIcon" label="Boks ikon" defaultValue={fieldValue(initialValues, "publicCtaBoxIcon")} />
            <TextInput name="publicCtaBoxTitle" label="Boks titel" defaultValue={fieldValue(initialValues, "publicCtaBoxTitle")} />
          </div>

          <TextArea name="publicCtaBoxText" label="Boks tekst" defaultValue={fieldValue(initialValues, "publicCtaBoxText")} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput name="publicCtaPrimaryLabel" label="Primær knap label" defaultValue={fieldValue(initialValues, "publicCtaPrimaryLabel")} />
            <TextInput name="publicCtaPrimaryHref" label="Primær knap link" defaultValue={fieldValue(initialValues, "publicCtaPrimaryHref")} />
            <TextInput name="publicCtaSecondaryLabel" label="Sekundær knap label" defaultValue={fieldValue(initialValues, "publicCtaSecondaryLabel")} />
            <TextInput name="publicCtaSecondaryHref" label="Sekundær knap link" defaultValue={fieldValue(initialValues, "publicCtaSecondaryHref")} />
          </div>
        </SectionCard>
      </div>

      {status ? (
        <div className="admin-alert admin-alert-success">
          {status}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
        >
          Gem public forside
        </button>
      </div>
    </form>
  );
}
