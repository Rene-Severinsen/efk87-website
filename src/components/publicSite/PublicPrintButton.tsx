"use client";

interface PublicPrintButtonProps {
  label?: string;
}

export default function PublicPrintButton({ label = "Udskriv" }: PublicPrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="public-secondary-button inline-flex w-fit items-center gap-2 print:hidden"
    >
      🖨️ {label}
    </button>
  );
}
