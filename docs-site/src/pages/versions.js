import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const versions = {
  current: {
    label: '2.0.0',
    path: '2.0.0',
    changelog: 'https://github.com/CharlesIXofFrance/terrarium/blob/main/CHANGELOG.md#200',
    breaking: true,
  },
  '1.0': {
    label: '1.0.0',
    path: '1.0.0',
    changelog: 'https://github.com/CharlesIXofFrance/terrarium/blob/main/CHANGELOG.md#100',
    breaking: false,
  },
};

export default function Versions() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title="Versions"
      description="Terrarium API versions and documentation">
      <main className="container margin-vert--lg">
        <h1>Terrarium Documentation Versions</h1>
        
        <div className="margin-bottom--lg">
          <h2>Current Version (Stable)</h2>
          <p>
            Here you can find the documentation for current released version.
          </p>
          <table>
            <tbody>
              <tr>
                <th>Version</th>
                <th>Documentation</th>
                <th>Release Notes</th>
              </tr>
              <tr>
                <td>{versions.current.label}</td>
                <td>
                  <a href={`/docs/2.0.0/introduction`}>Documentation</a>
                </td>
                <td>
                  <a href={versions.current.changelog}>Release Notes</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="margin-bottom--lg">
          <h2>Past Versions</h2>
          <p>
            Here you can find documentation for previous versions of Terrarium.
          </p>
          <table>
            <tbody>
              <tr>
                <th>Version</th>
                <th>Documentation</th>
                <th>Release Notes</th>
              </tr>
              <tr>
                <td>{versions['1.0'].label}</td>
                <td>
                  <a href={`/docs/1.0.0/introduction`}>Documentation</a>
                </td>
                <td>
                  <a href={versions['1.0'].changelog}>Release Notes</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </Layout>
  );
}
