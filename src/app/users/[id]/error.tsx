"use client";

export default function UserDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Couldn&apos;t load this user</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        {error.message || "An unexpected error occurred while querying the database."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Try again
      </button>
    </main>
  );
}
