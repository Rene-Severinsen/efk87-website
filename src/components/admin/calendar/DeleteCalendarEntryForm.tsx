"use client";

import React from "react";

interface DeleteCalendarEntryFormProps {
  clubSlug: string;
  entryId: string;
  action: (clubSlug: string, entryId: string) => Promise<void>;
  children: React.ReactNode;
}

export default function DeleteCalendarEntryForm({
  clubSlug,
  entryId,
  action,
  children
}: DeleteCalendarEntryFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('Er du sikker på, at du vil slette dette kalenderindslag?')) {
      e.preventDefault();
    }
  };

  return (
    <form 
      action={action.bind(null, clubSlug, entryId)}
      onSubmit={handleSubmit}
    >
      {children}
    </form>
  );
}
