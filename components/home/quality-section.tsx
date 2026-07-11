import { QUALITY_PILLARS } from "@/constants";
import { FlaskConical, FileCheck, Package, Lock } from "lucide-react";

const icons = [FlaskConical, FileCheck, Package, Lock];

export function QualitySection() {
  return (
    <section className="border-y border-border bg-surface px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-cream sm:text-3xl">OUR COMMITMENT TO QUALITY</h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted">
            At Boofbusta, we&apos;re on a mission to bring you the best buzz from the finest
            products on the planet! We carefully craft each combination to get you faded in fun and
            unique ways. We use the best ingredients, create unbelievable flavors, and have all of
            our products tested at ISO-certified third-party labs.
          </p>
          <p className="mt-4 text-sm italic text-accent">
            If a super potent cannabis plant and a scientist with O.C.D had a baby, it would be Boofbusta.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {QUALITY_PILLARS.map((pillar, i) => {
            const Icon = icons[i];
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40"
              >
                <Icon className="mb-4 h-8 w-8 text-primary-light" />
                <h3 className="font-semibold text-cream">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted">{pillar.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
