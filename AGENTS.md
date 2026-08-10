# ProjectFlow - AI Agent Instructions

## Project Overview

ProjectFlow is a project and task management portal with separate
Admin and Client interfaces.

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- Socket.io

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- Cloudinary
- Multer

## Project Structure

- `frontend/` - React frontend
- `backend/` - Express backend
- `backend/controllers/` - Business logic
- `backend/models/` - MongoDB models
- `backend/routes/` - API routes
- `backend/middleware/` - Authentication and authorization
- `frontend/src/components/` - Reusable React components
- `frontend/src/pages/` - Application pages
- `frontend/src/services/` - API/service functions

## Important Rules

- Do not expose secrets or API keys.
- Do not modify `.env` files unless explicitly requested.
- Follow the existing project structure.
- Reuse existing services and components where possible.
- Do not introduce a new dependency when an existing dependency can solve the problem.
- Keep Admin and Client authorization separate.
- Protect admin-only API routes with the existing authentication middleware.
- Use the existing Cloudinary upload system for uploaded files.
- Maintain the existing API response structure.

## Before Making Changes

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Identify dependencies between frontend and backend.
4. Make the smallest safe change.

## After Making Changes

- Check for syntax errors.
- Run the relevant tests if available.
- Verify affected API endpoints.
- Verify that existing functionality has not been broken.