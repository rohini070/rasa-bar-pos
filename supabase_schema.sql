-- ─── MENU ITEMS TABLE ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- juice / shake / food / icecream / tiffin
  ingredients TEXT, -- optional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── RAW MATERIALS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS raw_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL, -- kg / litre / pieces / ml
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── INVENTORY STOCK TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(material_id)
);

-- ─── ITEM RECIPE TABLE (Links menu items to raw materials) ───────────────────────
CREATE TABLE IF NOT EXISTS item_recipe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  material_id UUID REFERENCES raw_materials(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL, -- amount of raw material needed per item
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, material_id)
);

-- ─── LOANS TABLE ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lender TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── LOAN PAYMENTS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loan_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── CUSTOMER CREDIT TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers_credit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── CUSTOMER CREDIT ITEMS TABLE ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customer_credit_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers_credit(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── CREDIT / PENDING PAYMENTS TABLE (DEPRECATED - Will be removed) ─────────────
CREATE TABLE IF NOT EXISTS credit_pending_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  sale_id UUID, -- Optional reference to original sale if exists
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending / paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- ─── INVESTMENTS TABLE ─────────────────────────────────────────────────────────────
-- Drop existing table to recreate with correct schema
DROP TABLE IF EXISTS investments CASCADE;

CREATE TABLE investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── EXPENSE CATEGORIES UPDATE ────────────────────────────────────────────────────
-- Add category column to expenses table if it doesn't exist
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';

-- ─── INDEXES FOR PERFORMANCE ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(type);
CREATE INDEX IF NOT EXISTS idx_raw_materials_name ON raw_materials(name);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_material ON inventory_stock(material_id);
CREATE INDEX IF NOT EXISTS idx_item_recipe_menu_item ON item_recipe(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_recipe_material ON item_recipe(material_id);

-- ─── TRIGGER FOR UPDATED_AT ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON raw_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
