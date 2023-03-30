/* eslint-disable no-continue */
import { IRateAtRedemptionWithFrontEndAndLastTenTrend } from '../api/transactionRate'
import { type IClassifiedFund } from '../api/fundDetail'
import { type IRowOfFundList } from '../api/fundList'
import { IDescriptionOfFundRank } from '../api/fundRank'

// export type ICustomFilterOfFundList=(row:IRowOfFundList)=>boolean

export function listFilter(row:IRowOfFundList):boolean {
  return true
  // return row['近1周(%)'] >= 0
  // return row['近1月(%)'] > -0.3
  //   && row['近1周(%)'] >= 0.2
  // && row['日增长(%)'] <= 0.2
  // && row['日增长(%)'] < 0
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
  const trend = rateDescription.lastTenTrend.slice(5).reduce((prev, { y }) => prev + Math.min(0, y), 0)
  // const isDown = rateDescription.lastTenTrend.slice(-2).every(({ y }) => y < 0)
  if (trend > -5) return false

  const day = 7
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
