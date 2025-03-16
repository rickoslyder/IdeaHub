Below is the comprehensive technical specification for the "Idea Hub" project, based on the provided project request, rules, and starter template. I've incorporated the analysis and planning from the thinking trace to ensure precision, structure, and completeness, tailored for use by planning and code generation AI systems.

---

# Idea Hub Technical Specification

## 1. System Overview

### Core Purpose and Value Proposition
Idea Hub is a desktop application with server-side syncing capabilities, designed to manage and visualize personal projects, integrating documentation, GitHub repositories, and local folders. It leverages AI to track new developments in AI and software engineering, offering actionable suggestions for applying these developments to projects and generating prompts for advanced AI models. The app saves all developments to enable bidirectional relevance matching, creating a dynamic system where new developments enhance existing projects and new projects benefit from past developments. A web app component provides mobile access with limited functionality.

### Key Workflows
1. **Project Management:** Create, view, and organize projects with tags and statuses.
2. **Documentation Handling:** Upload and render Markdown documentation.
3. **External Integrations:** Sync GitHub repositories and local folders.
4. **Indexing and Searching:** Index and search content using embeddings and semantic search.
5. **Relevance Matching:** Suggest relevant projects for new developments and vice versa.
6. **Development Tracking:** Save and manage new developments with metadata.
7. **Prompt Generation:** Generate and edit AI prompts based on project data.
8. **Collaboration:** Share projects and add comments.

### System Architecture
- **Desktop App:** Built with Electron and React using TypeScript, providing the primary user interface.
- **Web App:** React with TypeScript, offering mobile access to core features.
- **Backend:** Node.js with Express and TypeScript, managing API requests, syncing, and integrations.
- **AI Service:** Python with FastAPI, handling embedding generation and prompt creation using open-source models (e.g., E5 or BGE).
- **Databases:**
  - **PostgreSQL:** Stores relational data (users, projects, developments).
  - **Milvus:** Self-hosted vector database for embedding storage and similarity search.
- **Hosting:** Render, utilizing background workers for compute-intensive tasks like embedding generation.

---

## 2. Project Structure

The project follows a modular structure to separate concerns and facilitate development:

- **`/apps/desktop`:** Electron + React + TypeScript
  - Contains the desktop app code, including renderer process (`renderer.tsx`), main process (`main.ts`), and preload scripts (`preload.ts`).
  - Uses the starter template as a base, extended with project-specific components.
- **`/apps/web`:** React + TypeScript
  - Web app code for mobile access, sharing components with the desktop app where possible.
- **`/services/backend`:** Node.js + Express + TypeScript
  - Organized into:
    - `/routes`: API route definitions (e.g., `projects.ts`, `developments.ts`).
    - `/controllers`: Request handling logic (e.g., `projectController.ts`).
    - `/services`: Business logic and integrations (e.g., `githubService.ts`, `syncService.ts`).
- **`/services/ai`:** Python + FastAPI
  - Includes endpoints for embedding generation (`embeddings.py`) and prompt creation (`prompts.py`).
- **`/packages/shared`:** Shared utilities and types
  - Contains TypeScript interfaces (e.g., `Project.ts`), utilities (e.g., `markdownParser.ts`), and constants.

---

## 3. Feature Specification

### 3.1 Project Management
- **User Story:** As a user, I want to manage my projects, including creating, viewing, and organizing them with tags and statuses.
- **Requirements:**
  - Dashboard to view all projects with name, description, status, and tags.
  - Form to create projects with filtering, sorting, and tagging.
- **Implementation Steps:**
  1. **UI:** Build `ProjectDashboard.tsx` with a list/grid view using React and Tailwind CSS.
  2. **Form:** Create `ProjectForm.tsx` for project creation, with fields for name, description, and status.
  3. **API:** Develop `/api/projects` endpoints (GET, POST, PUT, DELETE) in `projects.ts`.
  4. **Database:** Use Sequelize to store projects in PostgreSQL.
  5. **Logic:** Implement filtering (by tags), sorting (by name/status), and tagging in `projectController.ts`.
- **Error Handling and Edge Cases:**
  - Prevent duplicate project names per user (return 409 Conflict).
  - Validate status against an enum (e.g., 'in progress', 'completed').
  - Handle large project lists with pagination (limit 50 per page).

### 3.2 Documentation Handling
- **User Story:** As a user, I want to upload and view project documentation in Markdown.
- **Requirements:**
  - Upload Markdown files or input text.
  - Render Markdown content in the app.
- **Implementation Steps:**
  1. **UI:** Add `DocumentationUploader.tsx` for file/text input.
  2. **Rendering:** Use `react-markdown` in `DocumentationViewer.tsx` to display content.
  3. **API:** Create `/api/projects/:id/documentation` POST endpoint to store documentation.
  4. **Storage:** Save Markdown content in PostgreSQL or as files on the server.
- **Error Handling and Edge Cases:**
  - Reject invalid Markdown files (return 400 Bad Request).
  - Limit file size to 10MB to prevent performance issues.

### 3.3 Integration with External Tools
- **User Story:** As a user, I want to link GitHub repositories and local folders to my projects.
- **Requirements:**
  - Fetch GitHub repo metadata from a URL.
  - Monitor and sync local folders across devices.
- **Implementation Steps:**
  1. **GitHub:**
     - UI: Add `GitHubLink.tsx` for URL input.
     - API: Create `/api/github/metadata` GET endpoint using GitHub API.
     - Store repo URL and metadata in `Projects` table.
  2. **Local Folders:**
     - Desktop: Use `chokidar` in `FolderMonitor.ts` to watch folder changes.
     - API: Implement `/api/sync/folder` POST endpoint to upload changes.
     - Web: Display synced contents via `/api/projects/:id/folders` GET.
- **Error Handling and Edge Cases:**
  - Handle invalid/private GitHub URLs (return 403 Forbidden).
  - Queue large folder syncs to avoid overwhelming the server.

### 3.4 Indexing and Searching
- **User Story:** As a user, I want to search projects and developments semantically.
- **Requirements:**
  - Index documentation and developments using embeddings.
  - Provide semantic search functionality.
- **Implementation Steps:**
  1. **Indexing:**
     - AI Service: Create `/embeddings` POST endpoint to generate embeddings with E5/BGE.
     - Backend: Call AI service and store embeddings in Milvus via `milvusService.ts`.
  2. **Search:**
     - UI: Build `SearchBar.tsx` with query input.
     - API: Implement `/api/search` GET endpoint to query Milvus with cosine similarity.
- **Error Handling and Edge Cases:**
  - Retry embedding generation on failure (max 3 attempts).
  - Handle empty search results gracefully (display "No results").

### 3.5 Relevance Matching
- **User Story:** As a user, I want suggestions on how developments apply to projects and vice versa.
- **Requirements:**
  - Match new developments to projects and new projects to developments.
  - Provide actionable suggestions.
- **Implementation Steps:**
  1. **Logic:**
     - On development/project creation, generate embedding and query Milvus for matches.
     - Use cosine similarity with a threshold (e.g., 0.8).
  2. **Suggestions:**
     - AI Service: Add `/suggestions` POST endpoint to generate text suggestions.
     - UI: Display matches in `RelevancePanel.tsx`.
- **Error Handling and Edge Cases:**
  - Return empty suggestions if no matches exceed threshold.
  - Allow threshold adjustment in settings.

### 3.6 Development Tracking
- **User Story:** As a user, I want to save and manage developments with metadata.
- **Requirements:**
  - Save developments with source, date, etc.
  - View, filter, and search developments.
- **Implementation Steps:**
  1. **Storage:** Add `Developments` table and `/api/developments` endpoints.
  2. **UI:** Create `DevelopmentList.tsx` with filtering and search.
  3. **Indexing:** Generate and store embeddings as in 3.4.
- **Error Handling and Edge Cases:**
  - Validate metadata completeness (return 400 if missing required fields).
  - Handle large development lists with pagination.

### 3.7 Prompt Generation and Management
- **User Story:** As a user, I want to generate and manage AI prompts based on projects and developments.
- **Requirements:**
  - Generate personalized prompts with templates.
  - Review, edit, and use prompts externally.
- **Implementation Steps:**
  1. **Templates:** Define prompt templates in `promptTemplates.ts`.
  2. **Generation:** AI Service endpoint `/prompts` POST to create prompts.
  3. **UI:** Build `PromptManager.tsx` for review and editing.
- **Error Handling and Edge Cases:**
  - Handle insufficient data for prompt generation (return placeholder prompt).
  - Limit prompt length to 1000 characters.

### 3.8 Collaboration
- **User Story:** As a user, I want to share projects and allow comments.
- **Requirements:**
  - Share projects with permissions (read-only, comment).
  - Add comments to projects.
- **Implementation Steps:**
  1. **Sharing:** Add `/api/projects/:id/share` POST endpoint with permission levels.
  2. **Comments:** Create `Comments` table and `/api/comments` endpoints.
  3. **UI:** Implement `ShareDialog.tsx` and `CommentSection.tsx`.
- **Error Handling and Edge Cases:**
  - Prevent unauthorized access (return 403 Forbidden).
  - Limit comments to 500 characters to prevent abuse.

---

## 4. Database Schema

### 4.1 Tables

**Users**
- `id`: UUID, primary key
- `clerk_id`: string, unique (Clerk integration)
- `email`: string, unique, not null
- `created_at`: timestamp
- `updated_at`: timestamp

**Projects**
- `id`: UUID, primary key
- `user_id`: UUID, foreign key to `Users`, not null
- `name`: string, not null
- `description`: text
- `status`: enum ('in progress', 'completed', 'on hold'), not null
- `github_repo_url`: string
- `local_folder_path`: string
- `documentation`: text
- `created_at`: timestamp
- `updated_at`: timestamp
- Indexes: `user_id`, `name`

**Developments**
- `id`: UUID, primary key
- `user_id`: UUID, foreign key to `Users`, not null
- `content`: text, not null
- `source`: string
- `date`: date
- `created_at`: timestamp
- `updated_at`: timestamp
- Indexes: `user_id`, `date`

**Tags**
- `id`: UUID, primary key
- `name`: string, not null
- `user_id`: UUID, foreign key to `Users`, not null
- Indexes: `user_id`, `name`

**ProjectTags**
- `project_id`: UUID, foreign key to `Projects`
- `tag_id`: UUID, foreign key to `Tags`
- Primary key: (`project_id`, `tag_id`)

**Comments**
- `id`: UUID, primary key
- `project_id`: UUID, foreign key to `Projects`, not null
- `user_id`: UUID, foreign key to `Users`, not null
- `content`: text, not null
- `created_at`: timestamp
- `updated_at`: timestamp
- Indexes: `project_id`, `user_id`

**Milvus Collections**
- **ProjectsEmbeddings**
  - `id`: UUID
  - `embedding`: vector (dimension based on E5/BGE model, e.g., 768)
- **DevelopmentsEmbeddings**
  - `id`: UUID
  - `embedding`: vector (dimension based on E5/BGE model, e.g., 768)

---

## 5. Server Actions

### 5.1 Database Actions
**Create Project**
- **Description:** Creates a new project for a user.
- **Input Parameters:** `userId: string`, `projectData: { name: string, description: string, status: string }`
- **Return Value:** `projectId: string`
- **ORM Operation:**
  ```typescript
  const project = await Project.create({ userId, ...projectData });
  return project.id;
  ```

### 5.2 Other Actions
**GitHub Metadata Fetch**
- **Endpoint:** `GET /api/github/metadata`
- **Parameters:** `repoUrl: string`
- **Authentication:** Optional GitHub API token via header `Authorization: Bearer <token>`
- **Response:** `{ name: string, description: string, lastUpdated: string }`
- **Implementation:** Use Axios to call GitHub API (`https://api.github.com/repos/:owner/:repo`).

**Folder Sync**
- **Process:**
  1. Desktop app uses `chokidar` to detect changes.
  2. POST to `/api/sync/folder` with file data.
  3. Store files in Render’s filesystem or cloud storage (e.g., S3).
- **Endpoint:** `POST /api/sync/folder`
- **Parameters:** `projectId: string`, `files: FormData`

**Embedding Generation**
- **Endpoint:** `POST /ai/embeddings`
- **Parameters:** `texts: string[]`
- **Response:** `{ embeddings: number[][] }`
- **Implementation:** Use Hugging Face Transformers to load E5/BGE model and generate embeddings.

---

## 6. Design System

### 6.1 Visual Style
- **Color Palette:**
  - Primary: `#007BFF` (blue)
  - Secondary: `#6C757D` (gray)
  - Accent: `#28A745` (green)
  - Background: `#F8F9FA` (light), `#343A40` (dark)
- **Typography:**
  - Font Family: `'Roboto', sans-serif`
  - Headings: H1 (24px), H2 (20px), H3 (16px)
  - Body: 14px
- **Component Styling:**
  - Buttons: `border-radius: 4px; padding: 8px 16px;`
  - Inputs: `border: 1px solid #CED4DA; padding: 8px;`
- **Spacing and Layout:**
  - Grid: 4px base unit (e.g., `padding: 8px` is 2x).

### 6.2 Core Components
- **Layout Structure:**
  - Sidebar for navigation, main content area for details.
  - Example: `<div className="flex"><Sidebar /><MainContent /></div>`
- **Navigation Patterns:**
  - Top bar with project switcher and search.
- **Shared Components:**
  - `ProjectCard`: Props `{ name: string, status: string, tags: string[] }`
  - Usage: `<ProjectCard name="My Project" status="in progress" tags={["AI", "Web"]} />`
- **Interactive States:**
  - Button: Hover (`background: lighten(#007BFF, 10%)`), Disabled (`opacity: 0.5`).

---

## 7. Component Architecture

### 7.1 Server Components
- **Data Fetching:** Use `fetch` to call backend APIs, wrapped in Suspense.
- **Props Interface:**
  ```typescript
  interface ProjectListProps {
    projects: Project[];
  }
  ```

### 7.2 Client Components
- **State Management:** React hooks (`useState`, `useEffect`).
- **Props Interface:**
  ```typescript
  interface ProjectFormProps {
    onSubmit: (data: ProjectData) => void;
  }
  ```

---

## 8. Authentication & Authorization
- **Clerk Implementation:**
  - Use `<ClerkProvider>` in `renderer.tsx`.
  - Protect routes with `<SignedIn>` and `<SignedOut>`.
- **Protected Routes:**
  - Example: `<SignedIn><ProjectDashboard /></SignedIn>`
- **Session Management:**
  - Clerk handles tokens, stored in local storage securely.

---

## 9. Data Flow
- **Server/Client Data Passing:** Server components fetch data and pass via props.
- **State Management:** Use React context for global state (e.g., current project).

---

## 10. Stripe Integration
- Not applicable (no payment features specified).

---

## 11. PostHog Analytics
- Not applicable (no analytics specified).

---

## 12. Testing
- **Unit Tests with Jest:**
  - Test `createProject` API: `expect(response.status).toBe(201)`.
- **E2E Tests with Playwright:**
  - Flow: Login → Create Project → Link GitHub Repo → Verify Display.

---

This specification provides a detailed roadmap for developing Idea Hub, ensuring all features are implemented with clear guidance for AI-driven planning and code generation. Let me know if further adjustments are needed!