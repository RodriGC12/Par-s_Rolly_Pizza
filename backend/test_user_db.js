import pool from './db.js';

const testDB = async () => {
    try {
      const exists = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='usuarios'");
      console.log(exists.rows);
    } catch(e) {
      console.error(e);
    } finally {
        process.exit();
    }
}
testDB();
