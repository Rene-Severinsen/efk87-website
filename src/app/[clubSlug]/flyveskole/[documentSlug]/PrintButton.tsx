"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
      <button
          type="button"
          onClick={() => window.print()}
          className="flight-school-action-button"
      >
        <Printer className="h-4 w-4" />
        Print dokument
      </button>
  );
}