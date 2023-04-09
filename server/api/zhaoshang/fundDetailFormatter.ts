import type { ResponseData, IValuationItem } from './fundDetail'

interface Irange{
  /**
   * 大于等于
   */
  ge?:number
  /**
   * 大于
   */
  gt?:number
  /**
   * 小于
   */
  lt?:number
}
interface IRateAtRedemption{
  /**
   * 赎回费率对应的时间区间，如：0日≤持有天数<7日
   */
  // label:ResponseData['transaction']['shfl'][0]['tj']
  /**
   * 边界条件
   */
  range:Irange
  /**
   * 赎回费率
   */
  rate:ResponseData['transaction']['shfl'][0]['fl']
}
// 获取前端赎回费率
function getFrontEndRedemptionRate(source:ResponseData['transaction']['shfl']) {
  const result = [] as IRateAtRedemption[]
  source.forEach((s) => {
    const rate = s.fl
    const value = s.tj

    const range = {} as Irange
    const startEdgeReg = /^(\d+)日(.{1})/
    const endEdgeReg = /(.{1})(\d+)日$/
    let matched
    let lowValue
    let highValue
    let comparator

    matched = value.match(startEdgeReg)
    if (matched) {
      [lowValue, comparator] = matched.slice(1, 3)
      switch (comparator) {
        case '<':
          range.gt = lowValue
          break
        case '≤':
          range.ge = lowValue
          break
        default:
      }
    }

    matched = value.match(endEdgeReg)
    if (matched) {
      [comparator, highValue] = matched.slice(1, 3)
      range.lt = highValue
    }

    result.push({
      // label: value,
      range,
      rate,
    })
  })

  return result
}

function transactionFormatter(detail:ResponseData) {
  return getFrontEndRedemptionRate(detail.transaction.shfl)
}

export function valuationFormatter(valuation:IValuationItem[]) {
  return valuation
}

export default function formatter(detail:ResponseData) {
  const transactionInfo = transactionFormatter(detail)
  // const valuationInfo = valuationFormatter(detail)
  return {
    transactionInfo,
    // valuationInfo,
  }
}

export type IFormattedFundDetail=ReturnType<typeof formatter>
