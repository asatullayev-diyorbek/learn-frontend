import type { ReactNode } from "react";
import { ButtonRouterLink } from "../../components/Button";
import { BookIcon, ClockIcon, PencilIcon, TelegramIcon } from "../../components/icons";
import { ROUTES } from "../../router/paths";
import { HOME_COPY, type HomeFeatureId } from "./copy";
import styles from "./Home.module.css";

const COPY = HOME_COPY.guest;

const FEATURE_ICONS: Record<HomeFeatureId, ReactNode> = {
  structured: <BookIcon size={20} />,
  pace: <ClockIcon size={20} />,
  practice: <PencilIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
};

/** Landing page for visitors who are not signed in. */
export function GuestLanding() {
  return (
    <div data-testid="home-guest">
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <p className={styles.eyebrow}>{COPY.eyebrow}</p>
        <h1 id="home-hero-title" className={styles.heroTitle}>
          {COPY.title}
        </h1>
        <p className={styles.lead}>{COPY.lead}</p>
        <div className={styles.actions}>
          <ButtonRouterLink
            to={ROUTES.login}
            variant="primary"
            size="lg"
            className={styles.cta}
            leadingIcon={<TelegramIcon size={20} />}
          >
            {COPY.cta}
          </ButtonRouterLink>
          <p className={styles.note}>{COPY.ctaNote}</p>
        </div>
      </section>

      <section className={styles.features} aria-labelledby="home-features-title">
        <h2 id="home-features-title" className={styles.sectionTitle}>
          {COPY.featuresTitle}
        </h2>
        <ul className={styles.featureList}>
          {HOME_COPY.features.map((feature) => (
            <li key={feature.id} className={styles.feature}>
              <span className={styles.featureIcon}>{FEATURE_ICONS[feature.id]}</span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
