import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/app/[clubSlug]/om/statistik/page.tsx",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

const current = fs.readFileSync(filePath, "utf8");

const startMarker = "function MembershipDevelopmentChart({";
const endMarker = "\n\nexport default async function StatisticsPage";

const start = current.indexOf(startMarker);
const end = current.indexOf(endMarker);

if (start === -1 || end === -1) {
    console.error("Could not find MembershipDevelopmentChart block.");
    process.exit(1);
}

const replacement = `
function MembershipDevelopmentChart({
  points,
}: {
  points: { label: string; joined: number; left: number; net: number }[];
}) {
  const width = 900;
  const height = 280;
  const paddingTop = 28;
  const paddingRight = 24;
  const paddingBottom = 42;
  const paddingLeft = 40;
  const maxValue = Math.max(...points.map((point) => Math.max(point.joined, point.left)), 1);
  const usableWidth = width - paddingLeft - paddingRight;
  const usableHeight = height - paddingTop - paddingBottom;
  const slotWidth = usableWidth / points.length;
  const barWidth = Math.min(34, slotWidth * 0.42);

  function getBarHeight(value: number): number {
    if (value <= 0) return 0;

    return Math.max((value / maxValue) * usableHeight, 8);
  }

  return (
    <ThemedSectionCard className="p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[var(--public-text)] sm:text-2xl">
          Medlemsudvikling i år
        </h2>
        <p className="mt-2 text-sm font-normal leading-relaxed text-[var(--public-text-muted)] sm:text-base">
          Tilgang vises ud fra oprettelses-/indmeldelsesdato. Afgang pr. måned kobles på, når historisk udmeldelsesdato er valideret ved import.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm font-semibold">
        <div className="flex items-center gap-2 text-[var(--public-text)]">
          <span className="h-3 w-3 rounded-full bg-[var(--public-primary)]" />
          Tilgang
        </div>
        <div className="flex items-center gap-2 text-[var(--public-text-muted)]">
          <span className="h-3 w-3 rounded-full border border-[var(--public-card-border)] bg-[var(--public-surface)]" />
          Afgang afventer historik
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4">
        <svg
          viewBox={\`0 0 \${width} \${height}\`}
          className="min-w-[760px]"
          role="img"
          aria-label="Medlemsudvikling i år"
        >
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={height - paddingBottom}
            stroke="var(--public-card-border)"
            strokeWidth="2"
          />

          {[0, 1].map((ratio) => {
            const y = paddingTop + usableHeight * ratio;
            const value = Math.round(maxValue * (1 - ratio));

            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--public-card-border)"
                  strokeWidth="1"
                  opacity="0.55"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--public-text-muted)] text-[11px]"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
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
          })}
        </svg>
      </div>
    </ThemedSectionCard>
  );
}
`;

const next = `${current.slice(0, start)}${replacement}${current.slice(end)}`;

fs.writeFileSync(filePath, next, "utf8");
console.log("Patched src/app/[clubSlug]/om/statistik/page.tsx");