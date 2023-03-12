import { getChartData } from './fund-detail.mjs'
import { getFundList } from './bond-trade-fund.mjs'
import { transactionRateFilter } from './getTransactionRate.mjs'

export async function filter() {
  // 获取符合条件的基金列表
  let list = await getFundList({
    customFilter(row) {
      return row['近1月(%)'] < 0
      && row['近1周(%)'] >= 0.02
      && row['手续费'] <= 0.1
      && row['日增长(%)'] >= 0
    },
  })
  if (!list.length) return

  let requestSeq
  // 查询列表中每一个基金的详情
  requestSeq = []
  list.forEach((row) => {
    requestSeq.push(getChartData(row['基金编码']))
  })
  let fundDetails = await Promise.all(requestSeq)

  // 过滤出符合涨势条件的基金
  fundDetails = fundDetails
    .filter((result) => result['近1年'].currentPercent < 50 && result['近1年'].currentPercent > 20)
    .reduce((prev, result) => {
      prev[result.fundCode] = result
      return prev
    }, {})
  list = list.filter((row) => !!fundDetails[row['基金编码']])

  // 过滤出符合赎回费率条件的基金
  requestSeq = []
  list.forEach((row) => {
    requestSeq.push(
      transactionRateFilter(row['基金编码'], row['基金名称']),
    )
  })
  const isExpectedTransactionRate = await Promise.all(requestSeq)
  isExpectedTransactionRate.forEach((bool, i) => {
    if (!bool) list[i] = null
  })
  list = list.filter(Boolean)

  // 对筛选出的列表进行排序
  list.sort((a, b) => fundDetails[a['基金编码']]['近1年'].currentPercent - fundDetails[b['基金编码']]['近1年'].currentPercent)
    .map((row) => ({
      ...row,
      '近一年范围内，当前净值百分点': `${fundDetails[row['基金编码']]['近1年'].currentPercent}%`,
    }))

  return list
}
