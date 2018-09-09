'use strict'

const axios = require('axios')
const Database = require('better-sqlite3')
const db = new Database('flow.db', {})
const WEIBO_ID = 1742987497
const REGEX = /【地铁网络客流】(\d{1,})月(\d{1,})日上海地铁总客流为(\d{1,})[\s\S]*/g
const stmt = db.prepare('INSERT INTO flow VALUES (?, ?)');

function getUrl(page) {
  return `https://m.weibo.cn/api/container/getIndex?containerid=100103type%3D61%26q%3D%E5%9C%B0%E9%93%81%E7%BD%91%E7%BB%9C%E5%AE%A2%E6%B5%81+%E4%B8%8A%E6%B5%B7%E5%9C%B0%E9%93%81%E6%80%BB%E5%AE%A2%E6%B5%81%26t%3D0&page_type=searchall&page=${page}`
}

function request(page) {
  const url = getUrl(page)
  return axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      'Referer': 'https://m.weibo.cn/beta'
    }
  })
}

function formatDate(str, year) {
  const arr = str.split('-')
  return `${year}-${arr[0]}-${arr[1]}`
}

let isEmpty = false
let page = 1

;(async () => {
  while (!isEmpty) {
    let log
    try {
      const { data } = await request(page)
      const cards = data.data.cards
      if (cards.length === 0) {
        isEmpty = true
        process.exit()
      }

      cards[0].card_group.forEach(card => {
        if (card.mblog.user.id === WEIBO_ID) {
          log = card.mblog.text
          const creatdAt = card.mblog.created_at
          const str = card.mblog.text.replace(REGEX, '$1-$2_$3')
          let year = '2018'
          if (creatdAt.split('-').length === 3) {
            year = creatdAt.split('-')[0]
          }
          const date = formatDate(str.split('_')[0], year)
          const num = str.split('_')[1]
          stmt.run(date, Number(num))
        }
      })
    } catch(e) {
      console.log(e)
      console.log(log)
    }
    console.log(page)
    page ++
  }
})()