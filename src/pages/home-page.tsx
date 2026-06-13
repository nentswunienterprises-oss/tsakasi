import { FleetGallery } from "@/components/fleet-gallery";
import { Link } from "react-router-dom";

import { Hero } from "@/components/hero";
import {
  fleetGallery,
  fleetReferences,
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
        title="Delivery is not the real problem. The local movement layer is."
        description="Tsa Kasi Logistics exists because local last-mile delivery is expensive, fuel-sensitive, fragmented, and hard to optimize when goods reach the customer door. We are building a lower-cost, more reliable movement layer for regional commerce."
        primaryLabel="Register Business Pilot"
        primaryTo="/pilot"
        primaryState={{ scrollToForm: true }}
        sideLabel="Infrastructure Thesis"
        sideTitle="Regional Clean Logistics Infrastructure for Local Commerce"
        sideCopy="Lower-cost, reliable movement for merchants, platforms, and recurring local route demand."
      />

      <section className="stat-strip">
        <article>
          <p className="stat-label">What is broken</p>
          <p className="stat-value">Fuel-heavy local execution</p>
        </article>
        <article>
          <p className="stat-label">Who feels it</p>
          <p className="stat-value">Businesses and platforms</p>
        </article>
        <article>
          <p className="stat-label">What Tsa Kasi builds</p>
          <p className="stat-value">A regional movement layer</p>
        </article>
        <article>
          <p className="stat-label">Where it starts</p>
          <p className="stat-value">Waterberg</p>
        </article>
      </section>

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Core Thesis</p>
          <h2>Regional commerce needs a more cost-efficient movement layer.</h2>
          <p>
            Delivery may already be available. The problem is that local
            last-mile execution remains expensive, fuel-sensitive, fragmented,
            and difficult to optimize at the customer-door level.
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
        description="The Atlas images make the cargo-oriented fleet logic concrete: compact enclosed EV form, rear payload utility, and a stronger clean-logistics signal for local route execution."
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
