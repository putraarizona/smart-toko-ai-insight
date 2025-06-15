import { supabase } from './client';
import type { Database } from './types';

// Products functions
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
    .limit(5);

  if (error) throw error;
  return data;
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(product: Database['public']['Tables']['products']['Insert']) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, product: Database['public']['Tables']['products']['Update']) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Marketplace/Supplier functions
export async function getMarketplaceSuppliers() {
  const { data, error } = await supabase
    .from('marketplace_suppliers')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getSupplierAccounts(marketplaceSupplierId?: number) {
  let query = supabase
    .from('supplier_accounts')
    .select('*, marketplace_supplier:marketplace_suppliers(*)');
  
  if (marketplaceSupplierId) {
    query = query.eq('marketplace_supplier_id', marketplaceSupplierId);
  }
  
  const { data, error } = await query.order('account_name');

  if (error) throw error;
  return data;
}

// Product Categories functions
export async function getProductCategories() {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function createProductCategory(category: Database['public']['Tables']['product_categories']['Insert']) {
  const { data, error } = await supabase
    .from('product_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProductCategory(id: number, category: Database['public']['Tables']['product_categories']['Update']) {
  const { data, error } = await supabase
    .from('product_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProductCategory(id: number) {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Purchases functions
export async function getPurchases() {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      purchase_details (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPurchaseById(id: number) {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      purchase_details (
        *,
        product:products (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function checkPurchaseOrderExists(no_pesanan: string, excludeId?: number) {
  let query = supabase
    .from('purchases')
    .select('id')
    .eq('no_pesanan', no_pesanan);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    throw error;
  }

  return !!data;
}

export async function createPurchase(
  purchase: Database['public']['Tables']['purchases']['Insert'],
  details: Array<Omit<Database['public']['Tables']['purchase_details']['Insert'], 'purchase_id'> & { product?: any }>
) {
  // Check if purchase order number already exists
  const exists = await checkPurchaseOrderExists(purchase.no_pesanan);
  if (exists) {
    throw new Error('Nomor pesanan sudah digunakan');
  }

  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .insert(purchase)
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // Hapus field product sebelum insert
  const purchaseDetails = details.map(detail => {
    const { product, ...rest } = detail;
    return {
      ...rest,
      purchase_id: purchaseData.id
    };
  });

  console.log('purchaseDetails yang akan di-insert:', purchaseDetails);

  const { error: detailsError } = await supabase
    .from('purchase_details')
    .insert(purchaseDetails);

  if (detailsError) {
    console.error('Error insert purchase_details:', detailsError);
    throw detailsError;
  }

  return purchaseData;
}

export async function updatePurchase(
  id: number,
  purchase: Database['public']['Tables']['purchases']['Update'],
  details: Array<Omit<Database['public']['Tables']['purchase_details']['Insert'], 'purchase_id'> & { product?: any }>
) {
  // Check if purchase order number already exists (excluding current purchase)
  if (purchase.no_pesanan) {
    const exists = await checkPurchaseOrderExists(purchase.no_pesanan, id);
    if (exists) {
      throw new Error('Nomor pesanan sudah digunakan');
    }
  }

  const { data: purchaseData, error: purchaseError } = await supabase
    .from('purchases')
    .update(purchase)
    .eq('id', id)
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // Delete existing details
  const { error: deleteError } = await supabase
    .from('purchase_details')
    .delete()
    .eq('purchase_id', id);

  if (deleteError) throw deleteError;

  // Insert new details, hapus field product
  const purchaseDetails = details.map(detail => {
    const { product, ...rest } = detail;
    return {
      ...rest,
      purchase_id: id
    };
  });

  const { error: detailsError } = await supabase
    .from('purchase_details')
    .insert(purchaseDetails);

  if (detailsError) {
    console.error('Error insert purchase_details (update):', detailsError);
    throw detailsError;
  }

  return purchaseData;
}

export async function deletePurchase(id: number) {
  // Delete purchase details first
  const { error: detailsError } = await supabase
    .from('purchase_details')
    .delete()
    .eq('purchase_id', id);

  if (detailsError) throw detailsError;

  // Then delete the purchase
  const { error: purchaseError } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id);

  if (purchaseError) throw purchaseError;
}

// Sales functions
export async function getSales() {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sales_details (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSaleById(id: number) {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      sales_details (
        *,
        product:products (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function checkSaleNumberExists(saleNumber: string, excludeId?: number) {
  let query = supabase
    .from('sales')
    .select('id')
    .eq('sale_number', saleNumber);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    throw error;
  }

  return !!data;
}

export async function createSale(
  sale: Database['public']['Tables']['sales']['Insert'],
  details: Array<Omit<Database['public']['Tables']['sales_details']['Insert'], 'sale_id'>>
) {
  try {
    console.log('Creating sale with data:', sale, details);
    
    // Check if sale number already exists
    const exists = await checkSaleNumberExists(sale.sale_number);
    if (exists) {
      throw new Error('Nomor transaksi sudah digunakan');
    }
    
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert(sale)
      .select()
      .single();

    if (saleError) {
      console.error('Sale creation error:', saleError);
      throw saleError;
    }

    console.log('Sale created successfully:', saleData);

    // Remove any non-database fields before inserting
    const salesDetails = details.map(detail => {
      const { product, ...validDetail } = detail as any;
      return {
        ...validDetail,
        sale_id: saleData.id
      };
    });

    console.log('Inserting sale details:', salesDetails);

    const { error: detailsError } = await supabase
      .from('sales_details')
      .insert(salesDetails);

    if (detailsError) {
      console.error('Sale details error:', detailsError);
      // If details insertion fails, we should delete the sale to maintain consistency
      await supabase.from('sales').delete().eq('id', saleData.id);
      throw detailsError;
    }

    console.log('Sale and details created successfully');
    return saleData;
  } catch (error) {
    console.error('Error in createSale:', error);
    throw error;
  }
}

export async function updateSaleStatus(id: number, status: Database['public']['Tables']['sales']['Row']['status']) {
  const { data, error } = await supabase
    .from('sales')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSale(id: number) {
  // Delete sale details first (will trigger stock restoration)
  const { error: detailsError } = await supabase
    .from('sales_details')
    .delete()
    .eq('sale_id', id);

  if (detailsError) throw detailsError;

  // Then delete the sale
  const { error: saleError } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (saleError) throw saleError;
}

// User roles functions
export async function getCurrentUserRole() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (error) throw error;
  return data?.role;
}

export async function getUserRoles() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateUserRole(userId: string, role: Database['public']['Tables']['user_roles']['Row']['role']) {
  const { data, error } = await supabase
    .from('user_roles')
    .update({ role })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Profile functions
export async function getCurrentUserProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(profile: Database['public']['Tables']['profiles']['Update']) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
