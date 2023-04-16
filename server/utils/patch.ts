import fs from 'node:fs'
import path from 'node:path'
import { mkdirp } from 'mkdirp'
import log from '@/utils/log'
import { retry, sleep } from '@/utils/common'
import prompts from 'prompts'
import createAjax from '@/utils/ajax'

// function format<T>(arg:T) {
//   return arg
// }

interface BasicLoaderOption<FilterReturnType=any, FormatterReturnType=any>{
  /**
     * 加载器名称
     */
  name:string
  /**
   * 是否展示log
   */
  verbose?:boolean
  /**
   * 批量条数
   */
  delta?:number
  /**
     * 过滤器
     * @param arg 接口返回的数据或格式化后的数据
     * @returns 过滤后的结果
     */
  filter?:(arg:any)=>FilterReturnType
  /**
   * 格式化接口返回值
   * @param arg 接口返回的数据
   * @returns 格式化后的结果
   */
  formatter?:(arg:any)=>FormatterReturnType
}

  type FetchLoaderOption = BasicLoaderOption

  type PersistenceLoaderOption = BasicLoaderOption & {
    /**
     * 是否存储到文件中
     */
    persistence:true
    /**
     * 文件存储路径
     */
    filePath: string
    /**
     * 是否立即读取缓存文件
     */
    // readImmediately:boolean|undefined
    /**
     * 是否强制读取新数据
     */
    forceUpdate:boolean|undefined
  }

  type RemoteLoaderOption= PersistenceLoaderOption & {
    /**
     * 远程缓存文件地址
     */
    remoteFilePath:string
  }

export type LoaderOption = FetchLoaderOption|PersistenceLoaderOption|RemoteLoaderOption

function withPersistence(option:LoaderOption):option is PersistenceLoaderOption|RemoteLoaderOption {
  return 'persistence' in option && option.persistence
}

interface Result<T=unknown> {
  [fundCode:string]:{
    fundCode:string
    payload: T
  }
}

type theWayOfGetData<T=any>=(fundCode:string)=>T

// 从远程读缓存
async function readResultFromRemoteFile(options:RemoteLoaderOption) {
  let remoteCacheData
  try {
    remoteCacheData = await createAjax({
      url: options.remoteFilePath,
      responseType: 'text',
    }).then((response) => response.data)
  } catch {
    log.error(`远程缓存文件获取失败:${options.remoteFilePath}`)
    return false
  }
  fs.writeFileSync(options.filePath, remoteCacheData)
  log.success(`远程缓存文件获取成功，缓存到=>${options.filePath}`)
  return true
}

// 从本地读缓存
function readResultFromFile(options:PersistenceLoaderOption) {
  let resultAfterFilter = {} as Result
  const originResult = JSON.parse(fs.readFileSync(options.filePath, { encoding: 'utf8' })) as Result
  if (typeof options.filter === 'function') {
    Object.keys(originResult).forEach((fundCode) => {
      const { payload } = originResult[fundCode]
      if (options.filter!(payload)) {
        resultAfterFilter[fundCode] = { fundCode, payload }
      }
    })
  } else {
    resultAfterFilter = originResult
  }
  return resultAfterFilter
}

export async function patch<RT=unknown>(fundCodes:string[], fetchData:theWayOfGetData, options:LoaderOption) {
  const delta = options.delta || 200
  let resultAfterFilter = {} as Result<RT>
  let originResult = {} as Result<RT>
  let successCount = 0
  let failCount = 0
  const total = fundCodes.length
  let processedCount = 0
  let tempCount = 0

  if (withPersistence(options)) {
    mkdirp.sync(path.dirname(options.filePath))
    if (!options.forceUpdate) { // 尝试读缓存
      if (fs.existsSync(options.filePath)) {
        log.debug(`开始读取本地缓存=>${options.filePath}`)
        try {
          resultAfterFilter = readResultFromFile(options) as Result<RT>
          // log.success('本地缓存读取成功')
          return resultAfterFilter
        } catch {
          log.error(`读取本地缓存失败=>${options.filePath}`)
        }
      }
      if ('remoteFilePath' in options) {
        log.debug(`开始读取远程缓存=>${options.remoteFilePath}`)
        const downloadComplete = await readResultFromRemoteFile(options)
        if (downloadComplete) {
          log.debug(`开始读取本地缓存=>${options.filePath}`)
          try {
            resultAfterFilter = readResultFromFile(options) as Result<RT>
            // log.success('本地缓存读取成功')
            return resultAfterFilter
          } catch {
            log.error(`读取本地缓存失败=>${options.filePath}`)
          }
        }
        // const response = await prompts([
        //   {
        //     type: 'text',
        //     name: 'forceUpdate',
        //     message: '是否抛弃缓存，重新读取源数据？(Y/n)',
        //   },
        // ])
        // if (response.forceUpdate !== 'Y') {
        //   return resultAfterFilter
        // }
        // log.info(`开始重新读取${options.name}源数据`)
      }
    }

    // 读源数据
    log.info(`开始读取${options.name}源数据`)
    fs.writeFileSync(options.filePath, '{')
  }

  for (let i = 0; i < fundCodes.length; i += delta) {
    if (withPersistence(options)) {
      originResult = {}
    }
    await Promise.all(
      fundCodes.slice(i, i + delta).map(async (fundCode) => {
        tempCount += 1
        const message = await retry(
          () => fetchData(fundCode),
          {
            tryId: fundCode,
            interval: 1000,
            // interval: 1000 + Math.floor(1000 * Math.random()),
            tryCount: 30,
          },
        )
        // if (process.env.AT_VPS) {
        //   log.info(`${fundCode},message:${message}`)
        // }
        if (!message) {
          failCount += 1
        } else {
          successCount += 1
        }
        processedCount += 1
        if (processedCount % 20 === 0 || total - processedCount < 10) {
          if (options.verbose) {
            log.info(`${options.name}: 处理${tempCount}条,已请求到${processedCount}条，共${total}条`)
          }
        }
        if (message) {
          let payload
          if (options.formatter) {
            payload = options.formatter(message)
          } else {
            payload = message
          }
          if (withPersistence(options)) {
            originResult[fundCode] = { fundCode, payload }
          }
          if (options.filter) {
            if (options.filter(payload)) {
              resultAfterFilter[fundCode] = { fundCode, payload }
            }
          } else {
            resultAfterFilter[fundCode] = { fundCode, payload }
          }
        }
      }),
    )

    if (withPersistence(options)) {
      await fs.promises.appendFile(options.filePath, `${i > 0 ? ',' : ''}${JSON.stringify(originResult).replace(/^{|}$/g, '')}`)
      // log.success('写入')
    }

    if (i + delta < fundCodes.length) {
      await sleep(500)
    }
  }

  if (withPersistence(options)) {
    await fs.promises.appendFile(options.filePath, '}')
  }

  log.debug(`${options.name}信息: 已成功处理${successCount}条，失败${failCount}条`)

  // if (withPersistence(options)) {
  //   resultAfterFilter = readResultFromFile(options)
  //   // if (options.readImmediately) {
  //   // }
  // }
  return resultAfterFilter
}
