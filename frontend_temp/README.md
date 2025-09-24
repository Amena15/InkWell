# InkWell - Modern Document Management

A modern document management system built with Next.js, React, and Tailwind CSS.

## Features

- Modern, responsive UI with dark mode support
- Real-time document editing and collaboration
- Secure authentication and authorization
- File upload and management
- Clean, maintainable codebase

## New Pages Added

### 1. Privacy Policy (`/privacy`)
- Comprehensive privacy policy page
- Automatically updates the "Last updated" date
- Responsive design with dark mode support
- Clear sections for easy reading
- Back to Home navigation

### 2. Terms of Service (`/terms`)
- Detailed Terms of Service page
- Automatically updates the "Last updated" date
- Well-structured sections for legal clarity
- Mobile-responsive layout
- Back to Home navigation

### 3. Contact Us (`/contact`)
- Interactive contact form with client and server-side validation
- Real-time form feedback
- Loading states and success messages
- Contact information section with icons
- Social media links
- Responsive two-column layout on desktop, stacks on mobile

## API Endpoints

### POST `/api/contact`
Handles contact form submissions with:
- Input validation
- Email notifications to support
- Confirmation emails to users
- Error handling and logging

## Prerequisites

- Node.js 18+ and npm
- Git
- A modern web browser

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/inkwell.git
   cd inkwell/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── public/           # Static files
├── src/
│   ├── app/          # Next.js 13+ app directory
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utility functions and configurations
│   ├── styles/       # Global styles and Tailwind config
│   └── types/        # TypeScript type definitions
├── .env.local        # Environment variables
├── next.config.js    # Next.js configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub/GitLab repository
2. Import the project on [Vercel](https://vercel.com/import)
3. Add your environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
