"use client";

import { useState } from "react";
import { updateLocationPageContentAction } from "../../../../lib/admin/locationPageActions";
import { ClubLocationPageContent } from "../../../../lib/locationPage/locationPageDefaults";
import { ClubMediaAssetDTO } from "../../../../lib/media/mediaTypes";
import MediaUrlPicker from "../../../../components/admin/media/MediaUrlPicker";

interface LocationPageAdminFormProps {
    clubSlug: string;
    initialContent: ClubLocationPageContent;
    mediaAssets: ClubMediaAssetDTO[];
}

function TextInput({
                       name,
                       label,
                       value,
                       placeholder,
                   }: {
    name: keyof ClubLocationPageContent;
    label: string;
    value: string | null;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="admin-form-label">
                {label}
            </label>
            <input
                id={name}
                name={name}
                defaultValue={value ?? ""}
                placeholder={placeholder}
                className="admin-input"
            />
        </div>
    );
}

function TextArea({
                      name,
                      label,
                      value,
                      rows = 5,
                      helpText,
                  }: {
    name: keyof ClubLocationPageContent;
    label: string;
    value: string;
    rows?: number;
    helpText?: string;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className="admin-form-label">
                {label}
            </label>
            <textarea
                id={name}
                name={name}
                defaultValue={value}
                rows={rows}
                className="admin-textarea"
            />
            {helpText ? (
                <p className="admin-form-help">
                    {helpText}
                </p>
            ) : null}
        </div>
    );
}

function ImageFieldset({
                           title,
                           urlName,
                           titleName,
                           descriptionName,
                           altName,
                           urlValue,
                           titleValue,
                           descriptionValue,
                           altValue,
                           mediaAssets,
                       }: {
    title: string;
    urlName: keyof ClubLocationPageContent;
    titleName: keyof ClubLocationPageContent;
    descriptionName: keyof ClubLocationPageContent;
    altName: keyof ClubLocationPageContent;
    urlValue: string | null;
    titleValue: string;
    descriptionValue: string;
    altValue: string;
    mediaAssets: ClubMediaAssetDTO[];
}) {
    return (
        <div className="admin-card">
            <h3 className="admin-section-title">
                {title}
            </h3>

            <div className="grid grid-cols-1 gap-4">
                <MediaUrlPicker
                    name={urlName}
                    label="Billede"
                    value={urlValue}
                    assets={mediaAssets}
                />

                <TextInput
                    name={titleName}
                    label="Billedtitel"
                    value={titleValue}
                />

                <TextArea
                    name={descriptionName}
                    label="Billedtekst"
                    value={descriptionValue}
                    rows={3}
                />

                <TextInput
                    name={altName}
                    label="Alt-tekst"
                    value={altValue}
                />
            </div>
        </div>
    );
}

export default function LocationPageAdminForm({
                                                  clubSlug,
                                                  initialContent,
                                                  mediaAssets,
                                              }: LocationPageAdminFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setStatus("idle");
        setError(null);

        const result = await updateLocationPageContentAction(clubSlug, formData);

        setIsSaving(false);

        if (result.success) {
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000);
            return;
        }

        setStatus("error");
        setError(result.error || "Der skete en fejl ved gemning.");
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <div className="admin-card">
                <div className="mb-6">
                    <h2 className="admin-section-title">
                        Tekster
                    </h2>
                    <p className="admin-muted">
                        Disse tekster vises på den offentlige “Her bor vi”-side.
                    </p>
                </div>

                <div className="space-y-6">
                    <TextArea
                        name="accessNotice"
                        label="Vigtig adgangsinformation"
                        value={initialContent.accessNotice}
                        rows={4}
                    />

                    <TextArea
                        name="drivingGuide"
                        label="Kørselsvejledning"
                        value={initialContent.drivingGuide}
                        rows={8}
                        helpText="Brug tom linje mellem afsnit."
                    />

                    <TextArea
                        name="parkingGuide"
                        label="Parkering og adgang"
                        value={initialContent.parkingGuide}
                        rows={8}
                        helpText="Brug tom linje mellem afsnit."
                    />
                </div>
            </div>

            <div className="admin-card">
                <div className="mb-6">
                    <h2 className="admin-section-title">
                        Billeder til plads og adgang
                    </h2>
                    <p className="admin-muted">
                        Vælg billeder fra Media Library eller indsæt en ekstern URL manuelt.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <ImageFieldset
                        title="Adgangsvej"
                        urlName="accessImageUrl"
                        titleName="accessImageTitle"
                        descriptionName="accessImageDescription"
                        altName="accessImageAlt"
                        urlValue={initialContent.accessImageUrl}
                        titleValue={initialContent.accessImageTitle}
                        descriptionValue={initialContent.accessImageDescription}
                        altValue={initialContent.accessImageAlt}
                        mediaAssets={mediaAssets}
                    />

                    <ImageFieldset
                        title="Kørselsvej"
                        urlName="drivingImageUrl"
                        titleName="drivingImageTitle"
                        descriptionName="drivingImageDescription"
                        altName="drivingImageAlt"
                        urlValue={initialContent.drivingImageUrl}
                        titleValue={initialContent.drivingImageTitle}
                        descriptionValue={initialContent.drivingImageDescription}
                        altValue={initialContent.drivingImageAlt}
                        mediaAssets={mediaAssets}
                    />

                    <ImageFieldset
                        title="Parkering"
                        urlName="parkingImageUrl"
                        titleName="parkingImageTitle"
                        descriptionName="parkingImageDescription"
                        altName="parkingImageAlt"
                        urlValue={initialContent.parkingImageUrl}
                        titleValue={initialContent.parkingImageTitle}
                        descriptionValue={initialContent.parkingImageDescription}
                        altValue={initialContent.parkingImageAlt}
                        mediaAssets={mediaAssets}
                    />
                </div>
            </div>

            <div className="admin-card">
                <div className="mb-6">
                    <h2 className="admin-section-title">
                        Indendørsflyvning
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="space-y-5">
                        <TextInput
                            name="indoorTitle"
                            label="Titel"
                            value={initialContent.indoorTitle}
                        />

                        <TextArea
                            name="indoorDescription"
                            label="Beskrivelse"
                            value={initialContent.indoorDescription}
                            rows={5}
                        />

                        <TextInput
                            name="indoorVenueName"
                            label="Stednavn"
                            value={initialContent.indoorVenueName}
                        />

                        <TextArea
                            name="indoorAddress"
                            label="Adresse"
                            value={initialContent.indoorAddress}
                            rows={4}
                            helpText="Brug én linje pr. adresselinje."
                        />

                        <TextInput
                            name="indoorSchedule"
                            label="Tidspunkt/sæson"
                            value={initialContent.indoorSchedule}
                        />

                        <TextArea
                            name="indoorNote"
                            label="Note"
                            value={initialContent.indoorNote}
                            rows={4}
                        />
                    </div>

                    <ImageFieldset
                        title="Billede til indendørsflyvning"
                        urlName="indoorImageUrl"
                        titleName="indoorImageTitle"
                        descriptionName="indoorImageDescription"
                        altName="indoorImageAlt"
                        urlValue={initialContent.indoorImageUrl}
                        titleValue={initialContent.indoorImageTitle}
                        descriptionValue={initialContent.indoorImageDescription}
                        altValue={initialContent.indoorImageAlt}
                        mediaAssets={mediaAssets}
                    />
                </div>
            </div>

            {status === "success" ? (
                <div className="admin-alert admin-alert-success">
                    Her bor vi-indholdet er gemt.
                </div>
            ) : null}

            {status === "error" && error ? (
                <div className="admin-alert admin-alert-danger">
                    {error}
                </div>
            ) : null}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="admin-btn admin-btn-primary"
                >
                    {isSaving ? "Gemmer..." : "Gem Her bor vi"}
                </button>
            </div>
        </form>
    );
}