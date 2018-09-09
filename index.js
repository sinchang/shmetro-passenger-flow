'use strict'

const axios = require('axios')
const Database = require('better-sqlite3')
const db = new Database('flow.db', {})
const WEIBO_ID = 1742987497
const RE_NUM = /[0-9]+([.]{1}[0-9]+){0,1}/g
const stmt = db.prepare('INSERT INTO flow VALUES (?, ?)')

function getUrl (page) {
  return `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D%E5%9C%B0%E9%93%81%E7%BD%91%E7%BB%9C%E5%AE%A2%E6%B5%81+%E4%B8%8A%E6%B5%B7%E5%9C%B0%E9%93%81%E6%80%BB%E5%AE%A2%E6%B5%81%26t%3D0&page_type=searchall&page=${page}`
}

function request (page) {
  const url = getUrl(page)
  return axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      'Referer': 'https://m.weibo.cn/beta'
    }
  })
}

function isLastDay (str) {
  return str === '12-31' || str === '12-30'
}

let isEmpty = false
let page = 1

;(async () => {
  while (!isEmpty) {
    let text
    try {
      const { data } = await request(page)
      const cards = data.data.cards
      if (cards.length === 0) {
        isEmpty = true
        process.exit()
      }

      cards[0].card_group.forEach(card => {
        text = card.mblog.text
        if (card.mblog.user.id === WEIBO_ID) {
          const creatdAt = card.mblog.created_at
          const arr = text.match(RE_NUM)
          const str = `${arr[0]}-${arr[1]}`
          let year = '2018'
          if (creatdAt.split('-').length === 3) {
            year = creatdAt.split('-')[0]
            if (isLastDay(str)) {
              year = year - 1
            }
          } else {
            if (isLastDay(str)) {
              year = '2017'
            }
          }
          const date = `${year}-${str}`
          const num = arr[2]
          stmt.run(date, Number(num))
        }
      })
    } catch (e) {
      console.log(e)
      console.log(log)
    }
    console.log(page)
    page++
  }
})()
