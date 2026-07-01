import { FleetGallery } from "@/components/fleet-gallery";
import { HomeSlideshow } from "@/components/home-slideshow";
import { Link } from "react-router-dom";

import { Hero } from "@/components/hero";
import {
  fleetGallery,
  fleetReferences,
  homeOnaSlideshow,
  problemPoints,
  positionStatements,
  validationProof,
  businessSegments,
  partnerSegments,
} from "@/data/site";

export function HomePage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Waterberg Market Development"
        title="Delivery that knows the kasi."
        description="100% Black-owned and local. Serving the Waterberg since day one. Tsa Kasi solves the expensive, fuel-heavy last-mile gap by building a cleaner, more reliable movement layer for local commerce."
        primaryLabel="Discuss Last Mile Partnership"
        primaryTo="/pilot"
        primaryState={{ scrollToForm: true }}
        sideLabel="Clean Logistics"
        sideTitle="We operate a clean, maintained fleet"
        sideCopy="Committed to reducing our environmental footprint while keeping goods moving across the communities we serve."
      />

      <section className="stat-strip">
        <article>
          <p className="stat-label">Why Tsa Kasi</p>
          <p className="stat-value">100% Black-owned & local</p>
        </article>
        <article>
          <p className="stat-label">Rooted in</p>
          <p className="stat-value">the community</p>
        </article>
        <article>
          <p className="stat-label">Where we serve</p>
          <p className="stat-value">The Waterberg District</p>
        </article>
        <article>
          <p className="stat-label">What we build</p>
          <p className="stat-value">A cleaner, more reliable movement layer</p>
        </article>
      </section>

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Why Tsa Kasi</p>
          <h2>A local logistics partner built for the Waterberg.</h2>
          <p>
            Delivery may already be available. The real problem is that local
            last-mile execution remains expensive, fuel-sensitive, fragmented,
            and difficult to optimize at the customer-door level.
          </p>
          <p>
            Rooted in the communities we serve, Tsa Kasi covers towns and
            surrounding areas across the Waterberg District with an operating
            model designed for local route density and regional reliability.
          </p>
        </div>

        <div className="card-grid">
          {problemPoints.map((item) => (
            <article key={item.title} className="content-card">
              <p className="card-kicker">Pressure point</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeSlideshow items={homeOnaSlideshow} showDots={false} />

      <section className="spotlight-panel">
        <div className="spotlight-copy">
          <p className="eyebrow">Infrastructure Role</p>
          <h2>
            Tsa Kasi serves the local movement layer behind regional commerce.
          </h2>
        </div>
        <div className="bullet-panel">
          {positionStatements.map((statement) => (
            <div key={statement} className="bullet-row">
              <span className="bullet-mark" />
              <p>{statement}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="fleet-panel">
        <div className="section-head">
          <p className="eyebrow">Fleet Layer</p>
          <h2>Green Scooter ZA vehicle formats make the movement layer visible.</h2>
          <p>
            The Atlas and Ona introduce
            compact enclosed electric vehicle formats that align with local
            merchant routes, repeat parcel movement, and the clean logistics
            thesis behind Tsa Kasi.
          </p>
        </div>

        <div className="fleet-layout">
          <article className="fleet-stage">
            <p className="fleet-stage-label">Green Scooter ZA fleet layer</p>
            <div className="fleet-stage-frame">
              <img
                src="/fleet/Atlas/atlas-5.webp"
                alt="Green Scooter ZA Atlas side view with cargo compartment open."
                className="fleet-stage-image"
                loading="lazy"
              />
              <div className="fleet-stage-badges">
                <div className="fleet-badge">Atlas cargo format</div>
                <div className="fleet-badge">Ona utility format</div>
                <div className="fleet-badge">Compact enclosed EVs</div>
              </div>
            </div>
            <p className="fleet-stage-copy">
              A practical mixed-vehicle layer strengthens the commercial case
              for lower-cost, energy-aware local execution.
            </p>
          </article>

          <div className="fleet-grid">
            {fleetReferences.map((feature) => (
              <article key={`${feature.name}-${feature.title}`} className="content-card">
                <p className="card-kicker">{feature.name}</p>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FleetGallery
        eyebrow="Atlas Reference"
        title="Atlas introduces a compact electric cargo format for merchant and parcel movement."
        description="Compact enclosed EV form, rear payload utility, and a stronger clean-logistics signal for local route execution."
        items={fleetGallery.atlas}
      />

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Customer Base</p>
          <h2>The direct customer is the business or platform that requires movement.</h2>
          <p>
            The end consumer receives the delivery. The commercial customer is
            the merchant, courier network, platform, or commerce operator that
            requires reliable local execution without carrying the full burden
            of last-mile fleet management.
          </p>
        </div>

        <div className="split-grid">
          <article className="content-card">
            <p className="card-kicker">Businesses</p>
            <h3>Merchant and SME demand</h3>
            <ul className="clean-list">
              {businessSegments.map((segment) => (
                <li key={segment}>{segment}</li>
              ))}
            </ul>
            <Link className="inline-link" to="/businesses">
              Business Overview
            </Link>
          </article>
          <article className="content-card">
            <p className="card-kicker">Partners</p>
            <h3>Platforms and networks requiring local execution</h3>
            <ul className="clean-list">
              {partnerSegments.map((segment) => (
                <li key={segment}>{segment}</li>
              ))}
            </ul>
            <Link className="inline-link" to="/partners">
              Partnership Overview
            </Link>
          </article>
        </div>
      </section>

      <section className="nova-gallery-section section-grid">
        <div className="section-head">
          <p className="eyebrow">Nova Reference</p>
          <h2> </h2>
          <p>
            Compact, premium utility format that is
            supporting our local delivery execution layer.
          </p>
        </div>

        <div className="nova-list">
          {[
            "nova-1.webp",
            "nova-2.webp",
            "nova-3.webp",
            "nova-4.webp",
            "nova-5.webp",
            "nova-7.webp",
            "nova-8.webp",
          ].map((fileName) => (
            <figure key={fileName} className="nova-tile">
              <img
                src={`/fleet/Nova/${fileName}`}
                alt={`Nova fleet vehicle ${fileName.replace("nova-", "").replace(".webp", "")}`}
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="validation-panel">
        <div className="section-head">
          <p className="eyebrow">Commercial Objective</p>
          <h2>Commercial evidence for the first Waterberg node.</h2>
          <p>
            The current phase is focused on demonstrating business
            understanding, recurring delivery need, commercial engagement, and
            local demand concentration in Waterberg.
          </p>
        </div>
        <div className="proof-grid">
          {validationProof.map((item, index) => (
            <article key={item} className="proof-card">
              <span className="proof-index">0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="callout-panel">
        <div>
          <p className="eyebrow">Waterberg Business Intake</p>
          <h2>
            Businesses with recurring local delivery needs can register for the
            current intake process.
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
    </div>
  );
}
