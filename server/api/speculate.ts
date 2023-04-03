import { argv } from 'process'
import { getFundList, IFilterParams } from './fundList'
import {
  listFilter, transactionRateFilter,
} from '../config/process'
import log from '../utils/log'
import createExcel from '../utils/excel'
import { writeToMd } from '../utils/md'
import { getCachePath, getDateStamp, readDataFromFile } from '../utils/common'
import { createWriteCacheForRedeem, IRateAtRedemptionWithFrontEndAndLastTenTrend } from './transactionRate'
import { filterValuation } from './valuation'

export async function filter() {
  const startTime = Date.now()
  const excel = createExcel()

  const ft = (argv.slice(2)[0] || 'pg') as IFilterParams['requestParams']['ft']
  const stamp = getDateStamp()

  // 获取符合条件的基金列表
  let list = await getFundList({ requestParams: { ft } })
  if (!list.length) {
    log.info('基金列表初始无数据')
    return
  }

  const fundCodes = list.map((l) => l['基金编码'])

  list = list.filter(listFilter)

  log.info(`天天基金获取基金数据${list.length}条`)
  excel.addSheet({ sheetName: '天天基金', rows: list })

  // 过滤出符合赎回费率条件的基金
  let fundRateAtRedemptionList:IRateAtRedemptionWithFrontEndAndLastTenTrend[] = await readDataFromFile(
    '赎回数据',
    getCachePath(`${ft}赎回数据${stamp}`),
    createWriteCacheForRedeem(fundCodes),
  )
  list = list.filter((item) => {
    const rate = fundRateAtRedemptionList.find((rate) => rate.fundCode === item['基金编码'])
    if (!rate) return false
    return transactionRateFilter(rate)
  })
  if (!list.length) {
    log.info('符合赎回费率条件的基金列表无数据')
    excel.done()
    return
  }
  // @ts-ignore 释放内存
  fundRateAtRedemptionList = null
  log.info(`剩余赎回费率条件的基金数据${list.length}条`)
  excel.addSheet({ sheetName: '符合赎回费率条件的基金列表', rows: list })

  const valuations = await filterValuation(list.map((l) => l['基金编码']))

  list = list.filter((item) => !!valuations[item['基金编码']])

  if (!list.length) {
    log.info('符合估值条件的基金列表无数据')
    excel.done()
    return
  }

  log.table(list)

  excel.done()

  writeToMd(list)

  console.log(`用时：${(Date.now() - startTime) / 1000}s`)
  return list
}

// filter()
