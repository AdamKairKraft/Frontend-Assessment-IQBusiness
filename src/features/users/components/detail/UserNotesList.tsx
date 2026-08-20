import { formatDateTime } from "@/lib/format";
import type { UserNote } from "../../types";

export function UserNotesList({ notes }: { notes: UserNote[] }) {
  if (notes.length === 0) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <p className="px-4 py-6 text-sm text-gray-500">No notes recorded for this user.</p>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {notes.map((note) => (
          <li key={note.id} className="px-4 py-3">
            <p className="text-sm text-gray-900">{note.note}</p>
            <p className="mt-1 text-xs text-gray-500">{formatDateTime(note.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
