import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/lib/statistics/statisticsService.ts");

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

const current = fs.readFileSync(filePath, "utf8");

const next = current.replaceAll("flyingDate", "flightDate");

if (next === current) {
    console.log("No changes needed.");
} else {
    fs.writeFileSync(filePath, next, "utf8");
    console.log("Patched src/lib/statistics/statisticsService.ts");
}