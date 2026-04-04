/**
 * Migrate local MongoDB data to MongoDB Atlas
 * Usage: node server/scripts/migrate-to-atlas.js
 */
const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/congolese-students-china';
const ATLAS_URI = process.env.ATLAS_URI || 'mongodb+srv://cluivertmoukendi_db_user:UncYNZp90RvoSbZC@cluster0.cf74ocv.mongodb.net/congolese-students-china?retryWrites=true&w=majority';

// Collections to skip (system collections)
const SKIP = ['system.version'];

async function migrate() {
  console.log('Connecting to local MongoDB...');
  const localClient = new MongoClient(LOCAL_URI);
  await localClient.connect();
  const localDb = localClient.db();

  console.log('Connecting to Atlas...');
  const atlasClient = new MongoClient(ATLAS_URI);
  await atlasClient.connect();
  const atlasDb = atlasClient.db();

  const collections = await localDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections to migrate\n`);

  for (const col of collections) {
    if (SKIP.includes(col.name)) continue;

    const localCol = localDb.collection(col.name);
    const atlasCol = atlasDb.collection(col.name);
    const count = await localCol.countDocuments();

    if (count === 0) {
      console.log(`  [SKIP] ${col.name} (empty)`);
      continue;
    }

    // Check if Atlas collection already has data
    const atlasCount = await atlasCol.countDocuments();
    if (atlasCount > 0) {
      console.log(`  [SKIP] ${col.name} (${atlasCount} docs already in Atlas)`);
      continue;
    }

    const docs = await localCol.find({}).toArray();
    await atlasCol.insertMany(docs);
    console.log(`  [OK]   ${col.name}: ${count} documents migrated`);
  }

  // Also recreate indexes
  console.log('\nMigrating indexes...');
  for (const col of collections) {
    if (SKIP.includes(col.name)) continue;
    const localCol = localDb.collection(col.name);
    const atlasCol = atlasDb.collection(col.name);
    const indexes = await localCol.indexes();

    for (const idx of indexes) {
      if (idx.name === '_id_') continue; // Skip default _id index
      try {
        const { key, ...opts } = idx;
        delete opts.v;
        delete opts.ns;
        await atlasCol.createIndex(key, opts);
        console.log(`  [IDX]  ${col.name}.${idx.name}`);
      } catch (e) {
        console.log(`  [WARN] ${col.name}.${idx.name}: ${e.message}`);
      }
    }
  }

  await localClient.close();
  await atlasClient.close();
  console.log('\nMigration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
