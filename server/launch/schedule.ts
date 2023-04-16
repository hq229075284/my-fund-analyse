import schedule from 'node-schedule'
import { syncData } from '@/utils/pullData'
import { FundType } from '@/api/tiantian/fundList'
import log from '@/utils/log'
import dayjs from 'dayjs'

async function fetchAll() {
  const fundTypes:FundType[] = ['hh', 'gp', 'pg', 'zq']
  log.debug(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步开始`)
  for (let i = 0; i < fundTypes.length; i += 1) {
    process.env.fundType = fundTypes[i]
    await syncData()
  }
  log.debug(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步结束`)
}

fetchAll()

schedule.scheduleJob('0 0 2 * * *', fetchAll)

process.on('SIGINT', () => {
  schedule.gracefulShutdown()
    .then(() => process.exit(0))
})
