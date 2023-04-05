import axios from 'axios'

export default axios.create({
  timeout: 10 * 1000,
  method: 'get',
})
