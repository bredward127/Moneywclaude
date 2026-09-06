"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/forms/styles";
import { createAgency, type Agency } from "@/app/actions/agencies";

export function AgencyListPanel({ agencies: initialAgencies }: { agencies: Agency[] }) {
  const router = useRouter();
  const [agencies, setAgencies] = useState(initialAgencies);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await createAgency({ name });
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setAgencies((prev) => [...prev, result.agency]);
    setName("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <div className="flex-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Agency name"
            className={inputClass}
          />
        </div>
        <Button
          type="submit"
          isLoading={isSubmitting}
          icon={<Plus className="h-4 w-4" aria-hidden="true" />}
          iconPosition="left"
        >
          Create
        </Button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {agencies.length === 0 ? (
        <p className="text-sm text-slate-500">No agencies yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {agencies.map((agency) => (
            <li key={agency.id} className="py-3">
              <Link
                href={`/dashboard/agencies/${agency.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {agency.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
