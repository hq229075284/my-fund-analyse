import axios from 'axios'

export default axios.create({
  timeout: 5 * 1000,
  method: 'get',
})
