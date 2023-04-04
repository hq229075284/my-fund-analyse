// const fs = require('node:fs')
// const process = require( 'node:process')
// const { spawn } = require('node:child_process')
import process from 'node:process'
import exportExcel from './excel.js'
import { filter as mainFilter } from '../api/index'
import { filter as speculateFilter } from '../api/speculate'

let [scriptName, ft] = process.argv.slice(2)

if (!ft) {
  ft = scriptName
  scriptName = ''
}

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

  if (scriptName === 'sp') {
    await speculateFilter()
  } else {
    await mainFilter()
  }
  // const tableData =
  // exportExcel(tableData)
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
logToFileWithTableForm()
