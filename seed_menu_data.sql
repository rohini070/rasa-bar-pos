-- ─── ADD UNIQUE CONSTRAINT TO PREVENT DUPLICATES ───────────────────────────────────
-- First remove any existing duplicates
DELETE FROM menu_items WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY id) as row_num
    FROM menu_items
  ) t WHERE row_num > 1
);

-- Add unique constraint on (name, category)
ALTER TABLE menu_items ADD CONSTRAINT unique_menu_item UNIQUE (name, category);

-- ─── SEED MENU ITEMS DATA ──────────────────────────────────────────────────────────
-- Basic Juices
INSERT INTO menu_items (name, category, price, available) VALUES
('Orange Juice', 'Basic Juices', 139, true),
('Mosambi Juice', 'Basic Juices', 79, true),
('Watermelon Juice', 'Basic Juices', 49, true),
('Pineapple Juice', 'Basic Juices', 69, true),
('Apple Juice', 'Basic Juices', 89, true),
('Cucumber Juice', 'Basic Juices', 39, true),
('Carrot Juice', 'Basic Juices', 59, true),
('Grape Juice', 'Basic Juices', 89, true),
('Muskmelon Juice', 'Basic Juices', 59, true)
ON CONFLICT (name, category) DO NOTHING;

-- Cold Pressed Juices
INSERT INTO menu_items (name, category, price, available) VALUES
('ABC Boost', 'Cold Pressed Juices', 79, true),
('Green Flush', 'Cold Pressed Juices', 49, true),
('Citrus Cleanse', 'Cold Pressed Juices', 80, true),
('Immunity Shot', 'Cold Pressed Juices', 69, true),
('Iron Lift', 'Cold Pressed Juices', 79, true),
('Skin Glow', 'Cold Pressed Juices', 69, true),
('Grape Vitality', 'Cold Pressed Juices', 89, true),
('Pineapple Punch', 'Cold Pressed Juices', 79, true),
('Energy Charger', 'Cold Pressed Juices', 80, true),
('Make Your Own Juice', 'Cold Pressed Juices', 99, true),
('Pomegranate Juice', 'Cold Pressed Juices', 99, true)
ON CONFLICT (name, category) DO NOTHING;

-- Beverages
INSERT INTO menu_items (name, category, price, available) VALUES
('Chai', 'Beverages', 15, true),
('Coffee', 'Beverages', 20, true),
('Black Coffee', 'Beverages', 20, true)
ON CONFLICT (name, category) DO NOTHING;

-- Shakes
INSERT INTO menu_items (name, category, price, available) VALUES
('Mango Shake', 'Shakes', 80, true),
('Banana Shake', 'Shakes', 80, true),
('Vanilla Shake', 'Shakes', 80, true),
('Sharjah Shake', 'Shakes', 80, true),
('Chocolate Shake', 'Shakes', 90, true),
('KitKat Shake', 'Shakes', 90, true),
('Oreo Shake', 'Shakes', 90, true),
('Strawberry Shake', 'Shakes', 90, true),
('Chikoo Shake', 'Shakes', 90, true),
('Strawberry Oreo Shake', 'Shakes', 120, true),
('Coconut Vanilla Milkshake', 'Shakes', 120, true),
('Blueberry Shake', 'Shakes', 120, true),
('Blackcurrant Shake', 'Shakes', 120, true),
('Banana Peanut Butter', 'Shakes', 140, true),
('Nutella Shake', 'Shakes', 160, true)
ON CONFLICT (name, category) DO NOTHING;

-- Ice Cream Scoops
INSERT INTO menu_items (name, category, price, available) VALUES
('Vanilla', 'Ice Cream Scoops', 30, true),
('Chocolate', 'Ice Cream Scoops', 40, true),
('Strawberry', 'Ice Cream Scoops', 45, true),
('Mango', 'Ice Cream Scoops', 45, true),
('Pineapple', 'Ice Cream Scoops', 50, true),
('Cookies & Cream', 'Ice Cream Scoops', 50, true),
('Blackcurrant', 'Ice Cream Scoops', 50, true),
('Tender Coconut', 'Ice Cream Scoops', 50, true)
ON CONFLICT (name, category) DO NOTHING;

-- Snacks
INSERT INTO menu_items (name, category, price, available) VALUES
('French Fries (Small)', 'Snacks', 60, true),
('French Fries (Large)', 'Snacks', 80, true),
('Peri Peri Fries (Small)', 'Snacks', 70, true),
('Peri Peri Fries (Large)', 'Snacks', 90, true),
('Cheesy Fries (Small)', 'Snacks', 80, true),
('Cheesy Fries (Large)', 'Snacks', 100, true),
('Cheesy Chicken Fries', 'Snacks', 120, true),
('Veg Nuggets', 'Snacks', 99, true),
('Veg Fingers', 'Snacks', 99, true),
('Jalapeño Poppers', 'Snacks', 129, true)
ON CONFLICT (name, category) DO NOTHING;

-- Food
INSERT INTO menu_items (name, category, price, available) VALUES
('Chicken Fingers', 'Food', 120, true),
('Chicken Wings', 'Food', 150, true),
('Nuggets', 'Food', 100, true),
('Maggi Veg', 'Food', 50, true),
('Maggi Chicken', 'Food', 70, true),
('Pasta Veg', 'Food', 90, true),
('Pasta Non-Veg', 'Food', 120, true)
ON CONFLICT (name, category) DO NOTHING;

-- Momos
INSERT INTO menu_items (name, category, price, available) VALUES
('Veg Momos', 'Momos', 80, true),
('Chicken Momos', 'Momos', 100, true),
('Fried Veg Momos', 'Momos', 90, true),
('Fried Chicken Momos', 'Momos', 110, true),
('Kurkure Veg Momos', 'Momos', 100, true),
('Kurkure Chicken Momos', 'Momos', 120, true)
ON CONFLICT (name, category) DO NOTHING;

-- Tiffin
INSERT INTO menu_items (name, category, price, available) VALUES
('Ragi Idli', 'Tiffin', 40, true),
('Millet Khichdi (Half)', 'Tiffin', 45, true),
('Millet Khichdi (Full)', 'Tiffin', 90, true),
('Plain Dosa', 'Tiffin', 40, true),
('Onion Dosa', 'Tiffin', 45, true),
('Egg Dosa', 'Tiffin', 55, true),
('Fruit Bowl (Large)', 'Tiffin', 60, true),
('Fruit Bowl (Small)', 'Tiffin', 35, true)
ON CONFLICT (name, category) DO NOTHING;

-- ─── NOTE: raw_materials and inventory_stock sections removed as tables don't exist
-- These can be added later if inventory management is needed
