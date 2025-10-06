const admin = require('firebase-admin')
const bcrypt = require('bcryptjs')

// Initialize Firebase Admin SDK
let serviceAccount
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Use environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  // Development: Use local file
  serviceAccount = require('./serviceAccountKey.json')
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'hrda-463712'
})

const db = admin.firestore()
const usersCollection = db.collection('users')

async function initProductionUsers() {
  try {
    console.log('🚀 Initializing production users...')

    // Check if users already exist
    const existingUsers = await usersCollection.limit(1).get()
    if (!existingUsers.empty) {
      console.log('⚠️  Users already exist. Skipping initialization.')
      return
    }

    // Default admin user
    const adminPassword = await bcrypt.hash('A7sir123', 10)
    const adminUser = {
      username: 'admin',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    }

    // Default client user
    const clientPassword = await bcrypt.hash('AmeraAirport1324', 10)
    const clientUser = {
      username: 'user',
      password: clientPassword,
      name: 'Client User',
      role: 'operator',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system'
    }

    // Create users
    await usersCollection.add(adminUser)
    await usersCollection.add(clientUser)

    console.log('✅ Production users created successfully!')
    console.log('📋 Login Credentials:')
    console.log('   Admin: username="admin", password="A7sir123"')
    console.log('   Client: username="user", password="AmeraAirport1324"')
    console.log('')
    console.log('🔐 Please change these passwords after first login!')

  } catch (error) {
    console.error('❌ Error initializing users:', error)
  } finally {
    process.exit(0)
  }
}

initProductionUsers()
