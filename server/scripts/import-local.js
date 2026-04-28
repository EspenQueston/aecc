/**
 * Import script — reads dump.json (from export-prod.js) and inserts into local MongoDB.
 * Supports both plain JSON (legacy) and EJSON format (preserves ObjectId, Date types).
 * Usage: node import-local.js dump.json
 */
const { MongoClient, BSON: { EJSON } } = require('mongodb');
const fs = require('fs');

const localUri = 'mongodb://127.0.0.1:27017/congolese_students_dev';
const dumpFile = process.argv[2];

if (!dumpFile || !fs.existsSync(dumpFile)) {
  console.error('Usage: node import-local.js <dump.json>');
  process.exit(1);
}

async function main() {
  console.log('Connecting to local MongoDB...');
  const client = await MongoClient.connect(localUri);
  const db = client.db();

  const raw = fs.readFileSync(dumpFile, 'utf8');
  // EJSON.parse restores ObjectId, Date etc. from Extended JSON format
  // Falls back gracefully to plain JSON if EJSON.parse fails
  let dump;
  try {
    dump = EJSON.parse(raw);
    console.log('Parsed dump using EJSON (types preserved).');
  } catch {
    dump = JSON.parse(raw);
    console.warn('EJSON parse failed, falling back to plain JSON (ObjectId types may be lost).');
  }

  for (const [colName, docs] of Object.entries(dump)) {
    console.log(`Importing ${docs.length} docs into ${colName}...`);
    await db.collection(colName).deleteMany({});
    if (docs.length > 0) {
      await db.collection(colName).insertMany(docs, { ordered: false });
    }
  }

  console.log('Import complete!');
  await client.close();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
