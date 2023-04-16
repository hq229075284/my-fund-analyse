/* eslint-disable camelcase */
/* eslint-disable no-continue */
import { type IRowOfFundList } from '@/api/tiantian/fundList'
import { type IFormattedFundDetail as tiantian_IFormattedFundDetail } from '@/api/tiantian/fundDetailFormatter'
import { type IFormattedFundDetail as zhaoshang_IFormattedFundDetail } from '@/api/zhaoshang/fundDetailFormatter'
import { type IValuationItem } from '@/api/zhaoshang/fundDetail'
import log from '@/utils/log'

export function listFilter(row:IRowOfFundList):boolean {
  return true
  // return row['近1周(%)'] >= 0
  // return row['近1月(%)'] > -0.3
  && row['近1周(%)'] < 2
  // && row['日增长(%)'] <= 0.2
  && !['一年', '两年', '三年', '五年', '3个月', '6个月', '9个月', '12个月', '18个月', '1年', '2年', '六个月', /* '港股', */ '港深', '沪深', 'FOF'/* , '医药', '医疗', '健康' */].find((key:string|RegExp) => {
    if (key instanceof RegExp) {
      return key.test(row['基金名称'])
    }
    return row['基金名称'].includes(key)
  })
  && row['日增长(%)'] !== 0
  && row['手续费'] === 0
  // && row['近1周(%)'] - row['日增长(%)'] >= 0.5
  // && row['近6月(%)'] < 0
}

export const tiantianFilter = {
  defaultFilter(detail:tiantian_IFormattedFundDetail):boolean {
    const condition1 = true
    // && !!detail.rankInfo['近1周']['前百分之'] && detail.rankInfo['近1周']['前百分之'] <= 5
    // && !!detail.rankInfo['近1月']['前百分之'] && detail.rankInfo['近1月']['前百分之'] <= 5
    // const condition1 = true

    // const condition2 = detail.tradeInfo.map((trade) => trade['行业名称']).includes('电子')
    const condition2 = true

    // const condition3 = +detail.baseInfo.RISKLEVEL <= 5
    const condition3 = true

    const condition4 = true
    && detail.baseInfo.maxAndMinInRange['近6月'].currentPercent <= 50
    && detail.baseInfo.maxAndMinInRange['近6月'].currentPercent > 20
    // && detail.baseInfo.maxAndMinInRange['近1年'].currentPercent <= 10
    // const condition4 = true

    const { lastTenTrend } = detail.baseInfo
    const condition5 = lastTenTrend.length > 0
    && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL > 0.3 && +JZZZL < Math.abs(+lastTenTrend.slice(-2, -1)[0].JZZZL))// 昨天涨
    // && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL < 0)// 昨天跌
    && lastTenTrend.slice(-2, -1).some(({ JZZZL }) => +JZZZL < -1)// 最近n天有跌
    // && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL < 0)// 最近连跌n天
    // && lastTenTrend.slice(-5).some(({ JZZZL }) => +JZZZL > 0)// 最近n天有涨过
    // const condition5 = true

    return condition1 && condition2 && condition3 && condition4 && condition5
  },
}

export const zhaoshangFilter = {
  defaultFilter(detail:zhaoshang_IFormattedFundDetail):boolean {
    const day = 7
    const ltRate = 0.5
    const targets = detail.transactionInfo
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
  },
  valuationFilter(valuation:IValuationItem[]) {
    // return valuation[0].y < 0
    return true
  },
}
