# CatetYuk - simplify your task

CatetYuk is an intelligent todo list application designed to simplify your task management using the power of AI. Built with modern web technologies, it offers a seamless and smart experience for organizing your daily activities.

## Features

- **Smart Task Parsing**: Simply type your task in natural language, and our AI will automatically extract details like dates, times, and categories.
- **Daily Summaries**: Get a concise summary of your tasks to stay focused on what matters.
- **Semantic Search**: Find tasks easily using natural language queries, even if you don't remember the exact keywords.
- **Anomaly Detection**: The AI helps identify unusual patterns or potential issues in your task history.
- **Modern UI**: A beautiful and responsive interface built with shadcn/ui and Tailwind CSS.

## Tech Stack

This project is built with a robust modern stack:

- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1.  **Clone the repository**

    ```sh
    git clone <YOUR_GIT_URL>
    cd ai-task-master
    ```

2.  **Install dependencies**

    ```sh
    npm install
    ```

3.  **Environment Setup**

    Create a `.env` file in the root directory based on `.env.example`:

    ```sh
    cp .env.example .env
    ```

    Fill in your Supabase credentials:

    ```env
    VITE_SUPABASE_PROJECT_ID=your_project_id
    VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
    VITE_SUPABASE_URL=your_supabase_url
    ```

    *Note: You will also need to set up the Supabase Edge Functions for the AI features to work.*

4.  **Start the development server**

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:8080`.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run preview`: Preview the production build locally.

## License

[MIT](LICENSE)
