const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env' });

async function verify() {
    const uri = process.env.MONGODB_URI;
    console.log(`🔍 Verifying connection to: ${uri.split('@')[1]}`); // Mask credentials

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected successfully to LIVE database!');

        const db = client.db();
        const patientsCount = await db.collection('patients').countDocuments();
        console.log(`📊 Patients collection document count: ${patientsCount}`);

        if (patientsCount > 0) {
            console.log('✨ Verification successful: Data is present on live!');
        } else {
            console.log('⚠️ Warning: Connected but patients collection is empty.');
        }
    } catch (error) {
        console.error('❌ Connection verification failed:', error);
    } finally {
        await client.close();
    }
}

verify();
