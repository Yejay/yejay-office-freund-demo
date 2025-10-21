# Testing Guide

This project uses **Jest** and **React Testing Library** for testing UI components.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located in `__tests__` folders next to the components they test:

```
components/
  ui/
    button.tsx
    __tests__/
      button.test.tsx
  invoices/
    invoice-table.tsx
    __tests__/
      invoice-table.test.tsx
```

## Writing Tests

### Basic Component Test

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})
```

### Testing User Interactions

```tsx
import userEvent from '@testing-library/user-event'

it('handles click events', async () => {
  const handleClick = jest.fn()
  const user = userEvent.setup()

  render(<Button onClick={handleClick}>Click me</Button>)
  await user.click(screen.getByRole('button'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Mocking Next.js Router

```tsx
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}))
```

### Mocking Server Actions

```tsx
jest.mock('@/app/actions/invoices', () => ({
  deleteInvoice: jest.fn(() => Promise.resolve({ success: true })),
}))
```

## Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Focus on what the user sees and does, not implementation details
3. **Avoid testing implementation details**: Don't test internal state or private methods
4. **Use async/await**: Always await user interactions with `userEvent`
5. **Clean up**: Jest automatically cleans up after each test

## Example Tests

Check out these example tests:
- `components/ui/__tests__/button.test.tsx` - Basic component testing
- `components/invoices/__tests__/invoice-table.test.tsx` - Complex data table testing

## Resources

- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
