import { getFundList, IRowOfFundList } from './fundList'
import { getDetail, type IClassifiedFund } from './fundDetail'
import { getTransactionRate, IRateAtRedemptionWithFrontEnd } from './transactionRate'
import { listFilter, detailFilter, transactionRateFilter } from '../config/process'
import log from '../utils/log'

export async function filter() {
  // 获取符合条件的基金列表
  let list = await getFundList()

  if (!list.length) {
    log.info('基金列表初始无数据')
    return
  }
  log.info(`获取基金数据${list.length}条`)

  list = list.filter(listFilter)
  if (!list.length) {
    log.info('基金列表过滤后无数据')
    return
  }
  log.info(`列表过滤后剩余基金数据${list.length}条`)

  let requestSeq:Promise<IClassifiedFund|undefined>[] | Promise<IRateAtRedemptionWithFrontEnd>[] = [] as Promise<IClassifiedFund|undefined>[]

  // 查询列表中每一个基金的详情
  for (let i = 0; i < list.length; i += 1) {
    requestSeq.push(getDetail(list[i]['基金编码']))
  }
  const fundDetailMap = await Promise.all(requestSeq)
    .then((results) => results
      .filter<IClassifiedFund>((item):item is IClassifiedFund => Boolean(item))
      .filter(detailFilter)
      .reduce(
        (prev, result) => {
        // if (!result) return
          prev[result.fundCode] = result
          return prev
        },
        {} as {[key:string]:IClassifiedFund},
      ))
  // 过滤出符合涨势条件的基金
  list = list.filter((row) => !!fundDetailMap[row['基金编码']])
  if (!list.length) {
    log.info('符合涨势条件的基金列表无数据')
    return
  }
  log.info(`剩余符合涨势条件的基金数据${list.length}条`)

  // 过滤出符合赎回费率条件的基金
  requestSeq = [] as Promise<IRateAtRedemptionWithFrontEnd>[]
  for (let i = 0; i < list.length; i += 1) {
    requestSeq.push(getTransactionRate(list[i]['基金编码']))
  }
  const fundRateAtRedemptionList = await Promise.all(requestSeq)
  fundRateAtRedemptionList.forEach((rate, i) => {
    const isTrue = transactionRateFilter(rate)
    if (!isTrue) list[i] = null as any
  })
  list = list.filter(Boolean)
  if (!list.length) {
    log.info('符合赎回费率条件的基金列表无数据')
    return
  }
  log.info(`剩余赎回费率条件的基金数据${list.length}条`)

  // 对筛选出的列表进行排序
  list.sort((a, b) => fundDetailMap[a['基金编码']]['近1年'].currentPercent - fundDetailMap[b['基金编码']]['近1年'].currentPercent)
    .map((row) => ({
      ...row,
      '近一年范围内，当前净值百分点': `${fundDetailMap[row['基金编码']]['近1年'].currentPercent}%`,
    }))

  log.info('排序完成')
  log.table(list)

  return list
}

filter()
