import { Link } from "react-router-dom";

export function ThankYouPage() {
  return (
    <section className="thank-you-panel">
      <p className="eyebrow">Submission Received</p>
      <h1>Thank you.</h1>
      <p>
        Tsa Kasi Logistics is currently conducting business interviews in
        Waterberg. The team may contact you to understand delivery needs and
        assess pilot suitability.
      </p>
      <div className="callout-actions">
        <Link className="button button-primary" to="/">
          Back to Home
        </Link>
        <Link className="button button-ghost" to="/partners">
          Partnership Overview
        </Link>
      </div>
    </section>
  );
}
