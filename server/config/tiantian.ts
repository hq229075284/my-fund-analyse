import formatter from '@/api/tiantian/fundDetailFormatter'
import * as myProcess from '@/config/filters/index'
// import * as myProcess from '@/config/process2'
import {
  getCachePath, getDateStamp, getFundType,
} from '@/utils/common'
import { LoaderOption } from '@/utils/patch'
import { FundTypeEnum } from './enum'
import { REMOTE_FILEPATH_PREFIX } from './env'

const stamp = getDateStamp()

const fundType = getFundType()

const prefix = '(天天基金)'
const name = prefix + FundTypeEnum[fundType]

export const fallback:LoaderOption = {
  name,
  formatter,
  filter: myProcess.default.排名靠前的基金.tiantianFilter,
  persistence: true,
  filePath: getCachePath(`${name}数据${stamp}`),
  forceUpdate: false,
  verbose: true,
  remoteFilePath: `${REMOTE_FILEPATH_PREFIX}/uploadData/${name}数据${stamp}.json`,
}

export default {
  default: fallback,
}
