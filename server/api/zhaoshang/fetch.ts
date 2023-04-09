import {
  getData, getValuation, type IValuationItem,
} from '@/api/zhaoshang/fundDetail'
import formatter, { type IFormattedFundDetail, valuationFormatter } from '@/api/zhaoshang/fundDetailFormatter'
import { getCachePath, getDateStamp } from '@/utils/common'
import { patch } from '@/utils/patch'
import * as myProcess from '@/config/process2'
import log from '@/utils/log'
import process from 'node:process'
// import fs from 'node:fs'
// import path from 'node:path'
import { getFundList } from '../tiantian/fundList'

interface FetchOption{
  name:string
}

const prefix = '(招商)'

export async function defaultFetch(fundCodes:string[], option:FetchOption) {
  const stamp = getDateStamp()

  const result = await patch<IFormattedFundDetail>(
    fundCodes,
    getData,
    {
      name: `${prefix}${option.name}`,
      formatter,
      filter: myProcess.zhaoshangFilter.defaultFilter,
      persistence: true,
      filePath: getCachePath(`${prefix}${option.name}数据${stamp}`),
      forceUpdate: false,
      // readImmediately: true,
    },
  )

  return result
}

export async function valuationFetch(fundCodes:string[], option:FetchOption) {
  const result = await patch<IValuationItem[]>(
    fundCodes,
    getValuation,
    {
      name: `${prefix}${option.name}`,
      formatter: valuationFormatter,
      filter: myProcess.zhaoshangFilter.valuationFilter,
    },
  )

  return result
}

// (async () => {
//   const ft = 'pg'
//   const startTime = Date.now()
//   const list = await getFundList({ requestParams: { ft } })
//   await fetch(list.slice(0).map((item) => item['基金编码']), { name: `${ft}` })
//   log.success('读取完成')
//   log.success(`用时:${(Date.now() - startTime) / 1000}s`)
// })()

// process.on('exit', () => {
//   log.error('exit')
// })

// process.on('SIGINT', () => {
//   log.error('CTRL+C')
//   // fs.writeFileSync(path.resolve(__dirname, './log1.txt'), '2')
//   process.exit(0)
// }) // CTRL+C

// // 必须监听，不然SIGINT的监听无法触发
// process.on('SIGTERM', () => {}) // `kill` command
