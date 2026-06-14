# Issue Management Platform - Frontend

This is the frontend application for the Minimal Issue Management Platform. It provides a clean, responsive, and functional interface to manage issues, view details, participate in discussions, and run automated AI-driven analysis.

## 🚀 Live Demo

- **Frontend Application**: [https://issue-management-platform.netlify.app](https://issue-management-platform.netlify.app)
- **Backend API URL**: [https://issue-management-backend.onrender.com](https://issue-management-backend.onrender.com)

## 💻 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management & Data Fetching**: React Query & Fetch API
- **Notifications**: React Hot Toast

## ✨ Features

- **Issue Management**: Create, view, update, and manage project issues.
- **Detailed Views**: Dedicated issue pages showing full metadata, descriptions, priority, and status.
- **Discussions**: Add and view discussion threads/comments on individual issues.
- **AI Analysis**: One-click generation of automated insights (Root Causes, Recommended Actions, Severity risk assessment) powered by Gemini AI integration on the backend.
- **Bulk Actions & Recycle Bin**: Soft delete, bulk restore, and permanent delete issues using a dedicated recycle bin.

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the root directory. The following environment variables are supported:

```env
# The base URL of the backend API (defaults to localhost:3000 if omitted)
# Set this to the live backend URL to test against production data:
BACKEND_URL=https://issue-management-backend.onrender.com
```

*(Note: The Gemini API credentials and PostgreSQL database connection strings are configured strictly on the backend application.)*

## 🛠️ Setup and Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Anoop017/issue-management-frontend.git
   cd issue-management-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the `BACKEND_URL` as shown above.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser to see the application. (API requests will be proxied automatically via Next.js rewrites to avoid CORS issues).

## 📁 Project Structure Highlights

- `src/app/` - Next.js App Router pages (Issues list, details, Recycle bin).
- `src/components/` - Reusable UI components (`Sidebar`, `IssueForm`, `CommentThread`, `AiAnalysis`).
- `src/lib/` - API client definitions and shared TypeScript interfaces.
- `src/providers/` - React Query provider wrapper.
