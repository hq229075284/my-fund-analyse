import * as fundDetail from '@/api/tiantian/fundDetail'
import { getFundList } from '@/api/fundList'
import { getCachePath, getDateStamp } from '@/utils/common';

(async function () {
  const stamp = getDateStamp()

  const list = await getFundList()

  const result = await fundDetail.patch(
    list.map((item) => item['基金编码']),
    fundDetail.getData,
    {
      persistence: true,
      filePath: getCachePath(`债券(天天基金)数据${stamp}`),
      name: '债券(天天基金)',
      readImmediately: true,
      forceUpdate: true,
    },
  )

  console.log(Object.keys(result).length)
}())
