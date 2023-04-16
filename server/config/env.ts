/* eslint-disable import/no-mutable-exports */
let REMOTE_FILEPATH_PREFIX
let REMOTE_UPLOAD_URL
if (process.env.NODE_ENV === 'production') {
  REMOTE_FILEPATH_PREFIX = 'http://back.freehan.tk:9001'
  REMOTE_UPLOAD_URL = 'http://back.freehan.tk:9000/upload'
} else {
  REMOTE_FILEPATH_PREFIX = 'http://localhost:9001'
  REMOTE_UPLOAD_URL = 'http://localhost:9000/upload'
}
export { REMOTE_FILEPATH_PREFIX, REMOTE_UPLOAD_URL }
