const app = require('./app');
const db = require('./db');
const seed = require('./seed');

if (db.prepare('SELECT COUNT(*) AS n FROM donors').get().n === 0) seed(db);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`SADA API berjalan di http://localhost:${PORT}`));
