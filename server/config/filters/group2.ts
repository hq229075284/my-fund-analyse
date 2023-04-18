/* eslint-disable camelcase */
/* eslint-disable no-continue */
import { categories, type IFormattedFundDetail as tiantian_IFormattedFundDetail } from '@/api/tiantian/fundDetailFormatter'
import { type IFormattedFundDetail as zhaoshang_IFormattedFundDetail } from '@/api/zhaoshang/fundDetailFormatter'
import { type IValuationItem } from '@/api/zhaoshang/fundDetail'
import { isInRedeemRange } from './common'
// import log from '@/utils/log'

export function tiantianFilter(detail:tiantian_IFormattedFundDetail):boolean {
  // 排名过滤器
  const name:categories = '近1周'
  const condition1 = true
  // && detail.rankInfo[name]['排名'] <= 150
  // && detail.rankInfo[name]['总数'] >= 1000
  // && detail.rankInfo[name]['涨跌幅'] > 0.2
  // && detail.rankInfo['近1月']['涨跌幅'] > 1
  // && !!detail.rankInfo['近1月']['前百分之'] && detail.rankInfo['近1月']['前百分之'] <= 5

  // 行业过滤器
  const condition2 = true
  // && detail.tradeInfo.map((trade) => trade['行业名称']).includes('电子')

  // 风险情况过滤器
  const condition3 = true
  // && +detail.baseInfo.RISKLEVEL <= 5

  // 形势过滤器
  const condition4 = true
  && detail.baseInfo.maxAndMinInRange['近1年'].currentPercent <= 50
  // && detail.baseInfo.maxAndMinInRange['近1年'].currentPercent <= 90
  // && detail.baseInfo.maxAndMinInRange['近1年'].currentPercent > 0
  // && detail.baseInfo.maxAndMinInRange['近1年'].currentPercent <= 10
  // const condition4 = true

  // 近期涨跌过滤器
  const { lastTenTrend } = detail.baseInfo
  const condition5 = lastTenTrend.length > 0
  // && lastTenTrend.reduce((prev, { JZZZL }) => (+JZZZL < 0
  //   ? prev + (+JZZZL < -0.1 ? 2 : 1)
  //   : prev
  // ), 0) <= 3
  // && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL > 0.3 && +JZZZL < Math.abs(+lastTenTrend.slice(-2, -1)[0].JZZZL))// 昨天涨
  && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL > 0.5)// 昨天涨
  // && lastTenTrend.slice(-1).every(({ JZZZL }) => +JZZZL < 0)// 昨天跌
  // && lastTenTrend.slice(-2, -1).some(({ JZZZL }) => +JZZZL < -1)// 最近n天有跌
  && lastTenTrend.slice(-3, -1).every(({ JZZZL }) => +JZZZL < 0)// 最近连跌n天
  // && lastTenTrend.slice(-5).some(({ JZZZL }) => +JZZZL > 0)// 最近n天有涨过

  return condition1 && condition2 && condition3 && condition4 && condition5
}

// 赎回率过滤器
export function transactionFilter(detail:zhaoshang_IFormattedFundDetail):boolean {
  const day = 7
  const ltRate = 0.5
  return isInRedeemRange(detail.transactionInfo, day, ltRate)
}

// 估值过滤器
export function valuationFilter(valuation:IValuationItem[]) {
  // return valuation[0].y < 0
  return true
}
