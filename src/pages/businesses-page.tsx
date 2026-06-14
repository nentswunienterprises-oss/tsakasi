import { HomeSlideshow } from "@/components/home-slideshow";
import { Link } from "react-router-dom";

import { Hero } from "@/components/hero";
import { businessPain, businessSegments, homeOnaSlideshow } from "@/data/site";

export function BusinessesPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="For Businesses"
        title="A lower-burden movement layer for businesses with local delivery demand."
        description="Tsa Kasi Logistics is focused on businesses that require local fulfillment capability without absorbing the full burden of riders, fuel pressure, and complaints internally."
        primaryLabel="Register Business Pilot"
        primaryTo="/pilot"
        primaryState={{ scrollToForm: true }}
        sideLabel="Business Relevance"
        sideTitle="Delivery capability without internal fleet burden"
        sideCopy="Structured local fulfillment for merchants that need movement capacity without building riders, dispatch, and coordination internally."
      />

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Commercial Context</p>
          <h2>Demand can grow faster than delivery capability.</h2>
          <p>
            Restaurants, pharmacies, retailers, and SMEs can generate local
            demand through walk-ins, WhatsApp, social media, and repeat
            customers. The commercial challenge is fulfilling that demand
            reliably and economically.
          </p>
        </div>

        <div className="card-grid">
          {businessPain.map((item) => (
            <article key={item} className="content-card">
              <p className="card-kicker">Pain point</p>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="content-card">
          <p className="card-kicker">Customer Segments</p>
          <h3>Business profiles in scope</h3>
          <ul className="clean-list">
            {businessSegments.map((segment) => (
              <li key={segment}>{segment}</li>
            ))}
          </ul>
        </article>
        <article className="content-card">
          <p className="card-kicker">Value Proposition</p>
          <h3>Reduced logistics burden and more reliable movement</h3>
          <ul className="clean-list">
            <li>Delivery execution without building a full in-house fleet.</li>
            <li>More predictable local fulfillment and customer coverage.</li>
            <li>Better visibility.</li>
            <li>Lower friction as order volume grows.</li>
          </ul>
        </article>
      </section>

      <section className="callout-panel">
        <div>
          <p className="eyebrow">Business Intake</p>
          <h2>
            Businesses with active local delivery demand can be assessed for
            current intake.
          </h2>
        </div>
        <div className="callout-actions">
          <Link
            className="button button-primary"
            to="/pilot"
            state={{ scrollToForm: true }}
          >
            Register Business Pilot
          </Link>
        </div>
      </section>

      <HomeSlideshow
        eyebrow="Ona Utility Reference"
        items={homeOnaSlideshow}
      />
    </div>
  );
}
