import pool from './db.js';

const test = async () => {
  try {
    const res = await pool.query('SELECT * FROM detalleorden LIMIT 1');
    console.log(res.rows);
  } catch (err) {
    console.error("Detalleorden ERROR:", err.message);
  }

  try {
    // Check if triggers exist
    const res = await pool.query(`SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'detalleorden' OR event_object_table = 'orden';`);
    console.log("TRIGGERS:", res.rows);
  } catch(err) {}

  process.exit(0);
};

test();
