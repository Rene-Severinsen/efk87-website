import fs from "fs";
import path from "path";

const root = process.cwd();

function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    ensureDir(absolutePath);
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

function patchFile(relativePath, patcher) {
    const absolutePath = path.join(root, relativePath);

    if (!fs.existsSync(absolutePath)) {
        console.warn(`Skipped ${relativePath} — file not found`);
        return;
    }

    const current = fs.readFileSync(absolutePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No change ${relativePath}`);
        return;
    }

    fs.writeFileSync(absolutePath, next, "utf8");
    console.log(`Patched ${relativePath}`);
}

function patchClubSettingsSchema(schema) {
    if (!schema.includes("model ClubSettings")) return schema;

    const start = schema.indexOf("model ClubSettings {");
    const end = schema.indexOf("\n}", start);

    if (start === -1 || end === -1) return schema;

    const before = schema.slice(0, end);
    const after = schema.slice(end);

    const fields = [
        `  logoUrl      String?`,
        `  logoAltText  String?`,
        `  faviconUrl   String?`,
        `  appleIconUrl String?`,
    ];

    let insert = "";

    for (const field of fields) {
        const fieldName = field.trim().split(/\s+/)[0];

        if (!schema.includes(`${fieldName} `)) {
            insert += `\n${field}`;
        }
    }

    return `${before}${insert}${after}`;
}

patchFile("prisma/schema.prisma", patchClubSettingsSchema);

writeFile(
    "src/lib/branding/clubBrandingService.ts",
    `
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import prisma from "../db/prisma";

const allowedLogoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

const maxUploadSizeBytes = 25 * 1024 * 1024;

export interface ClubBrandingDTO {
  logoUrl: string | null;
  logoAltText: string | null;
  faviconUrl: string | null;
  appleIconUrl: string | null;
}

function normalizeNullableText(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

async function toInputBuffer(file: File): Promise<Buffer> {
  if (!allowedLogoMimeTypes.has(file.type)) {
    throw new Error("Logo skal være JPG, PNG, WebP, HEIC, HEIF eller GIF.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error("Logoet er for stort. Maksimal størrelse er 25 MB.");
  }

  return Buffer.from(await file.arrayBuffer());
}

async function createLogoWebp(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: 900,
      height: 360,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 90,
    })
    .toBuffer();
}

async function createSquarePngIcon(inputBuffer: Buffer, size: number): Promise<Buffer> {
  return sharp(inputBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
}

export async function getClubBranding(clubId: string): Promise<ClubBrandingDTO> {
  const settings = await prisma.clubSettings.findUnique({
    where: {
      clubId,
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return {
    logoUrl: settings?.logoUrl ?? null,
    logoAltText: settings?.logoAltText ?? null,
    faviconUrl: settings?.faviconUrl ?? null,
    appleIconUrl: settings?.appleIconUrl ?? null,
  };
}

export async function updateClubBrandingFromLogoUpload({
  clubId,
  clubSlug,
  logoFile,
  logoAltText,
}: {
  clubId: string;
  clubSlug: string;
  logoFile: File;
  logoAltText: string | null;
}): Promise<ClubBrandingDTO> {
  const inputBuffer = await toInputBuffer(logoFile);

  const publicDirectory = \`uploads/\${clubSlug}/branding\`;
  const outputDirectory = path.join(process.cwd(), "public", publicDirectory);

  await mkdir(outputDirectory, { recursive: true });

  const logoBuffer = await createLogoWebp(inputBuffer);
  const favicon32Buffer = await createSquarePngIcon(inputBuffer, 32);
  const favicon48Buffer = await createSquarePngIcon(inputBuffer, 48);
  const appleIconBuffer = await createSquarePngIcon(inputBuffer, 180);

  const logoFileName = "logo.webp";
  const favicon32FileName = "favicon-32.png";
  const favicon48FileName = "favicon-48.png";
  const appleIconFileName = "apple-touch-icon.png";

  await Promise.all([
    writeFile(path.join(outputDirectory, logoFileName), logoBuffer),
    writeFile(path.join(outputDirectory, favicon32FileName), favicon32Buffer),
    writeFile(path.join(outputDirectory, favicon48FileName), favicon48Buffer),
    writeFile(path.join(outputDirectory, appleIconFileName), appleIconBuffer),
  ]);

  const logoUrl = \`/\${publicDirectory}/\${logoFileName}\`;
  const faviconUrl = \`/\${publicDirectory}/\${favicon32FileName}\`;
  const appleIconUrl = \`/\${publicDirectory}/\${appleIconFileName}\`;

  const settings = await prisma.clubSettings.upsert({
    where: {
      clubId,
    },
    create: {
      clubId,
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },
    update: {
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return settings;
}

export async function updateClubBrandingText({
  clubId,
  logoAltText,
}: {
  clubId: string;
  logoAltText: string | null;
}): Promise<ClubBrandingDTO> {
  const settings = await prisma.clubSettings.update({
    where: {
      clubId,
    },
    data: {
      logoAltText: normalizeNullableText(logoAltText),
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return settings;
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/settings/branding/page.tsx",
    `
import { notFound } from "next/navigation";
import AdminShell from "../../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { getClubBranding } from "../../../../../lib/branding/clubBrandingService";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import BrandingSettingsClient from "./BrandingSettingsClient";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function BrandingSettingsPage({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/settings/branding\`,
  );

  const branding = await getClubBranding(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Branding
          </h1>
          <p className="max-w-3xl text-slate-400">
            Upload klubbens logo. Favicon og Apple touch icon dannes automatisk fra logoet.
          </p>
        </div>

        <BrandingSettingsClient
          clubSlug={clubSlug}
          initialBranding={branding}
        />
      </div>
    </AdminShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/settings/branding/BrandingSettingsClient.tsx",
    `
"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ClubBrandingDTO } from "../../../../../lib/branding/clubBrandingService";

interface BrandingSettingsClientProps {
  clubSlug: string;
  initialBranding: ClubBrandingDTO;
}

interface UploadResult {
  success: boolean;
  error?: string;
}

export default function BrandingSettingsClient({
  clubSlug,
  initialBranding,
}: BrandingSettingsClientProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [branding, setBranding] = useState(initialBranding);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setStatus("idle");
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch(\`/\${clubSlug}/admin/settings/branding/upload\`, {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as UploadResult & {
        branding?: ClubBrandingDTO;
      };

      if (!response.ok || !result.success) {
        setStatus("error");
        setError(result.error || "Branding kunne ikke gemmes.");
        return;
      }

      if (result.branding) {
        setBranding(result.branding);
      }

      formRef.current?.reset();
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (uploadError) {
      setStatus("error");
      setError(uploadError instanceof Error ? uploadError.message : "Branding kunne ikke gemmes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">
            Logo og favicon
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Upload logo én gang. Systemet danner selv favicon og Apple icon. Der bruges ingen fallback.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="logoFile" className="block text-sm font-medium text-slate-300">
              Logo
            </label>
            <input
              id="logoFile"
              name="logoFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/gif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WebP, HEIC, HEIF eller GIF. Maks 25 MB.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="logoAltText" className="block text-sm font-medium text-slate-300">
              Logo alt-tekst
            </label>
            <input
              id="logoAltText"
              name="logoAltText"
              defaultValue={branding.logoAltText ?? ""}
              placeholder="Fx EFK87 logo"
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {status === "success" ? (
          <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-400">
            Branding er gemt.
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-400">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:bg-sky-500 disabled:bg-slate-700 disabled:shadow-none"
          >
            {isSaving ? "Gemmer..." : "Gem branding"}
          </button>
        </div>
      </form>

      <section className="rounded-3xl border border-white/10 bg-[#121b2e]/80 p-6 shadow-2xl backdrop-blur-md">
        <h2 className="mb-5 text-xl font-bold text-white">
          Aktuel branding
        </h2>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Logo
            </p>

            {branding.logoUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.logoUrl}
                    alt={branding.logoAltText || "Klublogo"}
                    className="max-h-24 max-w-full object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.logoUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Logo er ikke sat.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Favicon
            </p>

            {branding.faviconUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.faviconUrl}
                    alt=""
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.faviconUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Favicon er ikke dannet endnu.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            <p className="mb-3 text-sm font-bold text-slate-300">
              Apple icon
            </p>

            {branding.appleIconUrl ? (
              <>
                <div className="flex min-h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={branding.appleIconUrl}
                    alt=""
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <code className="mt-3 block break-all text-xs text-slate-400">
                  {branding.appleIconUrl}
                </code>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Apple icon er ikke dannet endnu.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/settings/branding/upload/route.ts",
    `
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import {
  updateClubBrandingFromLogoUpload,
  updateClubBrandingText,
} from "../../../../../../lib/branding/clubBrandingService";
import { requireClubBySlug } from "../../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    await requireClubAdminForClub(
      club.id,
      clubSlug,
      \`/\${clubSlug}/admin/settings/branding\`,
    );

    const formData = await request.formData();
    const logoFile = formData.get("logoFile");
    const logoAltText = getText(formData, "logoAltText");

    const branding =
      logoFile instanceof File && logoFile.size > 0
        ? await updateClubBrandingFromLogoUpload({
            clubId: club.id,
            clubSlug,
            logoFile,
            logoAltText,
          })
        : await updateClubBrandingText({
            clubId: club.id,
            logoAltText,
          });

    revalidatePath(\`/\${clubSlug}\`);
    revalidatePath(\`/\${clubSlug}/admin/settings/branding\`);

    return NextResponse.json({
      success: true,
      branding,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Branding kunne ikke gemmes.",
      },
      { status: 500 },
    );
  }
}
`,
);

writeFile(
    "src/lib/branding/clubBrandingMetadata.ts",
    `
import type { Metadata } from "next";
import prisma from "../db/prisma";

export async function getClubBrandingMetadata(clubSlug: string): Promise<Metadata> {
  const club = await prisma.club.findUnique({
    where: {
      slug: clubSlug,
    },
    select: {
      name: true,
      settings: {
        select: {
          logoUrl: true,
          faviconUrl: true,
          appleIconUrl: true,
        },
      },
    },
  });

  if (!club?.settings) {
    return {};
  }

  const icons: NonNullable<Metadata["icons"]> = {};

  if (club.settings.faviconUrl) {
    icons.icon = [
      {
        url: club.settings.faviconUrl,
        type: "image/png",
        sizes: "32x32",
      },
    ];
    icons.shortcut = club.settings.faviconUrl;
  }

  if (club.settings.appleIconUrl) {
    icons.apple = [
      {
        url: club.settings.appleIconUrl,
        type: "image/png",
        sizes: "180x180",
      },
    ];
  }

  return {
    icons,
  };
}
`,
);

patchFile("src/lib/publicSite/publicPageRoute.ts", (current) => {
    if (current.includes("logoUrl: true")) return current;

    return current.replace(
        `publicThemeMode: true,`,
        `publicThemeMode: true,
          logoUrl: true,
          logoAltText: true,
          faviconUrl: true,
          appleIconUrl: true,`,
    );
});

patchFile("src/components/publicSite/ThemedClubPageShell.tsx", (current) => {
    let next = current;

    if (!next.includes("logoUrl?: string | null")) {
        next = next.replace(
            `clubDisplayName: string;`,
            `clubDisplayName: string;
  logoUrl?: string | null;
  logoAltText?: string | null;`,
        );
    }

    if (!next.includes("logoUrl,")) {
        next = next.replace(
            `clubDisplayName,`,
            `clubDisplayName,
  logoUrl,
  logoAltText,`,
        );
    }

    if (!next.includes("themed-club-logo")) {
        next = next.replace(
            /(<Link[^>]*className="[^"]*(?:brand|logo|club)[^"]*"[^>]*>[\s\S]*?)(\{clubDisplayName\})/,
            `$1{logoUrl ? (
              <img
                src={logoUrl}
                alt={logoAltText || clubDisplayName}
                className="themed-club-logo"
              />
            ) : null}
            $2`,
        );
    }

    return next;
});

patchFile("src/components/publicSite/ThemedClubPageShell.css", (current) => {
    if (current.includes(".themed-club-logo")) return current;

    return `${current.trimEnd()}

.themed-club-logo {
  display: block;
  width: auto;
  height: 2.4rem;
  max-width: 10rem;
  object-fit: contain;
}

@media (max-width: 640px) {
  .themed-club-logo {
    height: 2rem;
    max-width: 8rem;
  }
}
`;
});

function patchShellUsageInFile(relativePath) {
    patchFile(relativePath, (current) => {
        if (!current.includes("<ThemedClubPageShell")) return current;
        if (current.includes("logoUrl={publicSettings?.logoUrl")) return current;

        return current.replace(
            /(clubDisplayName=\{[^}]+\})/,
            `$1
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}`,
        );
    });
}

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "generated") continue;
            walk(absolute, callback);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".tsx")) {
            callback(path.relative(root, absolute));
        }
    }
}

walk(path.join(root, "src/app/[clubSlug]"), patchShellUsageInFile);

patchFile("src/app/[clubSlug]/layout.tsx", (current) => {
    if (current.includes("getClubBrandingMetadata")) return current;

    let next = current;

    next = next.replace(
        `import type { Metadata } from "next";`,
        `import type { Metadata } from "next";
import { getClubBrandingMetadata } from "../../lib/branding/clubBrandingMetadata";`,
    );

    if (!next.includes("generateMetadata")) {
        next = `${next.trimEnd()}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubSlug: string }>;
}): Promise<Metadata> {
  const { clubSlug } = await params;

  return getClubBrandingMetadata(clubSlug);
}
`;
    }

    return next;
});

patchFile("src/components/admin/AdminSidebar.tsx", (current) => {
    if (current.includes("/admin/settings/branding")) return current;

    const link = `
          <a
            href={\`/\${clubSlug}/admin/settings/branding\`}
            className={\`admin-sidebar-item \${pathname?.startsWith(\`/\${clubSlug}/admin/settings/branding\`) ? "active" : ""}\`}
          >
            Branding
          </a>`;

    if (current.includes("/admin/settings")) {
        return current.replace(
            /(<a[\s\S]*?\/admin\/settings[\s\S]*?<\/a>)/,
            `$1${link}`,
        );
    }

    return current.replace(/(<\/nav>)/, `${link}\n$1`);
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npx prisma db push");
console.log("npx prisma generate");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");