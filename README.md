# Shadowdark GM Tools

Comprehensive tools for Shadowdark RPG Game Masters. Browse official monsters and spells, create custom content, build balanced encounters, and manage your campaigns.

## Features

- **Monster Database**: Browse official Shadowdark monsters with detailed stat blocks
- **Spell Database**: Complete collection of Shadowdark spells with descriptions
- **Custom Content Creation**: Create and manage your own monsters and spells
- **Encounter Builder**: Build balanced encounters for your party (coming soon)
- **Search & Filtering**: Advanced search and filtering capabilities
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
   git clone https://github.com/your-username/shadowdark-gm-tools.git
   cd shadowdark-gm-tools
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
