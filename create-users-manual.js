const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')

// Initialize Firebase Admin SDK
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

async function createUsers() {
  try {
    console.log('🚀 Creating users in Firestore...')
    
    const usersCollection = db.collection('users')
    
    // Check if users already exist
    const existingUsers = await usersCollection.limit(1).get()
    if (!existingUsers.empty) {
      console.log('⚠️  Users already exist. Count:', existingUsers.size)
      return
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('A7sir123', 10)
    const adminUser = {
      username: 'admin',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    }

    // Create client user
    const clientPassword = await bcrypt.hash('AmeraAirport1324', 10)
    const clientUser = {
      username: 'user',
      password: clientPassword,
      name: 'Client User',
      role: 'operator',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    }

    // Add users to Firestore
    const adminRef = await usersCollection.add(adminUser)
    const clientRef = await usersCollection.add(clientUser)

    console.log('✅ Users created successfully!')
    console.log('📋 Admin user ID:', adminRef.id)
    console.log('📋 Client user ID:', clientRef.id)
    console.log('')
    console.log('🔐 Login Credentials:')
    console.log('   Admin: username="admin", password="A7sir123"')
    console.log('   Client: username="user", password="AmeraAirport1324"')

  } catch (error) {
    console.error('❌ Error creating users:', error)
  } finally {
    process.exit(0)
  }
}

createUsers()
