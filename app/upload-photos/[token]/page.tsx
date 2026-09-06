import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
import { validateUploadToken } from "@/app/actions/photos";
import { Container } from "@/components/ui/Container";
import { DeferredPhotoUpload } from "@/components/photos/DeferredPhotoUpload";

export const metadata: Metadata = {
  title: "Add Property Photos | Property Intake & Resource Center",
  description: "Upload property photos using your secure, private link.",
};

export default async function UploadPhotosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await validateUploadToken(token);

  return (
    <>
      <section className="bg-slate-900 py-14 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Add Property Photos
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              {result.ok
                ? "Upload photos whenever it's convenient — this link is private to your property."
                : "This upload link isn't valid."}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-2xl">
          {result.ok ? (
            <DeferredPhotoUpload leadId={result.leadId} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <p className="mt-4 font-semibold text-slate-900">{result.error}</p>
              <p className="mt-2 text-sm text-slate-600">
                If you still need to add photos, get in touch and we&apos;ll send a fresh link.
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
