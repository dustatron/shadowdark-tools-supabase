# Shadowdark Guild

A community-driven reference resource and toolkit for running Shadowdark RPG sessions. Browse official content, create custom monsters, spells, and magic items, build encounter tables, generate print-and-play card decks, and share your creations with the guild.

## Overview

Shadowdark Guild serves two core purposes:

1. **Reference Resource**: Complete databases of official Shadowdark core rules for monsters, spells, and magic items with fast search and smart filtering.

2. **Guild Hub**: Create and share custom content with fellow guild members. Build your own monsters, spells, and items, then publish them for others to use in their games.

Beyond the reference library, the toolkit includes:

- **Random Encounter Tables**: Generate balanced encounter tables filtered by challenge level, monster type, and environment
- **Print & Play Card Decks**: Build custom card decks from any monster, spell, or item for use at your table
- **Favorites & Collections**: Save and organize content from both official sources and the community library

## Features

- **Official Content Database**: Browse complete Shadowdark core rules for monsters, spells, and magic items
- **Custom Content Creation**: Create your own monsters, spells, and magic items with detailed stat blocks
- **Community Sharing**: Publish your creations for the community or keep them private
- **Encounter Tables**: Generate random encounter tables with monster filtering and dice rolling
- **Card Deck Builder**: Create print-and-play card decks for monsters, spells, and items
- **Advanced Search & Filtering**: Fast search with filtering by challenge level, tier, type, and more
- **User Profiles**: Share your content library and track your contributions
- **Favorites System**: Save and organize your favorite content
- **Dark Mode**: Full dark mode support with Shadowdark-themed styling
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase PostgreSQL](https://supabase.com/database)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) built on Radix UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Shadowdark theme
- **Forms**: [React Hook Form](https://react-hook-form.com/) with Zod validation
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/shadowdark-guild.git
   cd shadowdark-guild
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure your Supabase project in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (Header, MobileNav)
│   ├── monsters/         # Monster-related components
│   └── spells/           # Spell-related components
├── lib/                   # Utility functions and configurations
│   ├── hooks/            # Custom React hooks
│   ├── supabase/         # Supabase client configurations
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
├── public/               # Static assets
├── specs/               # Project specifications and plans
└── starter-data/        # Initial data for monsters and spells
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests with Playwright

## UI Components

This project uses shadcn/ui components with a custom Shadowdark theme. The components are located in `components/ui/` and include:

- Form components (Input, Select, Textarea, etc.)
- Layout components (Card, Tabs, Sheet, etc.)
- Feedback components (Alert, Toast, etc.)
- Navigation components (DropdownMenu, etc.)

All components are fully accessible and follow React best practices.

## Custom Theme

The project features a custom Shadowdark theme with:

- **shadowdark**: Gray scale palette
- **blood**: Red accent colors
- **treasure**: Gold accent colors
- **magic**: Purple accent colors

Theme configuration is in `tailwind.config.ts` and `app/globals.css`.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Shadowdark RPG](https://www.arcane-library.com/shadowdark) by Arcane Library
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the backend-as-a-service platform
- [Next.js](https://nextjs.org/) for the React framework
