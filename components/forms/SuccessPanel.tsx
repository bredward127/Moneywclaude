import { CheckCircle2 } from "lucide-react";

export function SuccessPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600">
        <CheckCircle2 className="h-7 w-7 text-white" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-2xl font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-slate-600">{description}</p>
    </div>
  );
}
