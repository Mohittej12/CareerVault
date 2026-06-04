# CareerVault

**CareerVault** - Smart Resume Builder & Career Optimizer

## Features

- 📄 **Career Profile Analyzer** - Upload your resume and target job description to get intelligent AI-powered analysis
- 🎨 **Career Builder** - Create professional resumes with multiple export formats
- 📥 **Smart Import** - Upload PDF/DOCX files or paste resume text
- 💾 **Multiple Formats** - Download as PDF or ATS-friendly Word document
- 🔒 **Privacy First** - All processing happens client-side with your personal Supabase account

## Tech Stack

- **Frontend**: React 18.3 + TypeScript 5.8 + Vite 5.4
- **Styling**: Tailwind CSS 3.4 + ShadCN/UI components
- **Form Management**: React Hook Form + Zod validation
- **Document Generation**: jsPDF + DOCX
- **Backend**: Supabase Edge Functions with your personal account
- **File Parsing**: PDF.js + Mammoth

## Getting Started

### Prerequisites
- Node.js 18+
- Personal Supabase account

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:8082](http://localhost:8082) in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── pages/           # Page components (Home, ResumeAnalyzer, ResumeBuilder)
├── components/      # Reusable components (Navbar, NavLink, UI components)
├── hooks/          # Custom React hooks
├── integrations/   # Supabase client setup
├── lib/            # Utility functions (PDF/DOCX generation)
└── App.tsx         # Main app component
```

## License

Personal use only.
