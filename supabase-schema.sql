-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB DEFAULT '[]'::jsonb,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'cash', 'other')),
  notes TEXT,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on org_id for faster queries
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON public.invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view invoices from their organization" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert invoices for their organization" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices from their organization" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices from their organization" ON public.invoices;

-- RLS Policies
-- Note: In production, you'd validate the org_id against Clerk's JWT claims
-- For this demo, we'll use a simpler approach where org_id is passed from the app

-- Policy for SELECT: Users can view invoices from their organization
CREATE POLICY "Users can view invoices from their organization"
  ON public.invoices
  FOR SELECT
  USING (true); -- We'll handle org filtering in the application layer

-- Policy for INSERT: Users can create invoices for their organization
CREATE POLICY "Users can insert invoices for their organization"
  ON public.invoices
  FOR INSERT
  WITH CHECK (true); -- We'll handle org validation in the application layer

-- Policy for UPDATE: Users can update invoices from their organization
CREATE POLICY "Users can update invoices from their organization"
  ON public.invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true); -- We'll handle org validation in the application layer

-- Policy for DELETE: Users can delete invoices from their organization
CREATE POLICY "Users can delete invoices from their organization"
  ON public.invoices
  FOR DELETE
  USING (true); -- We'll handle org validation in the application layer

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.invoices;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert mock data
INSERT INTO public.invoices (invoice_number, customer_name, customer_email, amount, status, due_date, issue_date, items, payment_method, notes, org_id, user_id)
VALUES
  ('INV-001', 'Acme Corporation', 'accounting@acme.com', 5420.00, 'paid', '2025-01-15', '2024-12-15', '[{"name": "Web Development", "quantity": 40, "price": 120.00}, {"name": "Design Services", "quantity": 10, "price": 150.00}]'::jsonb, 'bank_transfer', 'Payment received on time', 'demo_org_1', 'user_1'),
  ('INV-002', 'TechStart Inc', 'finance@techstart.io', 3200.00, 'pending', '2025-02-01', '2025-01-15', '[{"name": "Monthly Retainer", "quantity": 1, "price": 3200.00}]'::jsonb, 'credit_card', 'Recurring monthly invoice', 'demo_org_1', 'user_1'),
  ('INV-003', 'Global Solutions Ltd', 'billing@globalsolutions.com', 8750.50, 'overdue', '2024-12-20', '2024-11-20', '[{"name": "Consulting Services", "quantity": 50, "price": 175.00}]'::jsonb, 'bank_transfer', 'Follow up required', 'demo_org_1', 'user_1'),
  ('INV-004', 'Startup Ventures', 'ap@startupventures.com', 1850.00, 'pending', '2025-02-15', '2025-01-20', '[{"name": "Logo Design", "quantity": 1, "price": 850.00}, {"name": "Brand Guidelines", "quantity": 1, "price": 1000.00}]'::jsonb, 'paypal', 'New client', 'demo_org_1', 'user_1'),
  ('INV-005', 'Enterprise Systems Co', 'payments@enterprise.com', 12000.00, 'paid', '2025-01-10', '2024-12-10', '[{"name": "Custom Software Development", "quantity": 80, "price": 150.00}]'::jsonb, 'bank_transfer', 'Large project milestone 1', 'demo_org_1', 'user_1'),
  ('INV-006', 'Digital Marketing Pro', 'accounts@digitalmp.com', 2500.00, 'pending', '2025-02-05', '2025-01-22', '[{"name": "SEO Services", "quantity": 1, "price": 1500.00}, {"name": "Content Creation", "quantity": 1, "price": 1000.00}]'::jsonb, 'credit_card', 'Monthly services', 'demo_org_1', 'user_1'),
  ('INV-007', 'Cloud Services Inc', 'billing@cloudservices.io', 950.00, 'paid', '2025-01-08', '2024-12-08', '[{"name": "Server Maintenance", "quantity": 1, "price": 950.00}]'::jsonb, 'credit_card', 'Auto-renewed', 'demo_org_1', 'user_1'),
  ('INV-008', 'Innovation Hub', 'finance@innovationhub.com', 4200.00, 'overdue', '2024-12-25', '2024-11-25', '[{"name": "Workshop Series", "quantity": 3, "price": 1400.00}]'::jsonb, 'bank_transfer', 'Sent reminder on Jan 5', 'demo_org_1', 'user_1'),
  ('INV-009', 'Future Tech Partners', 'ap@futuretech.com', 6800.00, 'pending', '2025-02-10', '2025-01-25', '[{"name": "Mobile App Development", "quantity": 40, "price": 170.00}]'::jsonb, 'bank_transfer', 'Phase 1 of 3', 'demo_org_1', 'user_1'),
  ('INV-010', 'Creative Studios', 'accounts@creativestudios.com', 3150.00, 'paid', '2025-01-18', '2024-12-18', '[{"name": "Video Production", "quantity": 1, "price": 2500.00}, {"name": "Editing Services", "quantity": 1, "price": 650.00}]'::jsonb, 'paypal', 'Excellent collaboration', 'demo_org_1', 'user_1');

-- Create a second organization's data
INSERT INTO public.invoices (invoice_number, customer_name, customer_email, amount, status, due_date, issue_date, items, payment_method, notes, org_id, user_id)
VALUES
  ('INV-B001', 'Beta Client Inc', 'billing@betaclient.com', 2500.00, 'paid', '2025-01-12', '2024-12-12', '[{"name": "Consulting", "quantity": 20, "price": 125.00}]'::jsonb, 'credit_card', 'Second org invoice', 'demo_org_2', 'user_2'),
  ('INV-B002', 'Gamma Solutions', 'ap@gamma.com', 1800.00, 'pending', '2025-02-08', '2025-01-20', '[{"name": "Support Services", "quantity": 1, "price": 1800.00}]'::jsonb, 'bank_transfer', 'Second org invoice', 'demo_org_2', 'user_2');
