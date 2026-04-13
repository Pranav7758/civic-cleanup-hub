import "dotenv/config";
import pg from "pg";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;
const databaseUrl = process.env.SUPABASE_DATABASE_URL;

if (!databaseUrl) {
  console.error("SUPABASE_DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = "admin@ecoconnect.com";
  const password = "admin123";
  const fullName = "Super Admin";
  const hashedPassword = hashPassword(password);
  const userId = uuidv4();

  try {
    console.log("Adding admin user...");

    // Insert into app_users
    await pool.query(
      `INSERT INTO app_users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [userId, email, hashedPassword, fullName]
    );

    // Get the user ID (in case it already existed and we updated it)
    const { rows } = await pool.query("SELECT id FROM app_users WHERE email = $1", [email]);
    const finalUserId = rows[0].id;

    // Insert into profiles
    await pool.query(
      `INSERT INTO profiles (user_id, full_name) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
      [finalUserId, fullName]
    );

    // Insert into user_roles
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT (user_id, role) DO NOTHING`,
      [finalUserId, "admin"]
    );

    // Ensure reward points/score entry exists
    await pool.query(
       `INSERT INTO cleanliness_scores (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
       [finalUserId]
    );

    console.log("Admin account created/updated successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await pool.end();
  }
}

main();
