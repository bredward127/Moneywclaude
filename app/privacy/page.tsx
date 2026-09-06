import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LegalHeader } from "@/components/legal/LegalHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | Property Intake & Resource Center",
  description:
    "How we collect, use, and protect the information you share through our seller and buyer intake forms.",
};

export default function PrivacyPage() {
  return (
    <>
      <LegalHeader title="Privacy Policy" updated="September 6, 2026" />
      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="prose prose-slate prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline max-w-none">
            <p>
              This Privacy Policy explains how the Property Intake &amp; Resource Center (
              &quot;we,&quot; &quot;us,&quot; or &quot;this service&quot;) collects, uses, and
              protects information you share through our seller and buyer intake forms. By
              submitting information through this site, you agree to the practices described
              below.
            </p>

            <h2>Information we collect</h2>
            <p>When you use our intake forms, we may collect:</p>
            <ul>
              <li>
                <strong>Contact details</strong> you provide, such as your name, phone number,
                and email address.
              </li>
              <li>
                <strong>Property information</strong>, such as an address, property type,
                condition, and timeline, if you submit a seller intake.
              </li>
              <li>
                <strong>Buying criteria</strong>, such as budget, financing status, desired
                areas, and investor criteria, if you submit a buyer intake.
              </li>
              <li>
                <strong>Notes you provide</strong> by typing or by voice dictation in your
                browser. Voice input is transcribed locally by your browser before it is added
                to the form — we do not separately record or store audio.
              </li>
              <li>
                <strong>Contact preferences</strong>, such as your preferred contact method or a
                request to opt out of outreach.
              </li>
            </ul>

            <h2>How we use your information</h2>
            <p>We use the information you provide to:</p>
            <ul>
              <li>Review your submission and understand your goals;</li>
              <li>Connect you with an appropriate local resource based on your criteria;</li>
              <li>Contact you using the method you indicated you prefer; and</li>
              <li>Maintain the security and integrity of this service.</li>
            </ul>

            <h2>How we share your information</h2>
            <p>
              We do not sell your information, and we do not broadcast your submission to a
              list of agents, brokers, or lenders. Every submission is reviewed by a person on
              our team before any information is shared, and it is only shared with the
              specific local resource relevant to your request. We may also disclose
              information if required to do so by law.
            </p>

            <h2>Data security</h2>
            <p>
              We use reasonable administrative and technical safeguards designed to protect
              your information from unauthorized access, disclosure, or misuse. No method of
              transmission or storage is completely secure, so we cannot guarantee absolute
              security.
            </p>

            <h2>Your choices and rights</h2>
            <p>You can control how your information is used at any time:</p>
            <ul>
              <li>
                Update how we contact you, or opt out of outreach entirely, on the{" "}
                <Link href="/contact-preferences">Contact Preferences</Link> page.
              </li>
              <li>Request a copy of the information you&apos;ve submitted.</li>
              <li>Request that we delete your information.</li>
            </ul>

            <h2>Cookies and analytics</h2>
            <p>
              This site may use minimal, privacy-conscious cookies or similar technologies to
              keep the site functioning correctly and to understand overall usage patterns. We
              do not use this data to build advertising profiles about you.
            </p>

            <h2>Children&apos;s privacy</h2>
            <p>
              This service is intended for adults seeking real estate resources and is not
              directed to children under 16. We do not knowingly collect information from
              children.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be
              reflected by updating the &quot;Last updated&quot; date at the top of this page.
            </p>

            <h2>Contact us</h2>
            <p>
              If you have questions about this Privacy Policy or want to exercise any of the
              choices above, visit our{" "}
              <Link href="/contact-preferences">Contact Preferences</Link> page.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
