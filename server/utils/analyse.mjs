import data from './data.mjs'

function decode(s) {
  return s
}

function loop(d) {
  if (typeof d === 'string') {
    return decode(d)
  }
  if (typeof d === 'object' && d !== null) {
    if (Array.isArray(d)) {
      return d.map((item) => loop(item))
    }
    const obj = {}
    for (const key in d) {
      obj[key] = loop(d[key])
    }
    return obj
  }
  return d
}

console.log(JSON.stringify(loop(data), null, 2))
