import fs from "fs";
import path from "path";

const servicePath = path.join(process.cwd(), "src/lib/statistics/statisticsService.ts");
const pagePath = path.join(process.cwd(), "src/app/[clubSlug]/om/statistik/page.tsx");

function patchFile(filePath, patcher) {
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        process.exit(1);
    }

    const current = fs.readFileSync(filePath, "utf8");
    const next = patcher(current);

    if (next === current) {
        console.log(`No changes in ${filePath}`);
        return;
    }

    fs.writeFileSync(filePath, next, "utf8");
    console.log(`Patched ${filePath}`);
}

patchFile(servicePath, (current) => {
    let next = current;

    next = next.replace(
        `createdAt: true,
      memberStatus: true,`,
        `createdAt: true,
      updatedAt: true,
      memberStatus: true,`,
    );

    next = next.replace(
        `members.forEach((member) => {
    if (member.createdAt.getFullYear() !== now.getFullYear()) return;

    const point = monthlyByKey.get(monthKey(member.createdAt));
    if (!point) return;

    point.joined += 1;
    point.net += 1;
  });`,
        `members.forEach((member) => {
    if (member.createdAt.getFullYear() !== now.getFullYear()) return;

    const point = monthlyByKey.get(monthKey(member.createdAt));
    if (!point) return;

    point.joined += 1;
    point.net += 1;
  });

  leftMembers.forEach((member) => {
    if (member.updatedAt.getFullYear() !== now.getFullYear()) return;

    const point = monthlyByKey.get(monthKey(member.updatedAt));
    if (!point) return;

    point.left += 1;
    point.net -= 1;
  });`,
    );

    next = next.replace(
        `netThisYear: null,
      hasLeftDateHistory: false,`,
        `netThisYear: newThisYear - leftMembers.filter((member) => member.updatedAt >= yearStart).length,
      hasLeftDateHistory: true,`,
    );

    return next;
});

patchFile(pagePath, (current) => {
    let next = current;

    next = next.replace(
        `helper="Baseret på medlemsstatus."`,
        `helper="Baseret på medlemsstatus. Dato bruger seneste opdatering indtil importhistorik findes."`,
    );

    next = next.replace(
        `<KpiCard
              label="Netto i år"
              value="Afventer historik"
              helper="Kræver valideret udmeldelsesdato fra importen."
            />`,
        `<KpiCard
              label="Netto i år"
              value={statistics.membershipDevelopment.netThisYear ?? "Afventer historik"}
              helper="Tilgang minus udmeldte i år."
            />`,
    );

    next = next.replace(
        `Afgang pr. måned kobles på, når historisk udmeldelsesdato er valideret ved import.`,
        `Afgang vises ud fra seneste opdateringsdato for udmeldt status, indtil historisk udmeldelsesdato importeres.`,
    );

    next = next.replace(
        `Afgang afventer historik`,
        `Afgang`,
    );

    next = next.replace(
        `const maxValue = Math.max(...points.map((point) => Math.max(point.joined, point.left)), 1);`,
        `const maxValue = Math.max(...points.map((point) => Math.max(point.joined, point.left)), 1);`,
    );

    next = next.replace(
        `{points.map((point, index) => {
            const x = paddingLeft + index * slotWidth + slotWidth / 2;
            const joinedHeight = getBarHeight(point.joined);
            const y = height - paddingBottom - joinedHeight;

            return (
              <g key={point.label}>
                {point.joined > 0 ? (
                  <>
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={joinedHeight}
                      rx="8"
                      fill="var(--public-primary)"
                    />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="fill-[var(--public-text)] text-[12px] font-bold"
                    >
                      {point.joined}
                    </text>
                  </>
                ) : (
                  <text
                    x={x}
                    y={height - paddingBottom - 8}
                    textAnchor="middle"
                    className="fill-[var(--public-text-muted)] text-[11px]"
                  >
                    0
                  </text>
                )}

                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}`,
        `{points.map((point, index) => {
            const x = paddingLeft + index * slotWidth + slotWidth / 2;
            const joinedHeight = getBarHeight(point.joined);
            const leftHeight = getBarHeight(point.left);
            const joinedY = height - paddingBottom - joinedHeight;
            const leftY = height - paddingBottom - leftHeight;
            const groupedBarWidth = Math.min(22, barWidth * 0.72);

            return (
              <g key={point.label}>
                {point.joined > 0 ? (
                  <>
                    <rect
                      x={x - groupedBarWidth - 2}
                      y={joinedY}
                      width={groupedBarWidth}
                      height={joinedHeight}
                      rx="7"
                      fill="var(--public-primary)"
                    />
                    <text
                      x={x - groupedBarWidth / 2 - 2}
                      y={joinedY - 8}
                      textAnchor="middle"
                      className="fill-[var(--public-text)] text-[12px] font-bold"
                    >
                      {point.joined}
                    </text>
                  </>
                ) : null}

                {point.left > 0 ? (
                  <>
                    <rect
                      x={x + 2}
                      y={leftY}
                      width={groupedBarWidth}
                      height={leftHeight}
                      rx="7"
                      fill="var(--public-text-muted)"
                      opacity="0.75"
                    />
                    <text
                      x={x + groupedBarWidth / 2 + 2}
                      y={leftY - 8}
                      textAnchor="middle"
                      className="fill-[var(--public-text)] text-[12px] font-bold"
                    >
                      {point.left}
                    </text>
                  </>
                ) : null}

                {point.joined === 0 && point.left === 0 ? (
                  <text
                    x={x}
                    y={height - paddingBottom - 8}
                    textAnchor="middle"
                    className="fill-[var(--public-text-muted)] text-[11px]"
                  >
                    0
                  </text>
                ) : null}

                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {point.label}
                </text>
              </g>
            );
          })}`,
    );

    return next;
});

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");