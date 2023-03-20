const XLSX = require('xlsx')
const path = require('node:path')
const dayjs = require('dayjs')
const { mkdirp } = require('mkdirp')

class Excel {
  constructor(options) {
    this.filePath = options.filePath
    this.workbook = XLSX.utils.book_new()
    this.sheetId = 1
  }

  addSheet({
    sheetName,
    rows = [],
  } = {}) {
    if (!rows?.length) return

    sheetName = sheetName || `sheet${sheetId++}`

    const worksheet = XLSX.utils.json_to_sheet(rows)

    // https://git.sheetjs.com/sheetjs/sheetjs/src/branch/master/tests/write.js#L21
    const wscols = new Array(Object.keys(rows[0]).length).fill({ wpx: 100 })
    // wscols[1] = { wpx: 200 }
    // wscols[wscols.length - 1] = { wpx: 300 }
    worksheet['!cols'] = wscols

    // 指定创建表格的数据范围，附带排序和筛选功能
    worksheet['!autofilter'] = { ref: `A1:${(wscols.length + 9).toString(36).toUpperCase() + rows.length}` }

    XLSX.utils.book_append_sheet(this.workbook, worksheet, sheetName)
  }

  done() {
    this.workbook.SheetNames.reverse()
    XLSX.writeFile(this.workbook, this.filePath)
  }
}

function createExcel(
  filePath = path.resolve(__dirname, `../xlsx/${dayjs().format('YYYY-MM-DD HH-mm-ss')}.xlsx`),
) {
  mkdirp.sync(path.dirname(filePath))
  return new Excel({
    filePath,
  })
}

module.exports = createExcel

// const excel = createExcel()
// excel.addSheet({ sheetName: 'a23', rows: [{ x: 1, y: 2 }] })
// excel.done()
