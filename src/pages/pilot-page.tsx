import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { Hero } from "@/components/hero";
import { PilotForm } from "@/components/pilot-form";
import { validationProof } from "@/data/site";

export function PilotPage() {
  const location = useLocation();
  const formSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!location.state || typeof location.state !== "object") {
      return;
    }

    if ("scrollToForm" in location.state && location.state.scrollToForm) {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [location.key, location.state]);

  return (
    <div className="page-stack">
      <Hero
        eyebrow="Business Delivery Interview Form"
        title="A short interview form for businesses with local delivery demand."
        description="Tsa Kasi Logistics is conducting business interviews in Waterberg to assess delivery reality, recurring volume, and operational suitability during the current market development process."
        primaryLabel="Back to Home"
        primaryTo="/"
        sideLabel="Intake Process"
        sideTitle="Structured business delivery interview"
        sideCopy="The current intake captures delivery method, weekly movement volume, operational pain, and follow-up suitability."
      />

      <section ref={formSectionRef} className="form-layout">
        <article className="form-card">
          <div className="section-head section-head-tight">
            <p className="eyebrow">Register Business Pilot</p>
            <h2>Provide current delivery context.</h2>
            <p>
              Responses help assess current delivery method, recurring volume,
              operational pain, and suitability for follow-up engagement.
            </p>
          </div>
          <PilotForm />
        </article>

        <aside className="side-panel">
          <article className="content-card">
            <p className="card-kicker">Validation Output</p>
            <ul className="clean-list">
              {validationProof.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="content-card">
            <p className="card-kicker">Next Step</p>
            <p>
              Suitable businesses may be contacted for a short follow-up
              interview to assess delivery needs and pilot suitability.
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}
