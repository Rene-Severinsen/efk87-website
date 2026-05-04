import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');

const SCAN_DIRS = [
  'src/app/[clubSlug]',
  'src/components/publicSite',
  'src/lib/publicSite',
];

const IGNORE_PATTERNS = [
  '/admin/',
  'docs/',
  'node_modules/',
  '.next/',
];

const PROHIBITED_PATTERNS = [
  /\btext-white\b/,
  /\bbg-white\//,
  /\bborder-white\//,
  /\btext-slate-/,
  /\bbg-slate-/,
  /\bborder-slate-/,
  /\btext-sky-/,
  /\bbg-sky-/,
  /\bborder-sky-/,
  /\btext-blue-/,
  /\bbg-blue-/,
  /\bborder-blue-/,
  /\btext-emerald-/,
  /\bbg-emerald-/,
  /\bborder-emerald-/,
  /\btext-amber-/,
  /\bbg-amber-/,
  /\bborder-amber-/,
  /\btext-red-/,
  /\bbg-red-/,
  /\bborder-red-/,
  /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/,
];

const ALLOWED_EXCEPTIONS = [
  'print:text-black',
  'print:bg-white',
  'var(--public-text-on-primary)',
  'var(--home-text-on-primary)',
];

const EXCEPTION_COMMENT = 'THEME_EXCEPTION';

let violationsFound = 0;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    if (line.includes(EXCEPTION_COMMENT)) return;

    PROHIBITED_PATTERNS.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        const matchedText = match[0];
        
        // Check if it's an allowed exception
        if (ALLOWED_EXCEPTIONS.some(ex => line.includes(ex))) {
          // Additional check: if the match is part of the exception, skip it
          // This is a bit naive but covers the requested exceptions
          return;
        }

        console.log(`${filePath}:${index + 1}: match: ${matchedText}`);
        console.log(`  > ${line.trim()}`);
        violationsFound++;
      }
    });
  });
}

function walkDir(dir) {
  const fullDir = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullDir)) return;

  const files = fs.readdirSync(fullDir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const fullPath = path.join(ROOT_DIR, filePath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (stat.isFile()) {
      if (!shouldIgnore(filePath)) {
        scanFile(fullPath);
      }
    }
  });
}

console.log('Starting Public Theme Compliance Check...');
SCAN_DIRS.forEach(walkDir);

if (violationsFound > 0) {
  console.log(`\nFound ${violationsFound} violation(s).`);
  process.exit(1);
} else {
  console.log('\nNo violations found.');
  process.exit(0);
}
