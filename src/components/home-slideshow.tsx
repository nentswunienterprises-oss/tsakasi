import { useEffect, useState } from "react";

type HomeSlideshowItem = {
  src: string;
  alt: string;
};

type HomeSlideshowProps = {
  items: HomeSlideshowItem[];
  eyebrow?: string;
  showDots?: boolean;
};

export function HomeSlideshow({ items, eyebrow, showDots = true }: HomeSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex];

  return (
    <section className="home-slideshow-panel">
      {eyebrow ? (
        <div className="home-slideshow-head">
          <p className="eyebrow">{eyebrow}</p>
        </div>
      ) : null}

      <div className="home-slideshow-stage">
        <figure className="home-slideshow-frame">
          <img src={activeItem.src} alt={activeItem.alt} loading="eager" />
        </figure>
      </div>

      {showDots ? (
        <div className="home-slideshow-dots" aria-label="Ona image navigation">
          {items.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={`home-slideshow-dot${
                index === activeIndex ? " home-slideshow-dot-active" : ""
              }`}
              aria-label={`Show Ona image ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
