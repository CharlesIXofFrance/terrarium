import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/admin/feedback',
    component: ComponentCreator('/admin/feedback', 'e10'),
    exact: true
  },
  {
    path: '/api-playground',
    component: ComponentCreator('/api-playground', 'ed7'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '8e3'),
    exact: true
  },
  {
    path: '/status',
    component: ComponentCreator('/status', '904'),
    exact: true
  },
  {
    path: '/versions',
    component: ComponentCreator('/versions', '9ef'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '916'),
    routes: [
      {
        path: '/docs/api/auth/overview',
        component: ComponentCreator('/docs/api/auth/overview', 'ac7'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/auth/security',
        component: ComponentCreator('/docs/api/auth/security', '7e3'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/auth/tokens',
        component: ComponentCreator('/docs/api/auth/tokens', 'f9b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/authentication',
        component: ComponentCreator('/docs/api/authentication', '3f1'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/endpoints/communities',
        component: ComponentCreator('/docs/api/endpoints/communities', 'd49'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/endpoints/jobs',
        component: ComponentCreator('/docs/api/endpoints/jobs', '705'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/endpoints/users',
        component: ComponentCreator('/docs/api/endpoints/users', '4da'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/overview',
        component: ComponentCreator('/docs/api/overview', '0e3'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/api/playground',
        component: ComponentCreator('/docs/api/playground', 'b65'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/docs',
        component: ComponentCreator('/docs/docs', 'b68'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/features/analytics',
        component: ComponentCreator('/docs/features/analytics', '6aa'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/features/communities',
        component: ComponentCreator('/docs/features/communities', 'a2f'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/features/job-boards',
        component: ComponentCreator('/docs/features/job-boards', '1e7'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/getting-started/configuration',
        component: ComponentCreator('/docs/getting-started/configuration', 'c8e'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/getting-started/installation',
        component: ComponentCreator('/docs/getting-started/installation', '727'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/sdk/go',
        component: ComponentCreator('/docs/sdk/go', 'fc3'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/sdk/javascript',
        component: ComponentCreator('/docs/sdk/javascript', '8b4'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/sdk/overview',
        component: ComponentCreator('/docs/sdk/overview', 'b35'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/sdk/python',
        component: ComponentCreator('/docs/sdk/python', '0e4'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/docs/sdk/ruby',
        component: ComponentCreator('/docs/sdk/ruby', 'a9c'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '929'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
