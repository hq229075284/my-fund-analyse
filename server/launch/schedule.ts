import schedule from 'node-schedule'
import { syncData } from '@/utils/pullData'

syncData()
schedule.scheduleJob('0 0 2 * * *', async () => {
  await syncData()
})

process.on('SIGINT', () => {
  schedule.gracefulShutdown()
    .then(() => process.exit(0))
})
