# Terrarium

Terrarium is a modern platform for building and managing professional communities, with a focus on job opportunities and career development. It provides a comprehensive suite of tools for community owners, members, and employers to create valuable professional networks.

## 🌟 Key Features

### For Community Owners

- **Custom Job Boards**: Create and manage dedicated job boards with customizable filters
- **Community Management**: Comprehensive tools for member management and engagement
- **Analytics Dashboard**: Track community metrics, engagement, and growth
- **Branding Controls**: Customize the look and feel of your community space
- **Employer Network**: Manage relationships with hiring companies

### For Community Members

- **Exclusive Job Access**: Browse and apply to targeted job opportunities
- **Professional Networking**: Connect with other community members
- **Event Participation**: Join and engage in community events
- **Profile Management**: Build and maintain professional profiles
- **Personalized Feed**: Access relevant content and opportunities

### For Employers

- **Targeted Recruitment**: Post jobs to specific professional communities
- **Talent Access**: Connect with verified talent pools
- **Brand Presence**: Maintain company visibility within communities

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Jotai
- **Backend/Auth**: Supabase
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router
- **Analytics**: Chart.js
- **UI Components**: Radix UI

## 🏗 Architecture

### Multi-tenant Routing

Terrarium uses a subdomain-based routing architecture for multi-tenant separation:

- **Main Domain** (`terrarium.dev`): Landing, authentication, and marketing
- **Platform** (`platform.terrarium.dev`): Platform administration
- **Communities** (`[community-slug].terrarium.dev`): Community spaces

For detailed information about the routing architecture, see [ROUTING.md](docs/ROUTING.md).

### Development Environment

For local development, subdomains are simulated using URL parameters:
```bash
# Main app
http://localhost:3000

# Platform admin
http://localhost:3000?subdomain=platform

# Community space
http://localhost:3000?subdomain=community-slug
```

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/CharlesIXofFrance/terrarium.git
   cd terrarium
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Supabase:

   ```bash
   # Install Supabase CLI
   brew install supabase/tap/supabase

   # Link your project
   npx supabase link --project-ref your_project_ref

   # Apply migrations
   npx supabase db push
   ```

4. Create `.env.local` with the following variables:

   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:5173` in your browser

## 📁 Project Structure

```
terrarium/
├── src/
│   ├── components/     # React components
│   │   ├── common/    # Reusable UI components
│   │   ├── features/  # Feature-specific components
│   │   └── layout/    # Layout components
│   ├── lib/           # Utilities and types
│   │   ├── types/    # TypeScript interfaces
│   │   └── utils/    # Helper functions
│   ├── pages/         # Page components
│   └── test/          # Test files
├── supabase/
│   └── migrations/    # Database migrations
└── docs/             # Project documentation
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Development Guidelines](docs/DEVELOPMENT_GUIDELINES.md)
- [Database Migration Plan](docs/DATABASE_MIGRATION_PLAN.md)
- [Features](docs/FEATURES.md)
- [Implementation Status](docs/IMPLEMENTATION_STATUS.md)
- [Routing](docs/ROUTING.md)

## 🔒 Security Features

- **Role-Based Access Control (RBAC)**

  - Platform Owners: Global system management
  - Community Owners: Community-specific management
  - Members: Basic platform access
  - Employers: Job posting and talent access

- **Row-Level Security (RLS)**
  - Secure multi-tenant data isolation
  - Fine-grained access control
  - Automated policy enforcement

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
