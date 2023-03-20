import { argv } from 'process'
import { getFundList, IFilterParams } from './fundList'
// import { getFundList as getFundListForZhaoShang } from './fundListForZhaoShang'
import { createWriteCacheForDetail, type IClassifiedFund } from './fundDetail'
import {
  createWriteCacheForRedeem, IRateAtRedemptionWithFrontEnd,
} from './transactionRate'
import { listFilter, detailFilter, transactionRateFilter } from '../config/process'
import log from '../utils/log'
import createExcel from '../utils/excel'
import { createWriteCacheForRank, IDescriptionOfFundRank } from './fundRank'
import {
  getDateStamp, readDataFromFile, getCachePath,
} from '../utils/common'
import { writeToMd } from '../utils/md'

export async function filter() {
  const startTime = Date.now()
  const excel = createExcel()

  const ft = (argv.slice(2)[0] || 'hh') as IFilterParams['requestParams']['ft']
  const stamp = getDateStamp()

  // 获取符合条件的基金列表
  let list = await getFundList({ requestParams: { ft } })
  if (!list.length) {
    log.info('基金列表初始无数据')
    return
  }

  const fundCodes = list.map((l) => l['基金编码'])

  log.info(`天天基金获取基金数据${list.length}条`)
  excel.addSheet({ sheetName: '天天基金', rows: list })

  // // tlph 近1个月同类业绩排行榜前1/4
  // // const refList = await getFundListForZhaoShang({ requestParams: { tlph: '1' } })
  // const refList = await useCache(
  //   () => getFundListForZhaoShang(),
  //   {
  //     cacheName: `招商基金${getDateStamp()}`,
  //   },
  // )
  // log.info(`招商可购买基金数据${refList.length}条`)
  // excel.addSheet({ sheetName: '招商证券', rows: refList })

  // list = list.filter((item) => refList.find((ref) => ref['基金编码'] === item['基金编码']))
  // log.info(`根据招商数据，过滤天天基金数据，得出可购买的基金数据${refList.length}条`)

  // #region 排行数据
  let rankList:IDescriptionOfFundRank[] = await readDataFromFile(
    '排行数据',
    getCachePath(`${ft}排名数据${stamp}`),
    createWriteCacheForRank(fundCodes),
  )
  const topPercent = 25
  rankList = rankList.filter((rank) => rank.rankInfo['近1周']['前百分之'] < topPercent)
  log.info(`前${topPercent}%的基金有${rankList.length}条`)
  list = list.filter((item) => rankList.find((rank) => rank.fundCode === item['基金编码']))
  log.info(`前${topPercent}%可购买的基金数据${list.length}条`)
  excel.addSheet({ sheetName: `前${topPercent}%`, rows: list })
  // @ts-ignore 释放内存
  rankList = null
  // #regionend 排行数据

  list = list.filter(listFilter)
  if (!list.length) {
    log.info('基金列表过滤后无数据')
    excel.done()
    return
  }
  log.info(`列表过滤后剩余基金数据${list.length}条`)
  excel.addSheet({ sheetName: '过滤后基金列表', rows: list })

  // const requestSeq:Promise<IClassifiedFund|undefined>[] | Promise<IRateAtRedemptionWithFrontEnd>[] = [] as Promise<IClassifiedFund|undefined>[]

  // #region 基金详情数据
  // 查询列表中每一个基金的详情
  let fundDetailList:IClassifiedFund[] = await readDataFromFile(
    '详情数据',
    getCachePath(`${ft}详情数据${stamp}`),
    createWriteCacheForDetail(fundCodes),
  )
  let fundDetailMap = fundDetailList
    .filter<IClassifiedFund>((item):item is IClassifiedFund => Boolean(item))
    .filter(detailFilter)
    .reduce(
      (prev, result) => {
        // if (!result) return
        prev[result.fundCode] = result
        return prev
      },
      {} as {[key:string]:IClassifiedFund},
    )

  // 过滤出符合涨势条件的基金
  list = list.filter((row) => !!fundDetailMap[row['基金编码']])
  if (!list.length) {
    log.info('符合涨势条件的基金列表无数据')
    excel.done()
    return
  }
  log.info(`剩余符合涨势条件的基金数据${list.length}条`)
  excel.addSheet({ sheetName: '符合涨势条件的基金列表', rows: list })
  // 对筛选出的列表进行排序
  list.sort((a, b) => fundDetailMap[a['基金编码']]['近1年'].currentPercent - fundDetailMap[b['基金编码']]['近1年'].currentPercent)
    .map((row) => ({
      ...row,
      '近一年范围内，当前净值百分点': `${fundDetailMap[row['基金编码']]['近1年'].currentPercent}%`,
    }))
  // @ts-ignore 释放内存
  fundDetailMap = null
  // @ts-ignore 释放内存
  fundDetailList = null
  // #regionend 基金详情数据

  // 过滤出符合赎回费率条件的基金
  let fundRateAtRedemptionList:IRateAtRedemptionWithFrontEnd[] = await readDataFromFile(
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

  log.info('排序完成')
  excel.addSheet({ sheetName: '最终排序后的基金列表', rows: list })

  log.table(list)

  excel.done()

  writeToMd(list)

  console.log(`用时：${(Date.now() - startTime) / 1000}s`)
  return list
}

// filter()
