// Shared updates store for the HRDA platform
let updatesStore = []

module.exports = {
  getUpdatesStore: () => updatesStore,
  addUpdate: (update) => {
    updatesStore.push(update)
    console.log('📝 Update added to store:', update.id)
    console.log('📊 Total updates:', updatesStore.length)
  },
  getUpdatesForRobot: (robotId) => {
    return updatesStore.filter(update => 
      update.targetRobots.includes(robotId) && update.status === 'pending'
    )
  },
  markUpdateAsProcessed: (updateId) => {
    const update = updatesStore.find(u => u.id === updateId)
    if (update) {
      update.status = 'processed'
      update.processedAt = new Date().toISOString()
      console.log('✅ Update marked as processed:', updateId)
    }
  }
}
