import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/users" className="text-lg font-semibold text-gray-900">
          User Management
        </Link>
      </div>
    </header>
  );
}
