import { Link } from "react-router-dom";

type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryTo?: string;
  primaryState?: { scrollToForm?: boolean };
  secondaryLabel?: string;
  secondaryTo?: string;
  secondaryState?: { scrollToForm?: boolean };
  sideLabel?: string;
  sideTitle?: string;
  sideCopy?: string;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryTo,
  primaryState,
  secondaryLabel,
  secondaryTo,
  secondaryState,
  sideLabel,
  sideTitle,
  sideCopy,
}: HeroProps) {
  return (
    <section className={`hero-panel${sideTitle ? "" : " hero-panel-single"}`}>
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
        <div className="hero-actions">
          {primaryLabel && primaryTo ? (
            <Link className="button button-primary" to={primaryTo} state={primaryState}>
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryLabel && secondaryTo ? (
            <Link className="button button-ghost" to={secondaryTo} state={secondaryState}>
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>

      {sideTitle ? (
        <div className="hero-card">
          {sideLabel ? <p className="hero-card-label">{sideLabel}</p> : null}
          <p className="hero-card-title">{sideTitle}</p>
          {sideCopy ? <p className="hero-card-copy">{sideCopy}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
