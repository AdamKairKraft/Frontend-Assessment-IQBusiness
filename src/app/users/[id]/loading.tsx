export default function LoadingUserDetail() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    </main>
  );
}
