import React from "react";

export default function Spinner() {
  return (
    <div className="flex items-center justify-center py-8 w-full" aria-live="polite" role="status" aria-label="Loading">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-400 border-t-transparent" />
      <span className="ml-2 text-blue-600 dark:text-blue-300 text-lg">Loading...</span>
    </div>
  );
}
