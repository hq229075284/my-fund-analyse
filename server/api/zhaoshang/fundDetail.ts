/* eslint-disable no-loop-func */
import createAjax from '@/utils/ajax'

interface RedemptionResponseData{
  /**
   * 赎回数据
   */
  shfl:{
    /**
     * 赎回费率
     */
    fl:string,
    /**
     * 赎回费率对应的时间区间，如：0日≤持有天数<7日
     */
    tj:string
  }[]
}

export interface IValuationItem{
  /**
   * 时间，时间倒序排列，近30分钟
   */
  x:string
  /**
   * 涨跌估值百分数
   */
  y:number
}

export interface ResponseData{
  /**
     * 赎回费率
     */
  transaction:RedemptionResponseData,
  // /**
  //  * 近30条估值
  //  */
  // valuation:IValuationItem[]
}

export async function getFundId(fundCode:string) {
  const fundid:string|undefined = await createAjax({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    method: 'get',
    params: {
      method: 'querycpxqv4',
      zqdm: fundCode,
    },
  }).then((response) => response.data.content?.fundid)
  return fundid
}

export async function getTransactionRate(fundid:string) {
  const redemptionData:RedemptionResponseData = await createAjax({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    params: {
      method: 'queryjyxxv4',
      fundid,
    },
    method: 'post',
  }).then((response) => {
    const { shfl } = response.data.content
    return { shfl }
  })

  return redemptionData
}

export async function getValuationByFundId(fundid:string) {
  const valuation:IValuationItem[] = await createAjax({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    method: 'post',
    params: {
      method: 'queryjzycv4',
      fundid,
    },
  }).then((response) => {
    let { xAxis, yyseries } = response.data.content
    if (xAxis && yyseries) {
      xAxis = xAxis.slice(0, 30)
      yyseries = yyseries[1].data.slice(0, 30)
      return xAxis.reduce((prev, x, i) => {
        prev.push({ x, y: yyseries[i] })
        return prev
      }, [])
    }
    return []
  })

  return valuation
}

export async function getData(fundCode:string):Promise<ResponseData> {
  const fundId = await getFundId(fundCode)

  if (!fundId) {
    return {
      transaction: { shfl: [] },
      // valuation: [],
    }
  }

  const transaction = await getTransactionRate(fundId)
  // const valuation = await getValuationByFundId(fundId)

  return {
    transaction,
    // valuation,
  }
}

export async function getValuation(fundCode:string) {
  const fundId = await getFundId(fundCode)

  if (!fundId) {
    return []
  }

  const valuation = await getValuationByFundId(fundId)

  return valuation
}
