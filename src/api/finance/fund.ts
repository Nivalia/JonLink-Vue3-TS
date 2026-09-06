import request from '@/utils/request'

export function accountList(q?: any) { return request({ url: '/finance/fund/account/list', method: 'get', params: q || {} }) }
export function addAccount(a: any) { return request({ url: '/finance/fund/account', method: 'post', data: a }) }
export function activeAccounts() { return request({ url: '/finance/fund/account/active', method: 'get' }) }

export function receiptList(q?: any) { return request({ url: '/finance/fund/receipt/list', method: 'get', params: q || {} }) }
export function addReceipt(r: any) { return request({ url: '/finance/fund/receipt', method: 'post', data: r }) }
export function confirmReceipt(id: number) { return request({ url: `/finance/fund/receipt/${id}/confirm`, method: 'post' }) }

export function paymentList(q?: any) { return request({ url: '/finance/fund/payment/list', method: 'get', params: q || {} }) }
export function addPayment(p: any) { return request({ url: '/finance/fund/payment', method: 'post', data: p }) }
export function confirmPayment(id: number) { return request({ url: `/finance/fund/payment/${id}/confirm`, method: 'post' }) }

export function flowList(q?: any) { return request({ url: '/finance/fund/flow/list', method: 'get', params: q || {} }) }