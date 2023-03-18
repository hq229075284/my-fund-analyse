/* eslint-disable no-continue */
import { IRateAtRedemptionWithFrontEnd } from '../api/transactionRate'
import { type IClassifiedFund } from '../api/fundDetail'
import { type IRowOfFundList } from '../api/fundList'

// export type ICustomFilterOfFundList=(row:IRowOfFundList)=>boolean

export function listFilter(row:IRowOfFundList):boolean {
  return row['近1月(%)'] > -0.2
    && row['近1月(%)'] < 1
    && row['近1周(%)'] > 0
    // && row['近1月(%)'] - row['近1周(%)'] >= 0.5
    // && row['近6月(%)'] < 0
}

export function detailFilter(result:IClassifiedFund):boolean {
  return result['近1年'].currentPercent < 50 && result['近1年'].currentPercent > 0
  // return true
}

export function transactionRateFilter(rateDescription:IRateAtRedemptionWithFrontEnd):boolean {
  const day = 60
  const ltRate = 0.08
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
