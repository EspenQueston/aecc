/**
 * Export script — runs on production VPS where Atlas TLS works fine.
 * Outputs all collections as a single EJSON object to stdout.
 * EJSON preserves MongoDB BSON types (ObjectId, Date, etc.) so the local import
 * can restore them faithfully.
 * Usage: node export-prod.js > dump.json
 */
const { MongoClient, BSON: { EJSON } } = require('mongodb');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGO_URI;
if (!uri) { process.stderr.write('ERROR: MONGO_URI not set\n'); process.exit(1); }

async function main() {
  const client = await MongoClient.connect(uri);
  const db = client.db();
  const cols = await db.listCollections().toArray();
  const dump = {};

  for (const c of cols) {
    if (c.name.startsWith('system.')) continue;
    dump[c.name] = await db.collection(c.name).find({}).toArray();
    process.stderr.write(`Exported ${dump[c.name].length} docs from ${c.name}\n`);
  }

  // EJSON.stringify preserves ObjectId, Date and other BSON types
  process.stdout.write(EJSON.stringify(dump));
  await client.close();
}

main().catch(e => { process.stderr.write('FATAL: ' + e.message + '\n'); process.exit(1); });
