import { getFundList, IFilterParams } from '../api/fundList'
import { getRankByGroup } from '../api/fundRank'
import { getDetails } from '../api/fundDetail'
import { patchTransactionRateWithTry } from '../api/transactionRate'
import log from './log'
import { useCache, getDateStamp } from './common'

async function run() {
  const startTime = Date.now()
  const ft = (process.argv.slice(2)[0] || 'zq') as IFilterParams['requestParams']['ft']

  // 获取符合条件的基金列表
  const list = await getFundList({ requestParams: { ft } })

  if (!list.length) {
    log.info('基金列表初始无数据')
    process.exit(1)
  }

  log.info(`天天基金获取基金数据${list.length}条`)

  log.info('开始获取排名数据')
  await useCache(
    () => getRankByGroup(list.map((l) => l['基金编码'])),
    {
      cacheName: `${ft}排名数据${getDateStamp()}`,
    },
  )

  log.info('开始获取基金详情数据')
  await useCache(
    () => getDetails(list.map((l) => l['基金编码'])),
    {
      cacheName: `${ft}基金详情数据${getDateStamp()}`,
    },
  )

  log.info('开始获取赎回数据')
  await useCache(
    () => patchTransactionRateWithTry(list.map((l) => l['基金编码'])),
    {
      cacheName: `${ft}赎回数据${getDateStamp()}`,
    },
  )

  log.info(`耗时${(Date.now() - startTime) / 1000}s`)
}

run()
