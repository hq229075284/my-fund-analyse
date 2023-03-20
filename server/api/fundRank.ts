/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable no-loop-func */
/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
import axios from 'axios'
import fs from 'node:fs'
import path from 'node:path'
import { mkdirp } from 'mkdirp'
import { retry, sleep } from '../utils/common'
import log from '../utils/log'

enum nameMap {
  'Z' = '近1周',
  'Y' = '近1月',
  '3Y' = '近3月',
  '6Y' = '近6月',
  '1N' = '近1年',
  '2N' = '近2年',
  '3N' = '近3年',
  '5N' = '近5年',
  'JN' = '今年以来',
  'LN' = '成立以来',
}
type keys='近1周'|'近1月'|'近3月'|'近6月'|'近1年'|'近2年'|'近3年'|'近5年'|'今年以来'|'成立以来'
type IRankInfo = {
  dataSource:{
    avg: string
    diff: string
    hs300: string
    /**
     * 排名
     */
    rank: string
    /**
     * 总数
     */
    sc:string
    syl:string
    /**
     * 类别
     */
    title: string
  }[]
} & {
  [key in keys]:{
    类别:string
    排名:number
    总数:number
    前百分之:number
  }
}
export interface IDescriptionOfFundRank{
  fundCode:string
  rankInfo:IRankInfo
}

// let responseCount = 0
// let thenCount = 0

// 获取单个基金的排名数据并归类
async function getRankInfo(fundCode:string) {
  const data = await axios({
    url: `https://j5.fund.eastmoney.com/sc/tfs/qt/v2.0.1/${fundCode}.json`,
    method: 'get',
    params: {},
    timeout: 20 * 1000,
    headers: {
      Referer: 'https://h5.1234567.com.cn/',
    },
  }).then((response) => {
    const rankData:IRankInfo = (response.data.JDZF.Datas).reduce((prev, item) => {
      prev[nameMap[item.title]] = {
        类别: nameMap[item.title],
        排名: Number(item.rank),
        总数: Number(item.sc),
        前百分之: Number.isNaN((item.rank / item.sc) * 100) ? '' : (item.rank / item.sc) * 100,
      }
      return prev
    }, {
      dataSource: response.data.JDZF.Datas,
    })
    return rankData
  })
  return data
}

export async function getRankByGroup(fundCodes:string[]) {
  // const _fundCodes = [...fundCodes]
  let successCount = 0
  let failCount = 0
  let result = [] as IDescriptionOfFundRank[]
  const delta = 600
  for (let i = 0; i < fundCodes.length; i += delta) {
    const codes = fundCodes.slice(i, i + delta)
    await Promise.all(
      codes.map(async (code) => {
        const rankInfo = await retry(
          () => getRankInfo(code),
          {
            tryCount: 10,
            interval: 1 * 1000,
            tryId: code,
          },
        )
        if (rankInfo) {
          result.push({
            fundCode: code,
            rankInfo,
          })
          successCount += 1
        } else {
          failCount += 1
          log.info(`排名数据获取失败,fundCode:${code}`)
        }
      }),
    )
    if (i + delta < fundCodes.length) {
      await sleep(1000)
    }
  }
  log.info(`排名数据,已成功处理${successCount}条，失败${failCount}条`)
  return result
}

// export async function getRankCategories(fundCodes:string[]) {
//   console.log('fundCodes', fundCodes.length)
//   const result = await Promise.all(
//     fundCodes.map(
//       (fundCode) => getRankCategory(fundCode)
//         .then(({ rankCategory, retry }) => {
//           console.log(`thenCount:${++thenCount}`)
//           // console.info(`基金编码${fundCode}，尝试了${retry}次, 是否获取到数据：${!!rankCategory}`)
//           return ({
//             fundCode,
//             data: rankCategory,
//             retry,
//           })
//         }),
//     ),
//   )
//   const successList = result.filter((r) => r.retry < maxRetry + 1)
//   log.info(`获取排行成功${successList.length}条`)
//   log.error(`获取排行失败${result.length - successList.length}条`)
//   return successList
// }

// getRankByGroup(new Array(1000).fill('004402'))

export function createWriteCacheForRank(fundCodes:string[]) {
  return async function pullRankDataToFile(filePath:string) {
    mkdirp.sync(path.dirname(filePath))
    fs.writeFileSync(filePath, '[')
    try {
      let successCount = 0
      let failCount = 0
      const delta = 600
      for (let i = 0; i < fundCodes.length; i += delta) {
        const codes = fundCodes.slice(i, i + delta)
        const result = [] as IDescriptionOfFundRank[]
        await Promise.all(
          codes.map(async (code) => {
            const rankInfo = await retry(
              () => getRankInfo(code),
              {
                tryCount: 20,
                interval: 1 * 1000,
                tryId: code,
              },
            )
            if (rankInfo) {
              successCount += 1
              result.push({
                fundCode: code,
                rankInfo,
              })
            } else {
              failCount += 1
              log.info(`排名数据获取失败,fundCode:${code}`)
            }
          }),
        )
        await fs.promises.appendFile(filePath, `${i > 0 ? ',' : ''}${JSON.stringify(result).replace(/^\[|\]$/g, '')}`)
        if (i + delta < fundCodes.length) {
          await sleep(1000)
        }
      }
      await fs.promises.appendFile(filePath, ']')
      log.info(`排名数据,已成功处理${successCount}条，失败${failCount}条`)
    } catch (error) {
      fs.rmSync(filePath)
      throw error
    }
  }
}
