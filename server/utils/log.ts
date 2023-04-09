/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import chalk from 'chalk'

class Log {
  info(msg:string) {
    console.log(msg)
  }

  success(msg:string) {
    console.log(chalk.green(msg))
  }

  error(msg:string) {
    // console.log(msg)
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
