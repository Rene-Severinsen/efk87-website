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

patchFile("src/app/[clubSlug]/admin/medlemsskab/MembershipPageAdminForm.tsx", (current) => {
    let next = current;

    next = next.replace(
        /<div className="space-y-5">\s*\{fees\.map\(\(fee, index\) => \(/,
        `<div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {fees.map((fee, index) => (`,
    );

    next = next.replace(
        /className="rounded-2xl border border-white\/10 bg-white\/\[0\.03\] p-5"/,
        `className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5"`,
    );

    next = next.replace(
        /<div className="grid grid-cols-1 gap-4 lg:grid-cols-5">/,
        `<div className="grid grid-cols-1 gap-4">`,
    );

    next = next.replace(
        /<div className="mt-4 space-y-2">\s*<label className="block text-sm font-medium text-slate-300">\s*Beskrivelse\s*<\/label>/,
        `<div className="mt-4 flex-1 space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Beskrivelse
                </label>`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");