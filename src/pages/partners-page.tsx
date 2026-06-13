import { Link } from "react-router-dom";

import { Hero } from "@/components/hero";
import { partnerPain, partnerSegments } from "@/data/site";

export function PartnersPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="For Platforms And Courier Partners"
        title="The closer logistics gets to the customer door, the more local execution matters."
        description="Tsa Kasi Logistics is focused on the part of logistics that becomes expensive in regional nodes: driver allocation, route density, customer coordination, proof-of-delivery, failed attempts, and fuel-sensitive final-mile operations."
        primaryLabel="Review Operating Model"
        primaryTo="/model"
        sideLabel="Execution Relevance"
        sideTitle="Node-level support for platform and courier flow"
        sideCopy="Local execution support where regional delivery becomes operationally expensive, less dense, and harder to optimize directly."
      />

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Partner problem</p>
          <h2>National logistics capability does not remove local last-mile cost.</h2>
          <p>
            Platforms and courier networks may already own the parcel flow and
            customer relationship. What still hurts is the local execution layer
            when delivery reaches Waterberg towns and lower-density routes.
          </p>
        </div>

        <div className="card-grid">
          {partnerPain.map((item) => (
            <article key={item} className="content-card">
              <p className="card-kicker">Final-mile pressure</p>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="content-card">
          <p className="card-kicker">Partner Segments</p>
          <h3>Partnership profiles in scope</h3>
          <ul className="clean-list">
            {partnerSegments.map((segment) => (
              <li key={segment}>{segment}</li>
            ))}
          </ul>
        </article>
        <article className="content-card">
          <p className="card-kicker">Value Proposition</p>
          <h3>Node-level execution</h3>
          <ul className="clean-list">
            <li>Reliable local delivery execution in Waterberg.</li>
            <li>Reduced last-mile fleet burden for partner networks.</li>
            <li>Proof-of-delivery, OTP verification, and route discipline.</li>
            <li>A local operating layer that can support recurring parcel volume.</li>
          </ul>
        </article>
      </section>

      <section className="callout-panel">
        <div>
          <p className="eyebrow">Partnership Development</p>
          <h2>
            Waterberg last-mile partnership scope is being developed in parallel
            with commercial buildout.
          </h2>
        </div>
        <div className="callout-actions">
          <Link className="button button-primary" to="/model">
            Review the operating model
          </Link>
        </div>
      </section>
    </div>
  );
}
