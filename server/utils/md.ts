import { mkdirp } from 'mkdirp'
import path from 'node:path'
import fs from 'node:fs'

export function writeToMd(
  dataSource:any[],
  filePath = path.resolve(__dirname, '../md/table.md'),
) {
  mkdirp.sync(path.dirname(filePath))

  const content = `<table>${
    dataSource.slice(0, 1).map((item) => `<tr>${
      Object.keys(item).reduce((prev, key) => `${prev}<th>${key}</th>`, '')
    }</tr>`).join('')
  }${
    dataSource.map((item) => `<tr>${
      Object.keys(item).reduce((prev, key) => `${prev}<td>${item[key]}</td>`, '')
    }</tr>`).join('')
  }
  </table>`

  const wStream = fs.createWriteStream(filePath)
  wStream.write(content)
}
