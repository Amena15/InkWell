# InkWell - AI-Powered Document Management System

InkWell is a modern, AI-powered document management system built with Next.js, TypeScript, and Prisma. It provides a seamless experience for creating, editing, and managing documents with AI assistance.

## Features

- 📝 Rich text editor with AI-powered writing assistance
- 🔐 Secure authentication with NextAuth.js
- 🚀 Full-stack TypeScript support
- 🎨 Responsive design with dark mode
- 📱 Mobile-friendly interface
- 🛡️ Role-based access control
- 📊 Dashboard with document analytics

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **AI Integration**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inkwell.git
   cd inkwell
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your configuration.

4. Run database migrations:
   ```bash
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── lib/               # Shared libraries and utilities
│   ├── services/          # API service layer
│   └── styles/            # Global styles
backend/
└── src/
    ├── auth/              # Authentication logic
    ├── controllers/       # Request handlers
    ├── middleware/        # API middleware
    └── prisma/           # Database schema and migrations
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inkwell?schema=public"

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Finkwell&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,OPENAI_API_KEY&envDescription=Required%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fyourusername%2Finkwell%23environment-variables)

### Docker

```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/inkwell](https://github.com/yourusername/inkwell)
