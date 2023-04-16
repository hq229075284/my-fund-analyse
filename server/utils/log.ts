/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import chalk from 'chalk'
import dayjs from 'dayjs'
import fs from 'node:fs'
import path from 'node:path'

class Log {
  private logToFile(msg:string) {
    const content = `【${dayjs().format('YYYY-MM-DD HH:mm:ss')}】${msg}\n`
    fs.appendFileSync(path.resolve(__dirname, './log.txt'), content)
  }

  debug(msg:string) {
    this.logToFile(`[debug]=>${msg}`)
    console.log(chalk.hex('#ffbe0b')(msg))
  }

  info(msg:string) {
    // this.logToFile(msg)
    console.log(msg)
  }

  success(msg:string) {
    console.log(chalk.green(msg))
  }

  error(msg:string) {
    // console.log(msg)
    this.logToFile(msg)
    console.log(chalk.red(msg))
  }

  table(rows:any) {
    console.table(rows)
  }

  lineInfo(msg:string) {
    const length = 40
    const left = Math.floor((length - msg.length) / 2)
    const right = length - msg.length - left
    console.log(`${'-'.repeat(left)}${msg}${'-'.repeat(right)}`)
  }
}

export default new Log()
