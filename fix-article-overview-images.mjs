import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/app/[clubSlug]/artikler/page.tsx",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");

current = current.replace(
    `<div
                            className="min-h-[220px] bg-cover bg-center bg-no-repeat transition duration-300 hover:scale-[1.02]"
                            style={{
                              backgroundImage: \`url(\${featuredArticle.heroImageUrl})\`,
                            }}
                        />`,
    `<img
                            src={featuredArticle.heroImageUrl}
                            alt={featuredArticle.title}
                            className="h-[220px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                        />`,
);

current = current.replace(
    `<div
                                  className="min-h-[160px] bg-cover bg-center bg-no-repeat transition duration-300 hover:scale-[1.02]"
                                  style={{
                                    backgroundImage: \`url(\${article.heroImageUrl})\`,
                                  }}
                              />`,
    `<img
                                  src={article.heroImageUrl}
                                  alt={article.title}
                                  className="h-[160px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                              />`,
);

fs.writeFileSync(filePath, current, "utf8");

console.log("Patched src/app/[clubSlug]/artikler/page.tsx");
console.log("");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");