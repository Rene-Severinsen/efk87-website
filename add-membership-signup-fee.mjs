import fs from "fs";
import path from "path";

const root = process.cwd();

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

patchFile("prisma/schema.prisma", (current) => {
    if (current.includes("signupFee")) return current;

    return current.replace(
        /price\s+String\n\s+period\s+String/,
        `price       String
  signupFee   String
  period      String`,
    );
});

patchFile("src/lib/membershipPage/membershipPageDefaults.ts", (current) => {
    let next = current;

    if (!next.includes("signupFee: string;")) {
        next = next.replace(
            /price: string;\n\s+period: string;/,
            `price: string;
  signupFee: string;
  period: string;`,
        );
    }

    next = next.replace(
        /price: "Udfyld pris",\n\s+period: "pr\. år",/g,
        `price: "Udfyld pris",
      signupFee: "Udfyld gebyr",
      period: "pr. år",`,
    );

    return next;
});

patchFile("src/lib/membershipPage/membershipPageService.ts", (current) => {
    let next = current;

    if (!next.includes("signupFee: fee.signupFee.trim()")) {
        next = next.replace(
            /price: fee\.price\.trim\(\),\n\s+period: fee\.period\.trim\(\),/,
            `price: fee.price.trim(),
    signupFee: fee.signupFee.trim(),
    period: fee.period.trim(),`,
        );
    }

    if (!next.includes("signupFee: fee.signupFee,")) {
        next = next.replace(
            /price: fee\.price,\n\s+period: fee\.period,/,
            `price: fee.price,
            signupFee: fee.signupFee,
            period: fee.period,`,
        );
    }

    if (!next.includes("signupFee: fee.signupFee,")) {
        next = next.replace(
            /price: fee\.price,\n\s+period: fee\.period,/g,
            `price: fee.price,
          signupFee: fee.signupFee,
          period: fee.period,`,
        );
    }

    if (!next.includes("signupFee: fee.signupFee,")) {
        next = next.replace(
            /title: fee\.title,\n\s+price: fee\.price,\n\s+period: fee\.period,/,
            `title: fee.title,
          price: fee.price,
          signupFee: fee.signupFee,
          period: fee.period,`,
        );
    }

    if (!next.includes("fee.signupFee")) {
        next = next.replace(
            /\.filter\(\(fee\) => fee\.title && fee\.price && fee\.period\)/,
            `.filter((fee) => fee.title && fee.price && fee.signupFee && fee.period)`,
        );
    } else {
        next = next.replace(
            /\.filter\(\(fee\) => fee\.title && fee\.price && fee\.period\)/,
            `.filter((fee) => fee.title && fee.price && fee.signupFee && fee.period)`,
        );
    }

    next = next.replace(
        /price: fee\.price,\n\s+period: fee\.period,\n\s+description: fee\.description,/g,
        `price: fee.price,
          signupFee: fee.signupFee,
          period: fee.period,
          description: fee.description,`,
    );

    return next;
});

patchFile("src/lib/admin/membershipPageActions.ts", (current) => {
    let next = current;

    if (!next.includes("signupFee: z.string()")) {
        next = next.replace(
            /price: z\.string\(\)\.trim\(\)\.min\(1, "Pris skal udfyldes\."\),\n\s+period:/,
            `price: z.string().trim().min(1, "Pris skal udfyldes."),
  signupFee: z.string().trim().min(1, "Indmeldelsesgebyr skal udfyldes."),
  period:`,
        );
    }

    return next;
});

patchFile("src/app/[clubSlug]/admin/medlemsskab/MembershipPageAdminForm.tsx", (current) => {
    let next = current;

    if (!next.includes("signupFee: \"\"")) {
        next = next.replace(
            /price: "",\n\s+period: "pr\. år",/,
            `price: "",
    signupFee: "",
    period: "pr. år",`,
        );
    }

    if (!next.includes("Indmeldelsesgebyr")) {
        next = next.replace(
            /<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">/,
            `<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">`,
        );

        next = next.replace(
            /<div className="space-y-2">\s*<label className="block text-sm font-medium text-slate-300">\s*Periode\s*<\/label>\s*<input\s*value={fee\.period}/,
            `<div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Indmeldelsesgebyr
                  </label>
                  <input
                    value={fee.signupFee}
                    onChange={(event) => updateFee(index, { signupFee: event.target.value })}
                    placeholder="fx 250 kr."
                    className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Periode
                  </label>
                  <input
                    value={fee.period}`,
        );
    }

    return next;
});

patchFile("src/app/[clubSlug]/om/medlemsskab/page.tsx", (current) => {
    let next = current;

    next = next.replace(
        /<span className="ml-2 text-sm font-normal text-\[var\(--public-text-muted\)\]">\s*\{fee\.period\}\s*<\/span>/,
        `<span className="ml-3 text-sm font-normal text-[var(--public-text-muted)]">
                      {fee.period}
                    </span>`,
    );

    if (!next.includes("Indmeldelsesgebyr")) {
        next = next.replace(
            /<p className="mt-4 text-base font-normal leading-relaxed text-\[var\(--public-text\)\]">\s*\{fee\.description\}\s*<\/p>/,
            `<div className="mt-4 rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--public-text-muted)]">
                      Indmeldelsesgebyr
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--public-text)]">
                      {fee.signupFee}
                    </p>
                  </div>

                  <p className="mt-4 text-base font-normal leading-relaxed text-[var(--public-text)]">
                    {fee.description}
                  </p>`,
        );
    }

    return next;
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