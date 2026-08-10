---
description: Find and fix a bug in ProjectFlow
---

Fix the bug described by the user.

Follow this process:

1. Understand the reported problem.
2. Inspect the relevant files.
3. Trace the request and data flow.
4. Identify the root cause.
5. Explain the root cause.
6. Make the smallest safe fix.
7. Check that existing functionality is not broken.

For backend issues inspect:

- Routes
- Middleware
- Controllers
- Models
- Request data
- Response data
- Authentication
- Authorization

For frontend issues inspect:

- Components
- State
- Props
- API services
- API responses
- Loading states
- Error handling

After fixing:

- Check syntax.
- Review changed files.
- Run available tests.
- Explain exactly what was changed.