import { TRUST_BADGES } from "@/constants";
import { Truck, RotateCcw, Headphones, ShieldCheck } from "lucide-react";

const icons = [Truck, RotateCcw, Headphones, ShieldCheck];

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6">
        {TRUST_BADGES.map((badge, i) => {
          const Icon = icons[i];
          return (
            <div key={badge.title} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary-light">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-cream">{badge.title}</h3>
              <p className="mt-1 text-xs text-muted">{badge.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
