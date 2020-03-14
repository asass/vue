export const wsIp = '127.0.0.1:8885'
export const serverIp = 'http://127.0.0.1:8886'

// export const wsIp = '106.52.101.141:8885'
// export const serverIp = 'http://106.52.101.141:8886'

var accountData = []

export function getAccountData() {
  return accountData
}

export function setAccountData(data) {
  accountData = data
}

var proxyData = []

export function getProxyData() {
  return proxyData
}

export function setProxyData(data) {
  proxyData = data
}
