const { MongoClient } = require('mongodb');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/healthcare';
const LIVE_URI = 'mongodb+srv://f2fintech-hrms:f2fintech-hrms@f2fintech-hrms.1exq3rs.mongodb.net/';
const DB_NAME = 'healthcare'; // or whatever the local DB name is

async function migrate() {
    console.log('🚀 Starting migration...');

    const localClient = new MongoClient(LOCAL_URI);
    const liveClient = new MongoClient(LIVE_URI);

    try {
        await localClient.connect();
        console.log('✅ Connected to LOCAL database');

        await liveClient.connect();
        console.log('✅ Connected to LIVE database');

        const localDb = localClient.db();
        const liveDb = liveClient.db(DB_NAME);

        const collections = await localDb.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections to migrate`);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`🔄 Migrating collection: ${collectionName}...`);

            const documents = await localDb.collection(collectionName).find({}).toArray();
            console.log(`   - Found ${documents.length} documents`);

            if (documents.length > 0) {
                // Clear live collection first (optional, but safer for a clean migration)
                // await liveDb.collection(collectionName).deleteMany({});

                // Insert documents into live
                const result = await liveDb.collection(collectionName).insertMany(documents);
                console.log(`   - Successfully migrated ${result.insertedCount} documents`);
            } else {
                console.log(`   - Skipping empty collection`);
            }
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await localClient.close();
        await liveClient.close();
    }
}

migrate();
