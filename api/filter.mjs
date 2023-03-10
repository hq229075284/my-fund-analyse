import { getChartData } from './fund-detail.mjs'
import { getFundList } from './bond-trade-fund.mjs';

(async function () {
  let list = await getFundList({
    customFilter(row) {
      return row['近1月(%)'] < 0
      && row['近1周(%)'] >= 0.02
      && row['手续费'] <= 0.1
      && row['日增长(%)'] >= 0
    },
  })
  if (!list.length) return

  const requestSeq = []

  list.forEach((row) => {
    requestSeq.push(getChartData(row['基金编码']))
  })

  let results = await Promise.all(requestSeq)

  results = results.filter((result) => result['近1年'].currentPercent < 50 && result['近1年'].currentPercent > 20).reduce((prev, result) => {
    prev[result.fundCode] = result
    return prev
  }, {})

  list = list.filter((row) => !!results[row['基金编码']]).sort((a, b) => results[a['基金编码']]['近1年'].currentPercent - results[b['基金编码']]['近1年'].currentPercent)

  console.table(list.map((row) => ({
    ...row,
    '近一年范围内，当前净值百分点': `${results[row['基金编码']]['近1年'].currentPercent}%`,
  })))
}())
