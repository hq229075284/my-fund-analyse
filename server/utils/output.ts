// const fs = require('node:fs')
// const process = require( 'node:process')
// const { spawn } = require('node:child_process')
import exportExcel from './excel.js'
import { filter } from '../api/index'

export async function logToFileWithTableForm(source, filePath) {
//   const writeStream = fs.createWriteStream('output.txt')
  //   const stderrDataStream = fs.createWriteStream('stderrData.txt')
  //   const stdoutDataStream = fs.createWriteStream('stdoutData.txt')
  //   const stdoutErrorStream = fs.createWriteStream('stdoutError.txt')
  //   const closeStream = fs.createWriteStream('close.txt')
  //   const exitStream = fs.createWriteStream('exit.txt')

  //   const str = renderTable(source)
  //   writeStream.write(str)
  //   writeStream.close()
  //   const childProcess = spawn('node', ['./test.js'])
  //   const childProcess = spawn('node', ['../api/filter.mjs'])

  //   childProcess.stdout.on('data', (data) => {
  //     writeStream.write(data)
  //   })
  await filter()
  // const tableData =
  // exportExcel(tableData)
}

// @ts-ignore
logToFileWithTableForm()
