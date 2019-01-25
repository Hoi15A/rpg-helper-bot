const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')

const dbpath = path.resolve('db.json')

console.log(dbpath)

try {
  fs.writeFileSync(dbpath, '{}', { 'flag': 'wx' })
} catch (e) {
  // if err then the file exists already so we good
  // else it was created
}

var state = JSON.parse(fs.readFileSync(dbpath, 'utf8'))

module.exports = {
  set: function (chatid, data) {
    state[chatid] = data
    return fsPromises.writeFile(dbpath, JSON.stringify(state))
  },
  get: function (chatid) {
    return state[chatid]
  }
}
