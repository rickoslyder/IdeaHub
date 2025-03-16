# Idea Hub

Idea Hub is a desktop application with server-side syncing capabilities, designed for managing and visualizing personal projects, including documentation, GitHub repositories, and local folders. The app leverages AI to track new developments in AI and software engineering, offering actionable suggestions for applying these developments to projects and generating prompts for advanced AI models.

## Features

- **Project Management**: Create, view, and organize projects with tags and statuses
- **Documentation Handling**: Upload and render Markdown documentation
- **Integration with External Tools**: Link GitHub repositories and local folders
- **Indexing and Searching**: Index and search content using embeddings and semantic search
- **Relevance Matching**: Suggest relevant projects for new developments and vice versa
- **Development Tracking**: Save and manage new developments with metadata
- **Prompt Generation**: Generate and edit AI prompts based on project data
- **Collaboration**: Share projects and add comments

## Architecture

- **Desktop App**: Electron + React + TypeScript
- **Web App**: React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **AI Service**: Python + FastAPI
- **Databases**:
  - PostgreSQL: Relational data storage (e.g., projects, users)
  - Milvus: Vector database for storing and searching embeddings

## Project Structure

- `/apps/desktop`: Desktop app code (Electron + React)
- `/apps/web`: Web app code (React)
- `/services/backend`: Backend API code (Node.js + Express)
- `/services/ai`: AI service code (Python + FastAPI)
- `/packages/shared`: Shared utilities, types, or components across the project

## Implementation Progress

### Completed
- ✅ Project structure setup with monorepo configuration
- ✅ TypeScript configuration
- ✅ Basic Express server
- ✅ Project and Development models
- ✅ Project API with CRUD operations
- ✅ Development API with CRUD operations
- ✅ Basic relevance functionality to connect projects and developments

### Current Focus
- 🔄 Solving TypeScript decorator issues
- 🔄 Setting up PostgreSQL connection
- 🔄 Implementing proper search functionality with Milvus

### Next Steps
- ⏱️ Authentication using Clerk
- ⏱️ GitHub repository integration
- ⏱️ Local folder sync functionality
- ⏱️ Frontend development (Desktop and Web)
- ⏱️ AI embedding generation service

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL
- Python 3.9+
- Docker (for Milvus)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/idea-hub.git
   cd idea-hub
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up PostgreSQL:
   - Create a database named `ideahub`
   - Update the `.env` file in `services/backend` with your database credentials

4. Set up Milvus:
   ```bash
   docker run -d --name milvus_standalone -p 19530:19530 milvusdb/milvus:latest
   ```

5. Set up the AI service:
   ```bash
   cd services/ai
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend:
   ```bash
   cd services/backend
   yarn dev
   ```

2. Start the AI service:
   ```bash
   cd services/ai
   python run.py
   ```

3. Start the desktop app:
   ```bash
   cd apps/desktop
   yarn dev
   ```

4. Start the web app:
   ```bash
   cd apps/web
   yarn dev
   ```

## Development

- The project uses a monorepo structure with Yarn Workspaces
- TypeScript is used for all JavaScript code
- ESLint and Prettier are used for code formatting
- The shared package contains common types and utilities

## License

MIT 

### Available APIs
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `GET /api/developments` - Get all developments
- `GET /api/developments/:id` - Get a development by ID
- `POST /api/developments` - Create a new development
- `PUT /api/developments/:id` - Update a development
- `DELETE /api/developments/:id` - Delete a development
- `GET /api/relevance/development/:id/projects` - Get projects relevant to a development
- `GET /api/relevance/project/:id/developments` - Get developments relevant to a project

## AI Service

The AI service provides intelligent features for the Idea Hub application, including:

- **Embedding Generation**: Convert text into vector embeddings for semantic search
- **Relevance Computation**: Find related projects and developments based on semantic similarity
- **Prompt Engineering**: Generate context-aware prompts for AI assistants

### Setup and Running

1. Navigate to the AI service directory:
   ```
   cd services/ai
   ```

2. Create a Python virtual environment:
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the service:
   ```
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

5. Access the API documentation at `http://localhost:8000/docs`

### API Endpoints

- `GET /health`: Check if the service is running
- `POST /embeddings`: Generate embeddings for text inputs
- `POST /relevance`: Compute relevance between a query and documents
- `POST /prompts/general`: Generate general-purpose prompts
- `POST /prompts/technical`: Generate technical problem-solving prompts
- `POST /prompts/brainstorm`: Generate brainstorming prompts

### Environment Variables

- `PORT`: Port to run the service on (default: 8000)
- `MODEL_NAME`: Default embedding model to use (default: all-MiniLM-L6-v2) 