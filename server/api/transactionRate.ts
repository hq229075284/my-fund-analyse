/* eslint-disable no-loop-func */
import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { mkdirp } from 'mkdirp'
import log from '../utils/log'
import { retry, sleep } from '../utils/common'

interface Ishfl{
  fl:string,
  tj:string
}

interface Irange{
  ge?:number
  gt?:number
  lt?:number
}

export interface IRateAtRedemption{
  label: string,
  range: Irange,
  rate: string
}

export type IRateAtRedemptionWithFrontEnd={
  fundCode:string,
  fundid?:string,
  前端赎回费率: IRateAtRedemption[]
}

// 获取前端赎回费率
function getFrontEndRedemptionRate(source:Ishfl[]) {
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
      label: value,
      range,
      rate,
    })
  })

  return result
}

export async function getTransactionRate(fundCode:string) {
  let r:IRateAtRedemptionWithFrontEnd
  const fundid = await axios({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    method: 'get',
    timeout: 10 * 1000,
    params: {
      method: 'querycpxqv4',
      zqdm: fundCode,
    },
  }).then((response) => response.data.content?.fundid)

  if (!fundid) {
    r = {
      fundCode,
      fundid,
      前端赎回费率: [],
    }
    return r
  }

  r = await axios({
    url: 'https://xtrade.newone.com.cn/lc/api/getData',
    params: {
      method: 'queryjyxxv4',
      fundid,
    },
    timeout: 10 * 1000,
    method: 'get',
  }).then((response) => {
    const { rgfl, sgfl, shfl } = response.data.content
    const result = {
      fundCode,
      fundid,
    } as IRateAtRedemptionWithFrontEnd
    try {
      result['前端赎回费率'] = getFrontEndRedemptionRate(shfl)
    } catch {
      log.error(`前端赎回费率解析失败:${fundCode}`)
      result['前端赎回费率'] = []
    }
    return result
  })
  return r
}

export async function getTransactionRateWithTry(fundCode:string) {
  const r = await retry(
    () => getTransactionRate(fundCode),
    {
      tryId: fundCode,
      defaultValue: { 前端赎回费率: [] },
    },
  )
  return r
}

// async function filter(fundCode) {
//   const transactionData = await getTransactionRate(fundCode)
//   return transactionData['前端赎回费率'].reduce((prev, item) => {
//     if (prev) return prev
//     if (!item) return prev
//     const target = 30
//     const ltRate = 0.1
//     const result = []

//     // if (fundCode === '003176') debugger

//     if (item.range.gt != null) {
//       result.push(target > item.range.gt)
//     }
//     if (item.range.ge != null) {
//       result.push(target >= item.range.ge)
//     }
//     if (item.range.lt != null) {
//       result.push(target < item.range.lt)
//     }
//     const fidx = result.indexOf(false)
//     if (fidx > -1) return prev
//     if (!item.rate) return prev
//     return ltRate >= item.rate.replace('%', '')
//   }, false)
// }

// export async function transactionRateFilter(fundCode, fundName) {
//   let result
//   try {
//     result = await filter(fundCode)
//     console.log(`${fundName}(${fundCode})`, '是否符合赎回预期:', result)
//   } catch {
//     console.log(chalk.red(`${fundName}(${fundCode})`, '赎回费率解析异常'))
//   }

//   return result
// }

// doFilter()

export async function getTransactionRateList(fundCodes:string[]) {
  const result = [] as IRateAtRedemptionWithFrontEnd[]
  for (let i = 0; i < fundCodes.length; i += 1) {
    const code = fundCodes[i]
    result.push(await getTransactionRateWithTry(code))
  }
  return result
}

export async function patchTransactionRateWithTry(fundCodes:string[]) {
  let successCount = 0
  let failCount = 0
  const delta = 600
  const result = [] as IRateAtRedemptionWithFrontEnd[]
  for (let i = 0; i < fundCodes.length - 1; i += delta) {
    const codes = fundCodes.slice(i, i + delta)
    const groupData = await Promise.all(
      codes.map(async (fundCode) => {
        let r = await retry(
          () => getTransactionRate(fundCode),
          {
            tryId: fundCode,
            interval: 1 * 1000,
            tryCount: 10,
          },
        )
        if (!r) {
          failCount += 1
          log.error(`前端赎回费率获取失败, fundCode:${fundCode}`)
          r = { fundCode, 前端赎回费率: [] }
        } else {
          successCount += 1
        }
        return r
      }),
    )
    // console.log(`${delta} over----------------------`)
    result.push(...groupData)
    // if (i + delta < fundCodes.length) {
    //   await sleep(1000)
    // }
  }
  log.info(`前端赎回费率,已成功处理${successCount}条，失败${failCount}条`)

  // const result = await Promise.all(
  //   fundCodes.map(async (fundCode) => {
  //     const r = await retry(
  //       () => getTransactionRate(fundCode),
  //       {
  //         tryId: fundCode,
  //         defaultValue: { 前端赎回费率: [] },
  //         interval: 1 * 1000,
  //         tryCount: 30,
  //       },
  //     )
  //     if (!r['前端赎回费率'].length) {
  //       failCount += 1
  //       log.error(`前端赎回费率获取失败, fundCode:${fundCode} fundid:${r.fundid}`)
  //     } else {
  //       successCount += 1
  //     }
  //     log.info(`前端赎回费率,已成功处理${successCount}条，失败${failCount}条`)
  //     return r
  //   }),
  // )
  // log.info(`前端赎回费率,已成功处理${successCount}条，失败${failCount}条`)
  return result
}

export function createWriteCacheForRedeem(fundCodes:string[]) {
  return async (filePath:string) => {
    mkdirp.sync(path.dirname(filePath))
    fs.writeFileSync(filePath, '[')
    try {
      let successCount = 0
      let failCount = 0
      const delta = 600
      for (let i = 0; i < fundCodes.length - 1; i += delta) {
        const codes = fundCodes.slice(i, i + delta)
        const result = [] as IRateAtRedemptionWithFrontEnd[]
        await Promise.all(
          codes.map(async (fundCode) => {
            let r = await retry(
              () => getTransactionRate(fundCode),
              {
                tryId: fundCode,
                interval: 1 * 1000,
                tryCount: 10,
              },
            )
            if (!r) {
              failCount += 1
              log.error(`前端赎回费率获取失败, fundCode:${fundCode}`)
              r = { fundCode, 前端赎回费率: [] }
            } else {
              successCount += 1
            }
            result.push(r)
          }),
        )
        await fs.promises.appendFile(filePath, `${i > 0 ? ',' : ''}${JSON.stringify(result).replace(/^\[|\]$/g, '')}`)
        if (i + delta < fundCodes.length) {
          await sleep(1000)
        }
      }
      await fs.promises.appendFile(filePath, ']')
      log.info(`前端赎回费率,已成功处理${successCount}条，失败${failCount}条`)
    } catch (error) {
      fs.rmSync(filePath)
      throw error
    }
  }
}
