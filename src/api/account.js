import request from '@/utils/request'
import { serverIp } from '@/api/global'
// import Axios from 'axios'
// import qs from 'qs'

export function getList() {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get'
  })
}

export function loginAccount(data) {
  // Axios.post(serverIp+'/login', data)
  return request({
    url: serverIp + '/login',
    method: 'post',
    data
  })
}

export function loginSceond(data) {
  return request({
    url: serverIp + '/autoauth',
    method: 'post',
    data
  })
}
