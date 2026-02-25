# Testing Guide

This document provides comprehensive information about the testing setup and how to run tests for the Phinite Workflow application.

## Testing Stack

- **Unit/Integration Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Database Testing**: MongoDB Memory Server
- **TypeScript**: Full TypeScript support

## Test Structure

```
src/
├── __tests__/
│   ├── unit/           # Unit tests for individual functions/components
│   │   ├── components/
│   │   ├── lib/
│   │   └── services/
│   ├── integration/    # Integration tests for API routes and database
│   │   ├── api/
│   │   └── database/
│   ├── fixtures/       # Test data factories
│   │   ├── users.ts
│   │   └── workflows.ts
│   └── utils/          # Test utilities and helpers
│       └── test-helpers.ts
└── e2e/               # End-to-end tests
    ├── auth/
    ├── workflows/
    └── dashboard/
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run tests for CI (no watch, full coverage)
yarn test:ci
```

### E2E Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run E2E tests with UI
yarn test:e2e:ui

# Debug E2E tests
yarn test:e2e:debug

# Generate new E2E tests
yarn test:e2e:codegen
```

### All Tests

```bash
# Run both unit/integration and E2E tests
yarn test:all
```

## Test Coverage

The project aims for:
- **80%+ code coverage** on business logic
- **100% coverage** on critical authentication flows
- **Comprehensive coverage** of API endpoints
- **Full coverage** of workflow execution logic

Coverage reports are generated in `coverage/` directory when running `yarn test:coverage`.

## Writing Tests

### Unit Tests

Unit tests should test individual functions and components in isolation:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/authStore';

describe('Auth Store', () => {
  it('should set authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: 'user123', email: 'test@example.com' };

    act(() => {
      result.current.setAuth(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });
});
```

### Integration Tests

Integration tests should test API routes and database operations:

```typescript
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/workflows/route';
import { setupTestDatabase, createMockCookies } from '../utils/test-helpers';

describe('/api/workflows', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  it('should create a workflow successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/workflows', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Workflow' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### E2E Tests

E2E tests should test complete user workflows:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Test Utilities

### Fixtures

Use test fixtures for consistent test data:

```typescript
import { mockUsers, createMockUser } from '../fixtures/users';
import { mockWorkflows, createMockWorkflow } from '../fixtures/workflows';

// Use predefined mocks
const user = mockUsers.valid;
const workflow = mockWorkflows.simple;

// Create custom mocks
const customUser = createMockUser({ email: 'custom@example.com' });
const customWorkflow = createMockWorkflow({ name: 'Custom Workflow' });
```

### Test Helpers

Use utility functions for common test operations:

```typescript
import { 
  setupTestDatabase, 
  cleanupTestDatabase, 
  createMockCookies,
  generateMockJWT 
} from '../utils/test-helpers';

// Setup test database
await setupTestDatabase();

// Create mock cookies
const cookies = createMockCookies(generateMockJWT(user));

// Cleanup after tests
await cleanupTestDatabase();
```

## Database Testing

Tests use MongoDB Memory Server for isolated database testing:

- Each test suite gets a fresh in-memory database
- Tests are automatically cleaned up after each test
- No external database dependencies required

## Mock Strategy

- **External Dependencies**: JWT, MongoDB, Next.js headers are mocked
- **Test Isolation**: Each test runs in isolation with fresh mocks
- **Realistic Data**: Test fixtures provide realistic test data
- **Proper Cleanup**: All mocks and database state are cleaned up

## CI/CD Integration

For CI/CD pipelines:

```bash
# Run tests without watch and with coverage
yarn test:ci

# Run E2E tests (ensure server is running)
yarn test:e2e
```

## Debugging Tests

### Unit/Integration Tests

```bash
# Run tests in watch mode for debugging
yarn test:watch

# Run specific test file
yarn test -- workflow-validation.test.ts

# Run tests matching pattern
yarn test -- --testNamePattern="should create"
```

### E2E Tests

```bash
# Run with UI for visual debugging
yarn test:e2e:ui

# Run in debug mode
yarn test:e2e:debug

# Run specific test file
yarn test:e2e auth/login.spec.ts
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should clearly describe what's being tested
3. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
4. **Mock External Dependencies**: Don't rely on external services in tests
5. **Use Test Fixtures**: Maintain consistent test data
6. **Clean Up**: Always clean up after tests to avoid interference
7. **Coverage**: Aim for high coverage but focus on critical paths

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**: Ensure `setupTestDatabase()` is called before tests
2. **Mock Issues**: Check that mocks are properly configured in `beforeEach`
3. **Async Test Timeouts**: Use proper `await` and increase timeout if needed
4. **E2E Test Failures**: Ensure the development server is running on `localhost:3000`

### Debug Commands

```bash
# Check Jest configuration
npx jest --showConfig

# Run Playwright with verbose output
yarn test:e2e --reporter=list

# Check test coverage details
open coverage/lcov-report/index.html
```
