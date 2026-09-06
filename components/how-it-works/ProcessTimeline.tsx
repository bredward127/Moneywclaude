import { MessageSquareText, Lock, UserCheck, PhoneCall } from "lucide-react";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Share your goals",
    description:
      "Use voice or typing to answer a short set of questions about what you're selling or looking to buy. Most people finish in about 2 minutes.",
  },
  {
    icon: Lock,
    title: "We handle it securely",
    description:
      "Your submission is transmitted securely and stored with limited access — it isn't published or made searchable anywhere.",
  },
  {
    icon: UserCheck,
    title: "A real person reviews it",
    description:
      "Every submission is read by a member of our team before anything happens next. Nothing is auto-forwarded to a list of agents.",
  },
  {
    icon: PhoneCall,
    title: "You get connected, your way",
    description:
      "We reach out using the contact method you chose, on your timeline. You can update your preferences or opt out at any point.",
  },
];

export function ProcessTimeline() {
  return (
    <ol className="relative space-y-10 border-l border-slate-200 pl-8 sm:pl-10">
      {STEPS.map(({ icon: Icon, title, description }, index) => (
        <li key={title} className="relative">
          <div className="absolute top-0 -left-[calc(2rem+1px)] flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 sm:-left-[calc(2.5rem+1px)]">
            <Icon className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-blue-600">Step {index + 1}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        </li>
      ))}
    </ol>
  );
}
