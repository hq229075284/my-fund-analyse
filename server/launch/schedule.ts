import schedule from 'node-schedule'
// import { syncData } from '@/utils/pullData'
import { FundType } from '@/api/tiantian/fundList'
import log from '@/utils/log'
import dayjs from 'dayjs'
import { exec } from 'node:child_process'
import { FundTypeEnum } from '@/config/enum'

function createChildProcess() {
  return new Promise((resolve) => {
    exec('npm run pull:prod', (err) => {
      if (err) {
        log.error(err?.message)
      }
      resolve('')
    })
  })
}

async function fetchAll() {
  const fundTypes:FundType[] = ['hh', 'gp', 'pg', 'zq']
  log.debug(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步开始`)
  for (let i = 0; i < fundTypes.length; i += 1) {
    process.env.fundType = fundTypes[i]
    log.info(`关于${FundTypeEnum[process.env.fundType]}的程序开始执行`)
    await createChildProcess()
  }
  log.debug(`【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】schedule同步结束`)
}

fetchAll()

schedule.scheduleJob('0 0 2 * * *', fetchAll)

process.on('SIGINT', () => {
  schedule.gracefulShutdown()
    .then(() => process.exit(0))
})
