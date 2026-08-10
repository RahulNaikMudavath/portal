# ProjectFlow - GitHub Copilot Instructions

## Project Overview

ProjectFlow is a web-based project and task management portal with separate Admin and Client interfaces.

Admins can create, assign, manage, and review tasks.

Clients can view assigned tasks, start tasks, submit completed work, and track task status.

The application also supports file uploads, notifications, and real-time updates.

## Technology Stack

### Frontend

- React.js
- Tailwind CSS
- Axios
- Socket.io

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- Multer
- Cloudinary

## Project Structure

The project contains separate frontend and backend applications.

### Backend

- `controllers/` - Business logic
- `models/` - MongoDB/Mongoose models
- `routes/` - API routes
- `middleware/` - Authentication and authorization middleware
- `config/` - Configuration and database setup
- `services/` - Reusable backend services

### Frontend

- `src/components/` - Reusable React components
- `src/pages/` - Application pages
- `src/layouts/` - Admin and Client layouts
- `src/services/` - API service functions
- `src/context/` - React context/state management
- `src/assets/` - Static assets

## Authentication and Authorization

The application has separate Admin and Client roles.

Always preserve the existing authentication system.

Admin-only functionality must remain protected by the existing admin authorization middleware.

Client functionality must not provide access to Admin functionality.

Never bypass authentication or authorization checks.

Never expose passwords, tokens, API keys, or other secrets.

## Backend Development Rules

When modifying or creating APIs:

1. Inspect existing routes before creating a new route.
2. Reuse existing controllers and services when appropriate.
3. Reuse existing Mongoose models.
4. Follow the existing API response structure.
5. Validate incoming data.
6. Use appropriate HTTP status codes.
7. Handle errors properly.
8. Preserve existing authentication and authorization.
9. Avoid creating duplicate endpoints.
10. Do not modify unrelated functionality.

Existing task functionality includes:

- Creating tasks
- Getting tasks
- Starting tasks
- Submitting tasks
- Reviewing tasks
- Updating tasks
- Deleting tasks
- Completing tasks

## File Uploads

The application uses:

- Multer for handling uploads
- Cloudinary for file storage

Use the existing upload configuration.

Do not create a second upload system unless explicitly requested.

Support the existing file types and Cloudinary configuration.

Never expose Cloudinary credentials.

## Frontend Development Rules

When creating or modifying React components:

1. Reuse existing components whenever possible.
2. Follow the existing ProjectFlow UI design.
3. Use Tailwind CSS for styling.
4. Keep components reusable.
5. Avoid unnecessary dependencies.
6. Handle loading states.
7. Handle errors.
8. Use the existing API service layer.
9. Do not duplicate API logic inside multiple components.
10. Preserve responsive design.

## API Services

Frontend API calls should use the existing service layer whenever possible.

Do not directly duplicate Axios API logic across multiple components.

When an API changes, check both:

- Backend route/controller
- Frontend service/component using that API

## Socket.io

The application uses Socket.io for real-time notifications and updates.

Do not remove or replace existing Socket.io functionality without explicit instruction.

When modifying notifications, check both the backend event emission and frontend event handling.

## Database

MongoDB is used through Mongoose.

Before changing a model:

1. Inspect existing schema fields.
2. Check which controllers use the model.
3. Check which frontend components depend on the data.
4. Avoid breaking existing documents.

Do not change database schemas unnecessarily.

## Code Modification Rules

Before making changes:

1. Inspect the relevant files.
2. Understand how the existing implementation works.
3. Identify dependencies between frontend and backend.
4. Make the smallest safe change.

Do not rewrite large portions of the application when a smaller change is sufficient.

Do not change unrelated files.

Do not introduce a new library when an existing dependency can solve the problem.

## Environment Variables and Secrets

Never hardcode:

- API keys
- Database credentials
- JWT secrets
- Cloudinary credentials
- Authentication tokens
- Private URLs

Do not modify `.env` files unless explicitly requested.

Use the existing environment variable system.

## Debugging

When fixing a bug:

1. Reproduce or understand the reported behavior.
2. Trace the data flow.
3. Identify the root cause.
4. Explain the cause.
5. Make the smallest required change.
6. Check for related issues.
7. Verify that existing functionality still works.

Do not make random changes just to remove an error message.

## Testing and Verification

After making a significant change:

- Check for syntax errors.
- Check imports.
- Check API routes.
- Check authentication/authorization.
- Check frontend API integration.
- Run available tests.
- Verify that existing functionality has not been broken.

If tests are not available, clearly state what should be manually tested.

## Git Rules

Do not automatically delete or overwrite existing work.

Do not reset or revert commits unless explicitly requested.

Before suggesting a commit, summarize the changes made.

Use clear commit messages.

## General Copilot Behavior

When working on ProjectFlow:

- Understand the existing code before changing it.
- Prefer simple solutions.
- Follow existing coding patterns.
- Preserve existing functionality.
- Ask for clarification when requirements are ambiguous.
- Explain important changes clearly.
- Do not invent files, APIs, models, or functionality that do not exist.
- Do not assume a dependency is installed; check the project first.