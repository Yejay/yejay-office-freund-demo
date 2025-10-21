import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InvoiceTable } from '../invoice-table'
import { Invoice } from '@/lib/types/invoice'

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    refresh: jest.fn(),
  })),
}))

// Mock the server actions
jest.mock('@/app/actions/invoices', () => ({
  deleteInvoice: jest.fn(() => Promise.resolve({ success: true })),
  duplicateInvoice: jest.fn(() => Promise.resolve({ success: true })),
}))

// Mock window.confirm
global.confirm = jest.fn(() => true)
global.alert = jest.fn()

const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    amount: 1000,
    status: 'paid',
    due_date: '2024-12-31',
    payment_method: 'credit_card',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    user_id: 'user-1',
  },
  {
    id: '2',
    invoice_number: 'INV-002',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    amount: 2500,
    status: 'pending',
    due_date: '2024-12-15',
    payment_method: 'bank_transfer',
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
    user_id: 'user-1',
  },
  {
    id: '3',
    invoice_number: 'INV-003',
    customer_name: 'Bob Johnson',
    customer_email: 'bob@example.com',
    amount: 750,
    status: 'overdue',
    due_date: '2024-11-30',
    payment_method: 'paypal',
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
    user_id: 'user-1',
  },
]

describe('InvoiceTable', () => {
  const mockOnEdit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all invoices by default', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('INV-002')).toBeInTheDocument()
    expect(screen.getByText('INV-003')).toBeInTheDocument()
  })

  it('displays invoice details correctly', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })

  it('filters invoices by search query', async () => {
    const user = userEvent.setup()
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    const searchInput = screen.getByPlaceholderText('Search invoices...')
    await user.type(searchInput, 'jane')

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('filters invoices by status', async () => {
    const user = userEvent.setup()
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    // Click on the "Paid" tab
    const paidTab = screen.getByRole('tab', { name: /paid/i })
    await user.click(paidTab)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('shows correct counts in status tabs', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByRole('tab', { name: /all \(3\)/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /paid \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /pending \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /overdue \(1\)/i })).toBeInTheDocument()
  })

  it('calls onEdit when edit is clicked', async () => {
    const user = userEvent.setup()
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    // Click the first row's dropdown menu
    const dropdownButtons = screen.getAllByRole('button', { name: '' })
    await user.click(dropdownButtons[0])

    // Click the Edit option
    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockInvoices[0])
  })

  it('shows "No invoices found" when no results match', async () => {
    const user = userEvent.setup()
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    const searchInput = screen.getByPlaceholderText('Search invoices...')
    await user.type(searchInput, 'nonexistent')

    expect(screen.getByText('No invoices found')).toBeInTheDocument()
  })

  it('displays correct total amount for filtered invoices', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    // Should show total of all invoices
    expect(screen.getByText(/Total: \$4,250\.00/i)).toBeInTheDocument()
  })

  it('displays correct invoice count', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByText(/Showing 3 of 3 invoices/i)).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('$2,500.00')).toBeInTheDocument()
    expect(screen.getByText('$750.00')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument()
    expect(screen.getByText('Dec 15, 2024')).toBeInTheDocument()
    expect(screen.getByText('Nov 30, 2024')).toBeInTheDocument()
  })

  it('applies correct status badge colors', () => {
    render(<InvoiceTable invoices={mockInvoices} onEdit={mockOnEdit} />)

    const paidBadge = screen.getByText('Paid')
    expect(paidBadge).toHaveClass('bg-green-50', 'text-green-700')

    const pendingBadge = screen.getByText('Pending')
    expect(pendingBadge).toHaveClass('bg-blue-50', 'text-blue-700')

    const overdueBadge = screen.getByText('Overdue')
    expect(overdueBadge).toHaveClass('bg-red-50', 'text-red-700')
  })
})
