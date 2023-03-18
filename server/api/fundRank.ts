/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-const */
/* eslint-disable no-loop-func */
/* eslint-disable arrow-body-style */
/* eslint-disable no-await-in-loop */
import axios from 'axios'
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
    // timeout: 10 * 1000,
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

const maxRetry = 5
export async function getRankInfoWithTry(fundCode) {
  let retry = 1
  // let startTime
  // let endTime
  while (retry <= maxRetry) {
    try {
      // startTime = Date.now()
      // if (retry > 1) {
      //   await sleep(1000)
      // }
      const rankInfo = await getRankInfo(fundCode)
      // log.info(`已获取rank,耗时${(endTime - startTime) / 1000}s`)
      return rankInfo
    } catch (e) {
      // if (e.message === '请求超时') {
      //   const duration = endTime - startTime
      //   log.error(`${fundCode}基金,retry${retry}次,${e.message},时长${duration / 1000}s`)
      // }
      /*  */
      // if (retry >= 3) {
      //   log.error(`${fundCode}基金的排行数据retry${retry}次`)
      // }
    }
    retry += 1
  }
  log.error(`该基金排行数据获取失败：${fundCode}`)
  return null
}

export async function getRankByGroup(fundCodes:string[]) {
  // const _fundCodes = [...fundCodes]
  let result = [] as IDescriptionOfFundRank[]
  // for (let i = 0; i < fundCodes.length; i += 1) {
  const diff = 1
  for (let i = 0; i < fundCodes.length; i += diff) {
  //   const code = fundCodes[i]
  //   const { rankCategory, retry } = await getRankCategory(code)
  //   if (rankCategory) {
  //     result.push({
  //       fundCode: code,
  //       data: rankCategory,
  //       retry,
  //     })
  //   }
    const codes = fundCodes.slice(i, i + diff)
    await Promise.all(
      codes.map((code) => getRankInfoWithTry(code).then((rankInfo) => {
        if (rankInfo) {
          result.push({
            fundCode: code,
            rankInfo,
          })
        }
      })),
    )
    log.info(`已读取 ${i + diff} 条，获取到rank ${result.length} 条`)
    // result = result.concat(await Promise.all(
    //   group.map((code) => getRankCategory(code)),
    // ))
    // if (_fundCodes.length) {
    //   await sleep(1000)
    // }
    // await sleep(1000)
  }
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
