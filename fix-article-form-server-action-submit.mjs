import fs from "fs";
import path from "path";

const filePath = path.join(
    process.cwd(),
    "src/components/admin/articles/ArticleForm.tsx",
);

if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
}

let current = fs.readFileSync(filePath, "utf8");

current = current.replace(
    `import { isRedirectError } from "next/dist/client/components/redirect-error";\n`,
    "",
);

current = current.replace(
    `  const [isPending, setIsPending] = React.useState(false);
  const [bodyContent, setBodyContent] = React.useState(initialData?.body || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("body", bodyContent);

    try {
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      console.error(error);
      alert(error instanceof Error ? error.message : "Der skete en fejl");
      setIsPending(false);
    }
  }`,
    `  const [bodyContent, setBodyContent] = React.useState(initialData?.body || "");

  async function submitAction(formData: FormData) {
    formData.set("body", bodyContent);
    await action(formData);
  }`,
);

current = current.replace(
    `<form
      onSubmit={handleSubmit}
      className="admin-article-form"`,
    `<form
      action={submitAction}
      className="admin-article-form"`,
);

current = current.replace(
    `<button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary"`,
    `<button
            type="submit"
            className="admin-btn admin-btn-primary"`,
);

current = current.replace(
    `{isPending ? "Gemmer..." : "Gem artikel"}`,
    `Gem artikel`,
);

fs.writeFileSync(filePath, current, "utf8");

console.log("Patched src/components/admin/articles/ArticleForm.tsx");
console.log("");
console.log("Next:");
console.log("rm -rf .next");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");