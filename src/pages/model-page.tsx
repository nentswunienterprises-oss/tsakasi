import { FleetGallery } from "@/components/fleet-gallery";
import { Hero } from "@/components/hero";
import {
  fleetGallery,
  fleetStatements,
  operatingLayers,
  pilotSteps,
} from "@/data/site";

export function ModelPage() {
  return (
    <div className="page-stack">
      <Hero
        eyebrow="Infrastructure Model"
        title="A regional logistics infrastructure model built around node concentration."
        description="Tsa Kasi begins in Waterberg because regional infrastructure is best built through concentration, route repetition, local trust, platform readiness, and node-by-node dominance."
        primaryLabel="Discuss Last Mile Partnership"
        primaryTo="/pilot"
        primaryState={{ scrollToForm: true }}
        sideLabel="Operating Logic"
        sideTitle="Density, utilization, and cost discipline define the model"
        sideCopy="Concentrated demand, route repetition, and energy-aware fleet logic strengthen movement economics at the node level."
      />

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Operating Structure</p>
          <h2>Four layers turn delivery activity into movement infrastructure.</h2>
          <p>
            Electric vehicles alone do not create an infrastructure company. The
            advantage comes from integrating movement demand, execution, energy
            logic, and operating intelligence.
          </p>
        </div>

        <div className="card-grid">
          {operatingLayers.map((layer) => (
            <article key={layer.title} className="content-card">
              <p className="card-kicker">Layer</p>
              <h3>{layer.title}</h3>
              <p>{layer.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="spotlight-panel">
        <div className="spotlight-copy">
          <p className="eyebrow">Core thesis</p>
          <h2>
            Regional commerce does not only need access to logistics. It needs a
            more cost-efficient movement layer.
          </h2>
        </div>
        <div className="bullet-panel">
          <div className="bullet-row">
            <span className="bullet-mark" />
            <p>Customer density increases route density.</p>
          </div>
          <div className="bullet-row">
            <span className="bullet-mark" />
            <p>Route density improves fleet utilization.</p>
          </div>
          <div className="bullet-row">
            <span className="bullet-mark" />
            <p>Fleet utilization lowers cost per delivery.</p>
          </div>
          <div className="bullet-row">
            <span className="bullet-mark" />
            <p>Energy-aware operations reduce fuel exposure and friction.</p>
          </div>
        </div>
      </section>

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Fleet Reference</p>
          <h2>Green Scooter ZA gives the fleet layer practical vehicle formats.</h2>
          <p>
            The business model already identifies Green Scooter ZA as the fleet
            support layer. The Atlas and Ona help translate that fleet logic
            into visible operating formats for local movement.
          </p>
        </div>

        <div className="split-grid">
          <article className="fleet-stage">
            <p className="fleet-stage-label">Vehicle reference</p>
            <div className="fleet-stage-frame fleet-stage-frame-compact fleet-stage-frame-contained">
              <img
                src="/fleet/Ona/ona-3.webp"
                alt="Green Scooter ZA Ona side profile on a studio background."
                className="fleet-stage-image fleet-stage-image-contained"
                loading="lazy"
              />
              <div className="fleet-stage-badges">
                <div className="fleet-badge">Atlas cargo format</div>
                <div className="fleet-badge">Ona utility format</div>
                <div className="fleet-badge">Merchant route ready</div>
                <div className="fleet-badge">Visible clean fleet</div>
              </div>
            </div>
            <p className="fleet-stage-copy">
              The vehicle layer should remain tied to route density, delivery
              pattern, and cost structure rather than image alone.
            </p>
          </article>

          <div className="bullet-panel">
            {fleetStatements.map((statement) => (
              <div key={statement} className="bullet-row">
                <span className="bullet-mark" />
                <p>{statement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FleetGallery
        eyebrow="Ona Reference"
        title="Ona extends the fleet layer into a more structured utility format."
        description="The Ona imagery shows a more substantial enclosed utility vehicle profile for local commercial movement, visible fleet presence, and payload-oriented route work."
        layout="uniform"
        fit="contain"
        items={fleetGallery.ona}
      />

      <section className="section-grid">
        <div className="section-head">
          <p className="eyebrow">Commercial Development Process</p>
          <h2>The pilot is a disciplined commercial process for the first node.</h2>
          <p>
            The current process is designed to establish commercial interest,
            delivery need, and operational suitability around the first
            Waterberg node.
          </p>
        </div>

        <div className="proof-grid">
          {pilotSteps.map((step, index) => (
            <article key={step} className="proof-card">
              <span className="proof-index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
