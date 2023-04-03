/* eslint-disable no-loop-func */
import axios from 'axios'
import { getFundId } from './transactionRate'
import { retry, sleep } from '../utils/common'
import log from '../utils/log'
import { valuationFilter } from '../config/process'

export interface IValuationItem{
  /**
   * 时间，倒序排列，近30分钟
   */
  x:string
  /**
   * 涨跌估值百分数
   */
  y:number
}

export interface IValuation{
  [key:string]:{
    fundCode:string,
    valuation:IValuationItem[]
  }
}

export async function getValuationByCode(fundCode:string) {
  const fundId = await getFundId(fundCode)
  const valuation:IValuationItem[] = await axios({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    method: 'post',
    params: {
      method: 'queryjzycv4',
      fundid: fundId,
    },
  }).then((response) => {
    let { xAxis, yyseries } = response.data.content
    xAxis = xAxis.slice(0, 30)
    yyseries = yyseries[1].data.slice(0, 30)
    return xAxis.reduce((prev, x, i) => {
      prev.push({ x, y: yyseries[i] })
      return prev
    }, [] as IValuationItem[])
  })

  return valuation
}

export async function filterValuation(fundCodes:string[]) {
  const delta = 600
  const result = {} as IValuation
  let successCount = 0
  let failCount = 0
  for (let i = 0; i < fundCodes.length; i += delta) {
    await Promise.all(
      fundCodes.slice(i, i + delta).map(async (fundCode) => {
        const message = await retry(
          () => getValuationByCode(fundCode),
          {
            tryId: fundCode,
            interval: 1000,
            tryCount: 5,
          },
        )
        if (!message) {
          failCount += 1
        } else {
          successCount += 1
        }
        if (message && valuationFilter(message)) {
          result[fundCode] = { fundCode, valuation: message }
        }
      }),
    )

    if (i + delta < fundCodes.length) {
      await sleep(1000)
    }

    log.info(`估值信息,已成功处理${successCount}条，失败${failCount}条`)
  }

  return result
}
