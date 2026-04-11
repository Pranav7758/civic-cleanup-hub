import { pool } from "./db";

async function main() {
  await pool.query(`
    insert into training_modules (title, description, icon, duration_minutes, lesson_count, sort_order, requires_previous) values
      ('Waste Segregation', 'Learn to separate dry, wet, and hazardous waste correctly at source', 'Trash2', 25, 5, 1, false),
      ('Composting Basics', 'Turn kitchen waste into nutrient-rich compost for your garden', 'Leaf', 20, 4, 2, true),
      ('Environmental Impact', 'Understand how waste affects our water, air, and soil', 'Droplets', 15, 3, 3, true),
      ('Hazardous Waste', 'Properly handle batteries, chemicals, and medical waste', 'AlertTriangle', 18, 4, 4, true),
      ('Platform Guide', 'Master all features: reporting, scrap selling, donations, and rewards', 'BookOpen', 12, 3, 5, true)
    on conflict do nothing
  `);
  await pool.query(`
    insert into scrap_prices (category, item_name, price_per_kg) values
      ('paper', 'Newspapers', 15),
      ('paper', 'Cardboard', 10),
      ('paper', 'Books/Magazines', 12),
      ('plastic', 'PET Bottles', 10),
      ('plastic', 'HDPE Containers', 15),
      ('plastic', 'Mixed Plastic', 8),
      ('metal', 'Iron/Steel', 25),
      ('metal', 'Aluminum Cans', 80),
      ('metal', 'Copper Wire', 450),
      ('ewaste', 'Old Laptop', 250),
      ('ewaste', 'Mobile Phone', 150),
      ('ewaste', 'Batteries', 50)
    on conflict do nothing
  `);
  await pool.query(`
    insert into redeem_items (title, points_cost, stock, image_emoji) values
      ('Steel Dustbin Set', 500, 23, '🗑️'),
      ('Compost Kit', 350, 15, '🌱'),
      ('Eco Tote Bag', 150, 50, '👜'),
      ('₹100 Grocery Coupon', 400, 8, '🎟️'),
      ('Tree Planting Certificate', 200, 99, '🌳'),
      ('Solar Lamp', 800, 5, '💡')
    on conflict do nothing
  `);
  await pool.end();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});