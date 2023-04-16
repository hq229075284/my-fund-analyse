import schedule from 'node-schedule'
import { syncData } from '@/utils/pullData'
import { FundType } from '@/api/tiantian/fundList'
import log from '@/utils/log'
import dayjs from 'dayjs'

async function fetchAll() {
  const fundTypes:FundType[] = ['hh', 'gp', 'pg', 'zq']
  for (let i = 0; i < fundTypes.length; i += 1) {
    process.env.fundType = fundTypes[i]
    await syncData()
  }
}

log.info(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步开始`)
fetchAll()
log.info(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步结束`)

schedule.scheduleJob('0 0 2 * * *', async () => {
  log.info(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步开始`)
  await fetchAll()
  log.info(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步结束`)
})

process.on('SIGINT', () => {
  schedule.gracefulShutdown()
    .then(() => process.exit(0))
})
