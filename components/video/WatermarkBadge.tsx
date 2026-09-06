import { StarMark } from "@/components/ui/Logo";

export function WatermarkBadge() {
  return (
    <div
      className="pointer-events-none absolute right-2 bottom-2 z-20 flex items-center gap-1.5 rounded-full bg-slate-950/80 p-1.5 shadow-lg ring-1 ring-white/10 backdrop-blur-sm @[170px]:pr-3 @[170px]:pl-2 sm:right-3 sm:bottom-3"
      aria-hidden="true"
    >
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-blue-500/70 blur-[4px]" />
        <StarMark className="relative h-4 w-4" />
      </span>
      <span className="hidden text-[10px] font-semibold whitespace-nowrap text-white @[170px]:inline sm:text-[11px]">
        Verified Workflow
      </span>
    </div>
  );
}
