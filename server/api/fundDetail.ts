/* eslint-disable no-loop-func */
import axios from 'axios'
import dayjs from 'dayjs'
import fs from 'node:fs'
import path from 'node:path'
import { mkdirp } from 'mkdirp'
import log from '../utils/log'
import { retry, sleep } from '../utils/common'

export function getDateRange(value:number, unit:dayjs.ManipulateType) {
  const endDate = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
  const startDate = dayjs().subtract(value, unit).hour(0).minute(0).second(0).millisecond(0).valueOf()
  return { startDate, endDate }
}

interface ISort<T=string>{
  key:T,
  range:[number, dayjs.ManipulateType]
}

type ISortName='近1周'|'近1月'|'近3月'|'近6月'|'近1年'
export type IClassifiedFund = {fundCode:string}&{
  [Category in ISortName]:{
    lastItem: {x:number, y:number}
    description: ISortName
    startDate:number
    endDate:number
    max:number,
    min:number,
    currentPercent:number
  }
}

export async function getChartData(fundCode:string) {
  if (!fundCode) {
    throw new Error(('缺失需要查询的基金编码'))
  }
  const dataAfterHandle = await axios({
    url: `http://fund.eastmoney.com/pingzhongdata/${fundCode}.js?v=${dayjs().format('YYYYMMDDHHmmss')}`,
    method: 'get',
    params: {},
    timeout: 20 * 1000,
    headers: {
      Referer: 'http://fund.eastmoney.com/',
    },
  })
    .then((response) => {
      let message:{x:number, y:number}[]
      eval(`message = ${response.data.match(/Data_netWorthTrend[^[]*(\[.*\]);/)[1]}`)

      const sort:ISort<ISortName>[] = [
        { key: '近1周', range: [1, 'week'] },
        { key: '近1月', range: [1, 'month'] },
        { key: '近3月', range: [3, 'month'] },
        { key: '近6月', range: [6, 'month'] },
        { key: '近1年', range: [1, 'year'] },
      ]

      // @ts-ignore: 执行eval时赋值
      const chartData = message.reduce(
        (prev, data) => {
        // eslint-disable-next-line no-unused-vars
          Object.entries(prev).forEach(([key, item]) => {
            if (typeof item === 'string') return
            if (data.x >= item.startDate && data.x <= item.endDate) {
              item.lastItem = data
              if (item.max) {
                if (data.y > item.max) item.max = data.y
              } else {
                item.max = data.y
              }
              if (item.min) {
                if (data.y < item.min) item.min = data.y
              } else {
                item.min = data.y
              }
            }
          })
          return prev
        },
        sort.reduce((prev, item) => {
        // eslint-disable-next-line no-param-reassign
          prev[item.key] = {
            ...getDateRange(...item.range),
            lastItem: {} as {x: number; y: number;},
            description: item.key,
            max: 0,
            min: Infinity,
            currentPercent: 0,
          }
          return prev
        }, { fundCode } as IClassifiedFund),
      )

      Object.entries(chartData).forEach(([key, item]) => {
        if (typeof item === 'string') return
        try {
          item.currentPercent = (item.lastItem.y - item.min) / (item.max - item.min) * 100
          if (Object.is(NaN, item.currentPercent)) item.currentPercent = 0
        } catch {
          item.currentPercent = 0
        }
      })

      return chartData
    })

  return dataAfterHandle
}

export async function getDetail(fundCode) {
  // let chartData
  // try {
  //   chartData = await getChartData(fundCode)
  // } catch (e) {
  //   console.log(e)
  // }
  const chartData = await retry(
    () => getChartData(fundCode),
    // async () => {
    //   if (fundCode === '014858') {
    //     try {
    //       return getChartData(fundCode)
    //     } catch (e) {
    //       console.log(e)
    //       throw e
    //     }
    //   } else {
    //     return getChartData(fundCode)
    //   }
    // },
  )
  // try {
  //   const chartData = await getChartData(fundCode)

  //   // log.table(Object.entries(chartData).map(([key, item]) => {
  //   //   if (typeof item === 'string') return ''
  //   //   return {
  //   //     描述: item.description,
  //   //     最新净值: item.collection[item.collection.length - 1].y,
  //   //     最大净值: item.max,
  //   //     最小净值: item.min,
  //   //     当日所在范围内的当前百分点: `${item.currentPercent}%`,
  //   //   }
  //   // }))

  //   return chartData
  // } catch (e) {
  //   log.error(`该基金详情数据获取失败：${fundCode}`)
  // }
  if (!chartData) {
    log.error(`该基金详情数据获取失败：${fundCode}`)
  }
  return chartData
}

// getDetail('675093')

export async function getDetails(fundCodes:string[]) {
  let successCount = 0
  let failCount = 0
  const result = [] as IClassifiedFund[]
  const delta = 600
  for (let i = 0; i < fundCodes.length; i += delta) {
    const codes = fundCodes.slice(i, i + delta)
    await Promise.all(
      codes.map(async (code) => {
        const chartData = await retry(
          () => getChartData(code),
          {
            tryCount: 10,
            interval: 1 * 1000,
            tryId: code,
          },
        )
        if (chartData) {
          result.push(chartData)
          successCount += 1
        } else {
          failCount += 1
          log.info(`基金详情数据获取失败,fundCode:${code}`)
        }
        // log.info(`基金详情数据,已成功处理${successCount}条，失败${failCount}条`)
      }),
    )
    if (i + delta < fundCodes.length) {
      await sleep(1000)
    }
  }
  log.info(`基金详情数据,已成功处理${successCount}条，失败${failCount}条`)
  return result
}

export function createWriteCacheForDetail(fundCodes:string[]) {
  return async (filePath:string) => {
    mkdirp.sync(path.dirname(filePath))
    fs.writeFileSync(filePath, '[')
    try {
      let successCount = 0
      let failCount = 0
      const delta = 100
      for (let i = 0; i < fundCodes.length; i += delta) {
        const codes = fundCodes.slice(i, i + delta)
        const result = [] as IClassifiedFund[]
        await Promise.all(
          codes.map(async (code) => {
            const chartData = await retry(
              () => getChartData(code),
              {
                tryCount: 20,
                interval: 1 * 1000,
                tryId: code,
              },
            )
            if (chartData) {
              result.push(chartData)
              successCount += 1
            } else {
              failCount += 1
              log.info(`基金详情数据获取失败,fundCode:${code}`)
            }
          // log.info(`基金详情数据,已成功处理${successCount}条，失败${failCount}条`)
          }),
        )
        await fs.promises.appendFile(filePath, `${i > 0 ? ',' : ''}${JSON.stringify(result).replace(/^\[|\]$/g, '')}`)
        if (i + delta < fundCodes.length) {
          await sleep(1000)
        }
      }
      await fs.promises.appendFile(filePath, ']')
      log.info(`基金详情数据,已成功处理${successCount}条，失败${failCount}条`)
    } catch (error) {
      fs.rmSync(filePath)
      throw error
    }
  }
}
