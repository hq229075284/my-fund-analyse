/* eslint-disable no-continue */
import { IRateAtRedemptionWithFrontEndAndLastTenTrend } from '../api/transactionRate'
import { type IClassifiedFund } from '../api/fundDetail'
import { type IRowOfFundList } from '../api/fundList'
import { IDescriptionOfFundRank } from '../api/fundRank'
import { IValuation, IValuationItem } from '../api/valuation'

// export type ICustomFilterOfFundList=(row:IRowOfFundList)=>boolean

export function listFilter(row:IRowOfFundList):boolean {
  return true
  // return row['近1周(%)'] >= 0
  // return row['近1月(%)'] > -0.3
  //   && row['近1周(%)'] >= 0.2
  // && row['日增长(%)'] <= 0.2
  && !['一年', '两年', '三年', '五年', '3个月', '6个月', '六个月', '港股', '港深', 'FOF', '医药', '医疗', '健康'].find((key:string|RegExp) => {
    if (key instanceof RegExp) {
      return key.test(row['基金名称'])
    }
    return row['基金名称'].includes(key)
  })
  && row['日增长(%)'] !== 0
  // && row['近1周(%)'] - row['日增长(%)'] >= 0.5
  // && row['近6月(%)'] < 0
}

export function detailFilter(result:IClassifiedFund):boolean {
  // return result['近1年'].currentPercent <= 50
  // && result['近1年'].currentPercent > 0
  // && result['近3月'].currentPercent > 0
  // && result['近3月'].currentPercent <= 90
  return true
}

export function transactionRateFilter(rateDescription:IRateAtRedemptionWithFrontEndAndLastTenTrend):boolean {
  const trend = rateDescription.lastTenTrend.slice(9).reduce((prev, { y }) => prev + Math.min(0, y), 0)
  const isDown = rateDescription.lastTenTrend.slice(-1).every(({ y }) => y < 0) && rateDescription.lastTenTrend.slice(5).some(({ y }) => y > 0)
  if (!(isDown && trend <= -1)) return false

  const day = 30
  const ltRate = 0.5
  const targets = rateDescription['前端赎回费率']
  for (let i = 0; i < targets.length; i += 1) {
    const { range, rate } = targets[i]
    if (Number(rate.replace('%', '')) <= ltRate) {
      if (range.ge != null && day < range.ge) {
        continue
      }
      if (range.gt != null && day <= range.gt) {
        continue
      }
      if (range.lt != null && day >= range.lt) {
        continue
      }
      return true
    }
  }

  return false
}

export function rankFilter(rank:IDescriptionOfFundRank) {
  return true
  // return rank.rankInfo['近1月']['前百分之'] <= 10 && rank.rankInfo['近1月']['前百分之'] >= 0
}

export function valuationFilter(valuation:IValuationItem[]) {
  return valuation[0].y < 0
}
