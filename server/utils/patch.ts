import fs from 'node:fs'
import path from 'node:path'
import { mkdirp } from 'mkdirp'
import log from '@/utils/log'
import { retry, sleep } from '@/utils/common'

function format<T>(arg:T) {
  return arg
}

interface BasicLoaderOption{
  /**
     * 加载器名称
     */
  name:string
  /**
     * 过滤器
     * @param arg 接口返回的数据
     * @returns 过滤后的结果
     */
  filter?:<T>(arg:any)=>T
}

  type FetchLoaderOption = BasicLoaderOption

  type PersistenceLoaderOption = BasicLoaderOption & {
    /**
     * 是否存储到文件中
     */
    persistence:true
    filePath: string
    readImmediately:boolean|undefined
    forceUpdate:boolean|undefined
  }

  type LoaderOption = FetchLoaderOption|PersistenceLoaderOption

function withPersistence(option:LoaderOption):option is PersistenceLoaderOption {
  return 'persistence' in option && option.persistence
}

interface Result {
  [fundCode:string]:{
    fundCode:string
    payload: unknown
  }
}

type theWayOfGetData<T=any>=(fundCode:string)=>T

export async function patch(fundCodes:string[], fetchData:theWayOfGetData, options:LoaderOption) {
  const delta = 300
  let result = {} as Result
  let successCount = 0
  let failCount = 0

  if (withPersistence(options)) {
    if (fs.existsSync(options.filePath) && !options.forceUpdate) {
      return JSON.parse(fs.readFileSync(options.filePath, { encoding: 'utf8' })) as Result
    }
    mkdirp.sync(path.dirname(options.filePath))
    fs.writeFileSync(options.filePath, '{')
  }

  for (let i = 0; i < fundCodes.length; i += delta) {
    if (withPersistence(options)) {
      result = {}
    }
    await Promise.all(
      fundCodes.slice(i, i + delta).map(async (fundCode) => {
        const message = await retry(
          () => fetchData(fundCode),
          {
            tryId: fundCode,
            interval: 1000,
            tryCount: 5,
          },
        )
        if (!message) {
          failCount += 1
        } else {
          successCount += 1
        }
        if (message) {
          if (options.filter && options.filter(message)) {
            result[fundCode] = { fundCode, payload: format(message) }
          } else {
            result[fundCode] = { fundCode, payload: format(message) }
          }
        }
      }),
    )

    if (withPersistence(options)) {
      await fs.promises.appendFile(options.filePath, `${i > 0 ? ',' : ''}${JSON.stringify(result).replace(/^{|}$/g, '')}`)
    }

    if (i + delta < fundCodes.length) {
      await sleep(1000)
    }
  }

  if (withPersistence(options)) {
    await fs.promises.appendFile(options.filePath, '}')
  }

  log.info(`${options.name}信息,已成功处理${successCount}条，失败${failCount}条`)

  if (withPersistence(options)) {
    if (options.readImmediately) {
      return JSON.parse(fs.readFileSync(options.filePath, { encoding: 'utf8' })) as Result
    }
  }
  return result
}
