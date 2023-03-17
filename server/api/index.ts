import path from 'node:path'
import dayjs from 'dayjs'
import { getFundList } from './fundList'
import { getFundList as getFundListForZhaoShang } from './fundListForZhaoShang'
import { getDetail, type IClassifiedFund } from './fundDetail'
import { getTransactionRate, IRateAtRedemptionWithFrontEnd } from './transactionRate'
import { listFilter, detailFilter, transactionRateFilter } from '../config/process'
import log from '../utils/log'
import createExcel from '../utils/excel'

export async function filter() {
  // const filePath = path.resolve(__dirname, `../xlsx/${dayjs().format('YYYY-MM-DD HH:mm:ss')}.xlsx`)

  const excel = createExcel()

  // 获取符合条件的基金列表
  let list = await getFundList()

  if (!list.length) {
    log.info('基金列表初始无数据')
    return
  }

  log.info(`天天基金获取基金数据${list.length}条`)
  excel.addSheet({ sheetName: '天天基金', rows: list })

  // tlph 近1个月同类业绩排行榜前1/4
  const refList = await getFundListForZhaoShang({ requestParams: { tlph: '1' } })
  log.info(`招商可购买基金数据${refList.length}条`)
  excel.addSheet({ sheetName: '招商证券', rows: refList })

  list = list.filter((item) => refList.find((ref) => ref['基金编码'] === item['基金编码']))
  log.info(`根据招商数据，过滤天天基金数据，得出可购买的基金数据${refList.length}条`)

  list = list.filter(listFilter)
  if (!list.length) {
    log.info('基金列表过滤后无数据')
    return
  }
  log.info(`列表过滤后剩余基金数据${list.length}条`)
  excel.addSheet({ sheetName: '过滤后基金列表', rows: list })

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
  excel.addSheet({ sheetName: '符合涨势条件的基金列表', rows: list })

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
  excel.addSheet({ sheetName: '符合赎回费率条件的基金列表', rows: list })

  // 对筛选出的列表进行排序
  list.sort((a, b) => fundDetailMap[a['基金编码']]['近1年'].currentPercent - fundDetailMap[b['基金编码']]['近1年'].currentPercent)
    .map((row) => ({
      ...row,
      '近一年范围内，当前净值百分点': `${fundDetailMap[row['基金编码']]['近1年'].currentPercent}%`,
    }))

  log.info('排序完成')
  excel.addSheet({ sheetName: '最终排序后的基金列表', rows: list })

  log.table(list)

  excel.done()

  return list
}

// filter()
