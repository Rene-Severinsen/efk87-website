"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ 
  children, 
  className = "admin-btn admin-btn-success px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? "Gemmer..." : children}
    </button>
  );
}
