import formatter, { valuationFormatter } from '@/api/zhaoshang/fundDetailFormatter'
import * as myProcess from '@/config/process2'
import {
  getCachePath, getDateStamp, getFundType,
} from '@/utils/common'
import { LoaderOption } from '@/utils/patch'
import { FundTypeEnum } from './enum'
import { REMOTE_FILEPATH_PREFIX } from './env'

const stamp = getDateStamp()

const fundType = getFundType()

const prefix = '(招商)'
const name = prefix + FundTypeEnum[fundType]

export const fallback:LoaderOption = {
  name,
  formatter,
  filter: myProcess.zhaoshangFilter.defaultFilter,
  persistence: true,
  filePath: getCachePath(`${name}数据${stamp}`),
  forceUpdate: false,
  verbose: false,
  remoteFilePath: `${REMOTE_FILEPATH_PREFIX}/uploadData/${name}数据${stamp}.json`,
}

export const valuation:LoaderOption = {
  name,
  formatter: valuationFormatter,
  filter: myProcess.zhaoshangFilter.valuationFilter,
}

export default {
  default: fallback,
  valuation,
}
