import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Read Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Documentation for the Terrarium community platform">
      <HomepageHeader />
      <main>
        <div className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6">
              <h2>Getting Started</h2>
              <p>
                New to Terrarium? Our getting started guide will help you set up your first community.
              </p>
              <Link to="/docs/getting-started/installation" className="button button--primary">
                Get Started
              </Link>
            </div>
            <div className="col col--6">
              <h2>API Reference</h2>
              <p>
                Looking for detailed API documentation? Check out our comprehensive API reference.
              </p>
              <Link to="/docs/api/overview" className="button button--primary">
                View API Docs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
