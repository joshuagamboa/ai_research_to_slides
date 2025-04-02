# Testing Documentation

## Overview

This directory contains comprehensive tests for the Research to Slides application. The tests are organized following the same structure as the main application, with separate directories for components, composables, and utilities.

## Test Structure

```
tests/
├── components/
│   ├── atoms/         # Tests for atomic components
│   ├── molecules/     # Tests for molecular components
│   └── organisms/     # Tests for organism components
├── composables/       # Tests for Vue composables
├── utils/             # Tests for utility functions
├── setup.ts           # Test setup and configuration
└── README.md          # This file
```

## Running Tests

The following npm scripts are available for running tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Testing Tools

- **Vitest**: Fast Vite-based testing framework
- **@vue/test-utils**: Vue component testing library
- **jsdom**: DOM environment for component testing

## Testing Approach

### Component Tests

Component tests verify that components render correctly, respond to user interactions, and emit the expected events. They follow these principles:

- Test props and their effects on rendering
- Test user interactions (clicks, input changes)
- Test event emissions
- Test conditional rendering

### Composable Tests

Composable tests verify that the reactive state and functions work correctly. They follow these principles:

- Test initial state
- Test state changes in response to function calls
- Test error handling
- Mock external dependencies

### Utility Tests

Utility tests verify that pure functions produce the expected outputs for given inputs. They follow these principles:

- Test normal cases
- Test edge cases
- Test error handling

## Mocking

External dependencies are mocked to isolate the code being tested:

- API calls are mocked using vi.fn()
- Child components are mocked when testing parent components
- Environment variables are set in setup.ts