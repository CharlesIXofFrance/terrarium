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
            to="/docs/">
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
      title={siteConfig.title}
      description="Documentation for the Terrarium Platform">
      <HomepageHeader />
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--4">
                <h3>For Community Owners</h3>
                <p>Learn how to create and manage your community space, customize your job board, and analyze engagement.</p>
              </div>
              <div className="col col--4">
                <h3>For Job Seekers</h3>
                <p>Discover how to set up your profile, search for jobs, and engage with your community.</p>
              </div>
              <div className="col col--4">
                <h3>For Employers</h3>
                <p>Find out how to post jobs, manage listings, and connect with potential candidates.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
