'use server';

import { createClerkSupabaseClient } from '@/lib/supabase/clerk-server';
import {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  validateCreateInvoice,
  validateUpdateInvoice,
  formatZodErrors,
} from '@/lib/types/invoice';
import { canCreateInvoice } from '@/lib/billing/subscription-limits';
import { revalidatePath } from 'next/cache';

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const { supabase, orgId } = await createClerkSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getInvoices:', error);
    throw error;
  }
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  try {
    const { supabase, orgId } = await createClerkSupabaseClient();

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getInvoiceById:', error);
    return null;
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<{ success: boolean; invoice?: Invoice; error?: string; validationErrors?: Record<string, string> }> {
  try {
    // ============================================================================
    // STEP 1: Validate input with Zod
    // ============================================================================
    // This catches invalid data BEFORE it reaches the database
    // Examples of what Zod catches:
    // - Missing required fields
    // - Invalid email formats
    // - Negative amounts
    // - Due date before issue date
    // - Empty item arrays
    const validation = validateCreateInvoice(input);

    if (!validation.success) {
      // Format errors for user-friendly display
      const validationErrors = formatZodErrors(validation.error);
      console.error('Validation failed:', validationErrors);

      return {
        success: false,
        error: 'Invalid invoice data. Please check your inputs.',
        validationErrors,
      };
    }

    // At this point, we know the data is valid
    const validatedData = validation.data;

    // ============================================================================
    // STEP 2: Get authenticated context
    // ============================================================================
    const { supabase, orgId, userId } = await createClerkSupabaseClient();

    // ============================================================================
    // STEP 3: Check subscription limits
    // ============================================================================
    // Fetch all invoices to check monthly usage
    const { data: allInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select('created_at')
      .eq('org_id', orgId);

    if (fetchError) {
      console.error('Error fetching invoices for limit check:', fetchError);
      return { success: false, error: 'Failed to check subscription limits' };
    }

    // Check if organization can create another invoice
    const limitCheck = await canCreateInvoice(allInvoices || []);

    if (!limitCheck.allowed) {
      console.warn('Invoice creation blocked by subscription limit:', limitCheck);
      return {
        success: false,
        error: limitCheck.reason || 'Subscription limit reached',
      };
    }

    // ============================================================================
    // STEP 4: Create invoice in database
    // ============================================================================
    const invoiceData = {
      ...validatedData,
      invoice_number: generateInvoiceNumber(),
      org_id: orgId,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }

    // ============================================================================
    // STEP 5: Revalidate cache and return success
    // ============================================================================
    revalidatePath('/dashboard');
    revalidatePath('/billing'); // Also refresh billing page to update usage
    return { success: true, invoice: data };
  } catch (error) {
    console.error('Error in createInvoice:', error);
    return { success: false, error: 'Failed to create invoice' };
  }
}

export async function updateInvoice(input: UpdateInvoiceInput): Promise<{ success: boolean; invoice?: Invoice; error?: string; validationErrors?: Record<string, string> }> {
  try {
    // ============================================================================
    // STEP 1: Validate input with Zod
    // ============================================================================
    const validation = validateUpdateInvoice(input);

    if (!validation.success) {
      const validationErrors = formatZodErrors(validation.error);
      console.error('Validation failed:', validationErrors);

      return {
        success: false,
        error: 'Invalid invoice data. Please check your inputs.',
        validationErrors,
      };
    }

    const validatedData = validation.data;

    // ============================================================================
    // STEP 2: Get authenticated context
    // ============================================================================
    const { supabase, orgId } = await createClerkSupabaseClient();

    // ============================================================================
    // STEP 3: Update invoice in database
    // ============================================================================
    const { id, ...updateData } = validatedData;

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, invoice: data };
  } catch (error) {
    console.error('Error in updateInvoice:', error);
    return { success: false, error: 'Failed to update invoice' };
  }
}

export async function deleteInvoice(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, orgId } = await createClerkSupabaseClient();

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);

    if (error) {
      console.error('Error deleting invoice:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    return { success: false, error: 'Failed to delete invoice' };
  }
}

export async function duplicateInvoice(id: string): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
  try {
    const { supabase, orgId, userId } = await createClerkSupabaseClient();

    // Get the original invoice
    const { data: original, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('org_id', orgId)
      .single();

    if (fetchError || !original) {
      return { success: false, error: 'Invoice not found' };
    }

    // Create a copy with a new invoice number
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, invoice_number, created_at, updated_at, ...copyData } = original;

    const newInvoice = {
      ...copyData,
      invoice_number: generateInvoiceNumber(),
      status: 'pending' as const,
      org_id: orgId,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(newInvoice)
      .select()
      .single();

    if (error) {
      console.error('Error duplicating invoice:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, invoice: data };
  } catch (error) {
    console.error('Error in duplicateInvoice:', error);
    return { success: false, error: 'Failed to duplicate invoice' };
  }
}
