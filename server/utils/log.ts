/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
import chalk from 'chalk'

class Log {
  info(msg:string) {
    console.log(msg)
  }

  error(msg:string) {
    // console.log(msg)
    console.log(chalk.red(msg))
  }

  table(rows:any) {
    console.table(rows)
  }

  lineInfo(msg:string) {
    console.log(`-------------${msg}-------------`)
  }
}

export default new Log()
