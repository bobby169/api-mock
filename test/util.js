const request = require('supertest')
const app = require('~/server/split')

const TestUser = {
  username: '@testUser@',
  password: 'askdfwoejf'
}

class Util {
  static getUser () {
    return TestUser
  }

  static login (username, password) {
    return request(app)
      .post('/api/login')
      .send({ username, password })
      .then(res => res.body.data)
  }

  static createUser (username = TestUser.username, password = TestUser.password) {
    return request(app)
      .post('/api/register')
      .send({ username, password })
      .then((res) => {
        return this.login(username, password)
      })
  }

  static removeUser (id) {
    const UserProxy = require('~/server/provider/user')
    return UserProxy.destroy(id)
  }

  static createRequest (server, token) {
    return function (url, method = 'get', ctoken = token) {
      console.info(ctoken)
      return request(server)[method](url)
        .set('Authorization', `Bearer ${ctoken}`)
    }
  }
}

module.exports = Util
