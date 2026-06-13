type FleetGalleryItem = {
  src: string;
  alt: string;
};

type FleetGalleryProps = {
  items: FleetGalleryItem[];
  eyebrow: string;
  title: string;
  description: string;
  layout?: "featured" | "uniform";
  fit?: "cover" | "contain";
};

export function FleetGallery({
  items,
  eyebrow,
  title,
  description,
  layout = "featured",
  fit = "cover",
}: FleetGalleryProps) {
  if (layout === "uniform") {
    return (
      <section className="fleet-gallery-panel">
        <div className="section-head section-head-tight">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="fleet-gallery-layout-uniform">
          {items.map((item) => (
            <figure
              key={item.src}
              className={`fleet-gallery-card fleet-gallery-card-${fit}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const [lead, ...rest] = items;

  return (
    <section className="fleet-gallery-panel">
      <div className="section-head section-head-tight">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="fleet-gallery-layout">
        {lead ? (
          <figure className={`fleet-gallery-lead fleet-gallery-lead-${fit}`}>
            <img src={lead.src} alt={lead.alt} loading="eager" />
          </figure>
        ) : null}

        <div className="fleet-gallery-grid">
          {rest.map((item) => (
            <figure
              key={item.src}
              className={`fleet-gallery-card fleet-gallery-card-${fit}`}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
