const bcrypt = require('bcryptjs')
const { pathToRegexp } = require('path-to-regexp')

export function bhash (str) {
  return bcrypt.hashSync(str, 8)
}

export function bcompare (str, hash) {
  return bcrypt.compareSync(str, hash)
}

export function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function genProjectId () {
  return (+new Date()).toString(36) + randomInt(0, 99)
}

/**
 * 安全的 decodeURIComponent
 * @param String str
 */

export function safeDecodeURIComponent (str) {
  try {
    return decodeURIComponent(str)
  } catch (e) {
    return str
  }
}

/**
 * 解析出 params 对象
 *
 * /user/nick (/user/:name) => { name: 'nick' }
 *
 * @param String restURL /user/:name
 * @param String fullURL /user/nick
 */

export function params (restURL, fullURL) {
  const params = {}
  const paramNames = []
  const api = pathToRegexp(restURL, paramNames)
  const captures = fullURL.match(api)

  if (!captures) return {}

  captures.slice(1).forEach((value, i) => {
    /* istanbul ignore else */
    if (paramNames[i]) {
      params[paramNames[i].name] = safeDecodeURIComponent(value)
    }
  })

  return params
}