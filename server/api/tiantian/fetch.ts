import { getData } from '@/api/tiantian/fundDetail'
import { type IFormattedFundDetail } from '@/api/tiantian/fundDetailFormatter'
// import { getCachePath, getDateStamp } from '@/utils/common'
import { patch } from '@/utils/patch'
// import log from '@/utils/log'
// import process from 'node:process'
// import fs from 'node:fs'
// import path from 'node:path'
import config from '@/config/tiantian'
// import { getFundList } from './fundList'

interface FetchOption{
  name?:string,
  filter?:(...args:any[])=>any
}

export async function defaultFetch(fundCodes:string[], option?:FetchOption) {
  const result = await patch<IFormattedFundDetail>(
    fundCodes,
    getData,
    {
      ...config.default,
      filter: option?.filter ?? config.default.filter,
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
