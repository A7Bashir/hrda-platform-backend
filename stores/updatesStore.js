// Shared updates store for the HRDA platform
let updatesStore = []

module.exports = {
  getUpdatesStore: () => updatesStore,
  addUpdate: (update) => {
  updatesStore.push(update)
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
    }
  }
}
