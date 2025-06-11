
-- Create marketplace_suppliers table
CREATE TABLE public.marketplace_suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'marketplace', -- 'marketplace' or 'supplier'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create supplier_accounts table
CREATE TABLE public.supplier_accounts (
  id BIGSERIAL PRIMARY KEY,
  marketplace_supplier_id BIGINT NOT NULL REFERENCES public.marketplace_suppliers(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(marketplace_supplier_id, account_name)
);

-- Create product_categories table
CREATE TABLE public.product_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert marketplace/supplier data
INSERT INTO public.marketplace_suppliers (name, type) VALUES
('Shopee', 'marketplace'),
('Tokopedia', 'marketplace'),
('Lazada', 'marketplace'),
('Tiktok', 'marketplace'),
('PT Lamcos Mitra Jaya', 'supplier'),
('PT Distributor Indonesia', 'supplier');

-- Insert account data
INSERT INTO public.supplier_accounts (marketplace_supplier_id, account_name) 
SELECT ms.id, account_name FROM public.marketplace_suppliers ms, 
(VALUES 
  ('Shopee', 'putraarizona'),
  ('Shopee', 'tod.y'),
  ('Shopee', 'Erta'),
  ('Shopee', 'idaroyani'),
  ('Tokopedia', 'putraarizona'),
  ('Tokopedia', 'tod.y_officialshop'),
  ('Tokopedia', 'idaroyani'),
  ('Lazada', 'putraarizona'),
  ('Lazada', 'dartiwagati'),
  ('Tiktok', 'putraarzn'),
  ('Tiktok', 'royanicakeit'),
  ('Tiktok', 'cakeittty'),
  ('Tiktok', 'dartiwagati')
) AS accounts(marketplace_name, account_name)
WHERE ms.name = accounts.marketplace_name;

-- Insert some default product categories
INSERT INTO public.product_categories (name, description) VALUES
('Baby Care', 'Produk perawatan bayi'),
('Feeding', 'Produk makanan dan minuman bayi'),
('Clothing', 'Pakaian bayi dan anak'),
('Toys', 'Mainan anak'),
('Health', 'Produk kesehatan'),
('Others', 'Kategori lainnya');

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_suppliers_updated_at BEFORE UPDATE ON public.marketplace_suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplier_accounts_updated_at BEFORE UPDATE ON public.supplier_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
