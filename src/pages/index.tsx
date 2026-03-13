import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const gettingStartedUrl = useBaseUrl('getting-started/overview');
  const architectureUrl = useBaseUrl('architecture/system-overview');
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to={gettingStartedUrl}>
            Get Started
          </Link>
          <Link
            className="button button--outline button--lg"
            style={{marginLeft: '1rem', color: 'white', borderColor: 'white'}}
            to={architectureUrl}>
            Architecture
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickLinks() {
  const collectionsUrl = useBaseUrl('collections/users');
  const apiUrl = useBaseUrl('api/overview');
  const frontendUrl = useBaseUrl('frontend/app-router-structure');
  const testingUrl = useBaseUrl('testing/strategy');
  const deploymentUrl = useBaseUrl('deployment/vercel');
  const securityUrl = useBaseUrl('security/overview');

  const links = [
    {label: 'Collections Reference', to: collectionsUrl, icon: '\u{1f4da}'},
    {label: 'API Reference', to: apiUrl, icon: '\u{1f50c}'},
    {label: 'Frontend Guide', to: frontendUrl, icon: '\u{1f5a5}\u{fe0f}'},
    {label: 'Testing', to: testingUrl, icon: '\u{1f9ea}'},
    {label: 'Deployment', to: deploymentUrl, icon: '\u{1f680}'},
    {label: 'Security', to: securityUrl, icon: '\u{1f6e1}\u{fe0f}'},
  ];

  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <Heading as="h2" className="text--center" style={{marginBottom: '2rem'}}>
          Quick Links
        </Heading>
        <div className="row">
          {links.map((link, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '1rem'}}>
              <Link to={link.to} className={styles.quickLink}>
                <span style={{marginRight: '0.5rem'}}>{link.icon}</span>
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="Comprehensive technical documentation for the OCFCrews crew scheduling and management platform">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickLinks />
      </main>
    </Layout>
  );
}
