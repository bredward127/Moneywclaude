import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LegalHeader } from "@/components/legal/LegalHeader";

export const metadata: Metadata = {
  title: "Terms of Use | Property Intake & Resource Center",
  description: "The terms that govern your use of the Property Intake & Resource Center.",
};

export default function TermsPage() {
  return (
    <>
      <LegalHeader title="Terms of Use" updated="September 6, 2026" />
      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="prose prose-slate prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline max-w-none">
            <p>
              These Terms of Use (&quot;Terms&quot;) govern your use of the Property Intake
              &amp; Resource Center (&quot;this service&quot;). By submitting a seller or buyer
              intake form, you agree to these Terms.
            </p>

            <h2>Description of service</h2>
            <p>
              This service provides a fast, guided intake form for people who are selling or
              buying real estate, including investors. We collect the information you submit,
              have it reviewed by a person, and use it to connect you with an appropriate local
              real estate resource.
            </p>

            <h2>No brokerage, legal, or financial advice</h2>
            <p>
              This service is an intake and matching tool. It does not itself act as a licensed
              real estate broker, agent, lender, or appraiser, and nothing on this site
              constitutes legal, financial, or real estate advice. Any resource you are
              connected with is responsible for their own licensed services, and you should
              independently verify the credentials of anyone you work with. We do not guarantee
              that submitting an intake form will result in a completed sale, purchase, or any
              particular outcome.
            </p>

            <h2>Your responsibilities</h2>
            <ul>
              <li>Provide accurate and truthful information in your submission.</li>
              <li>Use this service only for legitimate real estate inquiries.</li>
              <li>
                Keep in mind that voice dictation is transcribed by your own browser — please
                review any text before submitting.
              </li>
            </ul>

            <h2>Prohibited uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Submit false, misleading, or fraudulent information;</li>
              <li>Use this service to harass, spam, or impersonate any person or business;</li>
              <li>
                Attempt to interfere with, disrupt, or gain unauthorized access to this service
                or its underlying systems; or
              </li>
              <li>Use automated means to submit intake forms in bulk.</li>
            </ul>

            <h2>Intellectual property</h2>
            <p>
              The design, text, graphics, and branding on this site are provided for use of
              this service and may not be copied or reused without permission.
            </p>

            <h2>Disclaimer of warranties</h2>
            <p>
              This service is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, whether express or implied, including but not limited to
              implied warranties of merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by applicable law, this service and its operators
              are not liable for any indirect, incidental, or consequential damages arising
              from your use of, or inability to use, this service.
            </p>

            <h2>Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. Continuing to use this service after
              changes are posted means you accept the updated Terms. Material changes will be
              reflected by updating the &quot;Last updated&quot; date at the top of this page.
            </p>

            <h2>Contact us</h2>
            <p>
              Questions about these Terms can be directed to us through the{" "}
              <Link href="/contact-preferences">Contact Preferences</Link> page.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
