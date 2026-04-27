const { MongoClient } = require('mongodb');

async function sync() {
  const prodUri = "mongodb+srv://cluivertmoukendi_db_user:UncYNZp90RvoSbZC@cluster0.cf74ocv.mongodb.net/congolese-students-china?retryWrites=true&w=majority";
  const localUri = "mongodb://127.0.0.1:27017/congolese_students";

  try {
    console.log('Connecting to Production...');
    const prodClient = await MongoClient.connect(prodUri);
    const prodDb = prodClient.db();

    console.log('Connecting to Local...');
    const localClient = await MongoClient.connect(localUri);
    const localDb = localClient.db();

    const collections = await prodDb.listCollections().toArray();
    for (let c of collections) {
      const colName = c.name;
      if (colName.startsWith('system.')) continue;
      
      console.log(`Syncing collection: ${colName}`);
      const docs = await prodDb.collection(colName).find({}).toArray();
      
      try {
        await localDb.collection(colName).deleteMany({});
      } catch (err) {
        console.error(`Error clearing ${colName}:`, err.message);
      }

      if (docs.length > 0) {
        try {
            await localDb.collection(colName).insertMany(docs);
            console.log(`Inserted ${docs.length} into ${colName}`);
        } catch (err) {
            console.error(`Error inserting into ${colName}:`, err.message);
        }
      } else {
        console.log(`Collection ${colName} is empty in production.`);
      }
    }

    console.log('Sync Complete!');
    prodClient.close();
    localClient.close();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

sync();
