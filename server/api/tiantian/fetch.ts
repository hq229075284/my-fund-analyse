import { getData } from '@/api/tiantian/fundDetail'
import formatter, { type IFormattedFundDetail } from '@/api/tiantian/fundDetailFormatter'
import { getCachePath, getDateStamp } from '@/utils/common'
import { patch } from '@/utils/patch'
import log from '@/utils/log'
import { getFundList } from './fundList'

interface FetchOption{
  name:string
}

export default async function fetch(fundCodes:string[], option:FetchOption) {
  const stamp = getDateStamp()

  const result = await patch<IFormattedFundDetail>(
    fundCodes,
    getData,
    {
      persistence: true,
      filePath: getCachePath(`${option.name}数据${stamp}`),
      name: option.name,
      readImmediately: true,
      forceUpdate: true,
      formatter,
    },
  )

  // console.log(Object.keys(result).length)
  return result
}

(async () => {
  const ft = 'pg'
  const startTime = Date.now()
  const list = await getFundList({ requestParams: { ft } })
  await fetch(list.slice(0).map((item) => item['基金编码']), { name: `${ft}(天天基金)` })
  log.success('读取完成')
  log.success(`用时:${(Date.now() - startTime) / 1000}s`)
})()
