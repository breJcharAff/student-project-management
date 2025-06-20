# ProjectHub - Student Project Management System

ProjectHub is a comprehensive platform for managing student projects, designed for both teachers and students. It provides tools for project creation, group management, deliverable submission, report writing, presentation scheduling, and grading.

## Features

### For Teachers

- **User Management**: Create and manage student accounts
- **Project Management**: Create and configure projects with detailed requirements
- **Group Management**: Set up groups manually, randomly, or let students form their own
- **Deliverable Tracking**: Define deliverables with deadlines and automatic verification
- **Report Configuration**: Set up report sections and requirements
- **Presentation Scheduling**: Generate and manage presentation schedules
- **Grading System**: Create custom grading criteria and evaluate student work
- **Plagiarism Detection**: Automatically detect similarities between submissions

### For Students

- **Project Access**: View assigned projects and requirements
- **Group Formation**: Create or join project groups
- **Deliverable Submission**: Submit work with pre-submission validation
- **Report Writing**: Collaborative online report writing
- **Schedule Viewing**: Check presentation schedules
- **Grade Access**: View grades and feedback

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js with Google/Microsoft OAuth
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <URL>
cd <repo_name>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Database
DATABASE_URL=your-database-url

# Email
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser to see the application.

## Project Structure

```
projecthub/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── dashboard/        # Dashboard components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...
├── lib/                  # Utility functions and types
├── public/               # Static assets
└── ...
```

## Development Roadmap

### Phase 1: Core Functionality
- User authentication
- Project creation and management
- Group management
- Basic deliverable submission

### Phase 2: Advanced Features
- Report writing interface
- Presentation scheduling
- Grading system
- Plagiarism detection

### Phase 3: Mobile Application
- Develop mobile app for teachers
- Implement core functionality for mobile



## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
