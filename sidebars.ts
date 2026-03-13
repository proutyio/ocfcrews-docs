import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/overview',
        'getting-started/prerequisites',
        'getting-started/local-development',
        'getting-started/environment-variables',
        'getting-started/project-structure',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/system-overview',
        'architecture/tech-stack',
        'architecture/data-flow',
        'architecture/project-layout',
      ],
    },
    {
      type: 'category',
      label: 'Database & Data Model',
      items: [
        'data-model/overview',
        'data-model/er-diagram',
        'data-model/crew-isolation',
        'data-model/relationships',
      ],
    },
    {
      type: 'category',
      label: 'Authentication & Authorization',
      items: [
        'auth/authentication-flow',
        'auth/two-factor-authentication',
        'auth/middleware',
        'auth/role-system',
        'auth/access-control-patterns',
        'auth/crew-isolation',
        'auth/field-level-access',
      ],
    },
    {
      type: 'category',
      label: 'Collections Reference',
      items: [
        {
          type: 'category',
          label: 'Account',
          items: ['collections/users', 'collections/crews'],
        },
        {
          type: 'category',
          label: 'Scheduling',
          items: [
            'collections/schedules',
            'collections/schedule-positions',
            'collections/schedule-templates',
            'collections/schedule-weeks',
            'collections/time-entries',
            'collections/shift-swaps',
            'collections/shift-waitlist',
            'collections/availability',
            'collections/crew-events',
            'collections/event-rsvps',
            'collections/event-periods',
            'collections/meal-logs',
          ],
        },
        {
          type: 'category',
          label: 'Inventory',
          items: [
            'collections/inventory-items',
            'collections/inventory-categories',
            'collections/inventory-subcategories',
            'collections/inventory-transactions',
            'collections/inventory-media',
          ],
        },
        {
          type: 'category',
          label: 'Recipes',
          items: [
            'collections/recipes',
            'collections/recipe-favorites',
            'collections/recipe-subgroups',
            'collections/recipe-tags',
          ],
        },
        {
          type: 'category',
          label: 'Content',
          items: [
            'collections/pages',
            'collections/posts',
            'collections/categories',
            'collections/media',
            'collections/avatars',
          ],
        },
        {
          type: 'category',
          label: 'Email & Communications',
          items: [
            'collections/email-templates',
            'collections/emails',
            'collections/scheduled-emails',
          ],
        },
        {
          type: 'category',
          label: 'Crew Guides',
          items: [
            'collections/crew-guides',
            'collections/guide-categories',
            'collections/guide-comments',
            'collections/guide-media',
            'collections/guide-read-receipts',
            'collections/guide-assignments',
          ],
        },
        {
          type: 'category',
          label: 'Chat (PeachChat)',
          items: [
            'collections/chat-channels',
            'collections/chat-messages',
            'collections/chat-media',
            'collections/chat-read-state',
          ],
        },
        {
          type: 'category',
          label: 'Multi-Crew & Account',
          items: [
            'collections/crew-memberships',
            'collections/push-subscriptions',
          ],
        },
        {
          type: 'category',
          label: 'Shop & E-commerce',
          items: [
            'collections/discount-codes',
            'collections/reviews',
            'collections/stock-notifications',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Globals Reference',
      items: [
        'globals/header',
        'globals/footer',
        'globals/settings',
        'globals/pass-settings',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/authentication',
        'api/integration-examples',
        {
          type: 'category',
          label: 'Schedule',
          items: [
            'api/schedule-sign-up',
            'api/schedule-log-hours',
            'api/schedule-ical',
            'api/schedule-waitlist',
            'api/schedule-swap-board',
            'api/availability',
          ],
        },
        {
          type: 'category',
          label: 'Notifications & Push',
          items: [
            'api/notifications',
            'api/push-subscriptions',
          ],
        },
        {
          type: 'category',
          label: 'Crew & Members',
          items: [
            'api/crew-members',
          ],
        },
        {
          type: 'category',
          label: 'Email & Communications',
          items: [
            'api/send-email',
            'api/resend-verification',
          ],
        },
        {
          type: 'category',
          label: 'Export & Reports',
          items: [
            'api/export-endpoints',
          ],
        },
        {
          type: 'category',
          label: 'Payload Auto-Generated',
          items: [
            'api/payload-rest-api',
            'api/payload-graphql',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Frontend',
      items: [
        'frontend/app-router-structure',
        'frontend/layout-and-routing',
        'frontend/server-vs-client-components',
        'frontend/components-library',
        'frontend/blocks-system',
        'frontend/shadcn-ui-components',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Inventory System',
      items: [
        'features/inventory/overview',
        'features/inventory/data-model',
        'features/inventory/transactions',
        'features/inventory/categories-subcategories',
        'features/inventory/low-stock-alerts',
        'features/inventory/shopping-list',
        'features/inventory/frontend-pages',
        'features/inventory/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Recipe System',
      items: [
        'features/recipes/overview',
        'features/recipes/data-model',
        'features/recipes/inventory-linking',
        'features/recipes/favorites',
        'features/recipes/groups-and-tags',
        'features/recipes/frontend-pages',
        'features/recipes/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Scheduling System',
      items: [
        'features/scheduling/overview',
        'features/scheduling/data-model',
        'features/scheduling/shift-management',
        'features/scheduling/position-sign-ups',
        'features/scheduling/shift-swaps',
        'features/scheduling/availability',
        'features/scheduling/schedule-templates',
        'features/scheduling/hour-logging',
        'features/scheduling/hours-calculation',
        'features/scheduling/frontend-pages',
        'features/scheduling/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Feature: E-commerce / Shop',
      items: [
        'features/ecommerce/overview',
        'features/ecommerce/stripe-integration',
        'features/ecommerce/stripe-connect',
        'features/ecommerce/products',
        'features/ecommerce/checkout-flow',
        'features/ecommerce/orders',
        'features/ecommerce/discount-codes',
        'features/ecommerce/bulk-orders',
        'features/ecommerce/reviews',
        'features/ecommerce/stock-notifications',
        'features/ecommerce/webhooks',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Crew Communications',
      items: [
        'features/communications/overview',
        'features/communications/scheduled-emails',
        'features/communications/twilio-sms',
      ],
    },
    {
      type: 'category',
      label: 'Feature: PeachChat',
      items: [
        'features/chat/overview',
        'features/chat/data-model',
        'features/chat/access-control',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Crew Guides',
      items: [
        'features/guides/overview',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Notifications',
      items: [
        'features/notifications',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Email System',
      items: [
        'features/email/overview',
        'features/email/templates',
        'features/email/campaigns',
        'features/email/notifications',
        'features/email/resend-smtp',
        'features/email/react-email-components',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Posts & Content',
      items: [
        'features/content/pages',
        'features/content/posts',
        'features/content/visibility',
        'features/content/lexical-editor',
        'features/content/seo',
      ],
    },
    {
      type: 'category',
      label: 'Feature: Pass Management',
      items: [
        'features/passes/overview',
        'features/passes/pass-status',
        'features/passes/pass-settings',
      ],
    },
    {
      type: 'category',
      label: 'Styling & Theming',
      items: [
        'styling/tailwind-config',
        'styling/css-variables',
        'styling/design-tokens',
        'styling/dark-mode',
        'styling/shadcn-ui',
      ],
    },
    {
      type: 'category',
      label: 'Testing',
      items: [
        'testing/strategy',
        'testing/integration-tests',
        'testing/e2e-tests',
        'testing/test-helpers',
        'testing/running-tests',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/vercel',
        'deployment/environment-setup',
        'deployment/build-process',
        'deployment/cloudflare-r2',
        'deployment/database',
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/overview',
        'security/security-headers',
        'security/input-validation',
        'security/email-injection-prevention',
        'security/access-control-deep-dive',
        'security/csrf-protection',
      ],
    },
    {
      type: 'category',
      label: 'Performance',
      items: [
        'performance/caching',
        'performance/revalidation',
        'performance/database-indexing',
        'performance/image-optimization',
        'performance/bundle-optimization',
      ],
    },
    {
      type: 'category',
      label: 'Dependencies',
      items: [
        'dependencies/production',
        'dependencies/development',
        'dependencies/payload-plugins',
      ],
    },
  ],
};

export default sidebars;
