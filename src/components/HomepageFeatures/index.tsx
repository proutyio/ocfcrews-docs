import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  path: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Architecture',
    icon: '\u{1f3d7}\u{fe0f}',
    description: (
      <>
        Monolithic Next.js 15 + Payload CMS architecture with MongoDB,
        in-process API calls, and crew-isolated data access patterns.
      </>
    ),
    path: 'architecture/system-overview',
  },
  {
    title: 'Collections & Data Model',
    icon: '\u{1f4ca}',
    description: (
      <>
        21 Payload collections with role-based access control, crew isolation,
        hooks for data integrity, and auto-generated REST/GraphQL APIs.
      </>
    ),
    path: 'data-model/overview',
  },
  {
    title: 'Scheduling System',
    icon: '\u{1f4c5}',
    description: (
      <>
        Position-based shift management with optimistic sign-ups,
        race condition handling, hour logging, and automatic aggregation.
      </>
    ),
    path: 'features/scheduling/overview',
  },
  {
    title: 'Inventory Management',
    icon: '\u{1f4e6}',
    description: (
      <>
        Full inventory tracking with immutable transaction audit trail,
        low-stock alerts, category hierarchy, and dietary/allergen tagging.
      </>
    ),
    path: 'features/inventory/overview',
  },
  {
    title: 'Recipe System',
    icon: '\u{1f373}',
    description: (
      <>
        Recipes with inventory-linked ingredients, dual instruction modes,
        favorites, scaling, printing, and crew-scoped organization.
      </>
    ),
    path: 'features/recipes/overview',
  },
  {
    title: 'Auth & Security',
    icon: '\u{1f510}',
    description: (
      <>
        Cookie-based JWT auth, 11 roles, crew isolation at every layer,
        security headers, input validation, and field-level access control.
      </>
    ),
    path: 'auth/authentication-flow',
  },
];

function Feature({title, icon, description, path}: FeatureItem) {
  const url = useBaseUrl(path);
  return (
    <div className={clsx('col col--4')}>
      <Link to={url} className={styles.featureLink}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>{icon}</div>
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
