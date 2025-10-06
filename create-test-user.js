// Simple script to create a test user directly in the database
const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')

// Use the same initialization as the main server
let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  serviceAccount = require('./serviceAccountKey.json')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'hrda-463712'
})

const db = admin.firestore()

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...')
    
    const usersCollection = db.collection('users')
    
    // Create admin user
    const adminPassword = await bcrypt.hash('A7sir123', 10)
    const adminUser = {
      username: 'admin',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      createdAt: new Date(),
      createdBy: 'system'
    }

    // Add user to Firestore
    const adminRef = await usersCollection.add(adminUser)
    console.log('✅ Admin user created with ID:', adminRef.id)
    
    // Create client user
    const clientPassword = await bcrypt.hash('AmeraAirport1324', 10)
    const clientUser = {
      username: 'user',
      password: clientPassword,
      name: 'Client User',
      role: 'operator',
      createdAt: new Date(),
      createdBy: 'system'
    }

    const clientRef = await usersCollection.add(clientUser)
    console.log('✅ Client user created with ID:', clientRef.id)
    
    console.log('🎉 Users created successfully!')
    console.log('🔐 Login Credentials:')
    console.log('   Admin: username="admin", password="A7sir123"')
    console.log('   Client: username="user", password="AmeraAirport1324"')

  } catch (error) {
    console.error('❌ Error creating users:', error)
  } finally {
    process.exit(0)
  }
}

createTestUser()
