import React from 'react';
import Layout from '@theme/Layout';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function APIPlayground() {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title="API Playground"
      description="Try out the Terrarium API directly in your browser">
      <div
        style={{
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
        <h1>API Playground</h1>
        <p>
          Try out the Terrarium API directly in your browser. You can make live API
          calls and see the responses in real-time.
        </p>
        <div className="swagger-ui-container">
          <SwaggerUI
            url="/openapi.yaml"
            docExpansion="list"
            filter={true}
            tryItOutEnabled={true}
          />
        </div>
      </div>
    </Layout>
  );
}
