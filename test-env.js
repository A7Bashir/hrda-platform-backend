// Test script to verify environment variable setup
console.log('Testing environment variable setup...')

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log('✅ FIREBASE_SERVICE_ACCOUNT environment variable is set')
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    console.log('✅ Service account JSON is valid')
    console.log('Project ID:', serviceAccount.project_id)
  } catch (error) {
    console.log('❌ Error parsing service account JSON:', error.message)
  }
} else {
  console.log('❌ FIREBASE_SERVICE_ACCOUNT environment variable is NOT set')
  console.log('Available environment variables:')
  Object.keys(process.env).forEach(key => {
    if (key.includes('FIREBASE') || key.includes('SERVICE')) {
      console.log(`  ${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`)
    }
  })
}

console.log('Test complete.')
