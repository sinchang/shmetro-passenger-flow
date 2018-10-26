'use strict'

const axios = require('axios')
const Database = require('better-sqlite3')
const subDays = require('date-fns/sub_days')
const dateFns = require('date-fns')
const sleep = require('sleep')
const db = new Database('flow.db', {})
const WEIBO_ID = 1742987497
const RE_NUM = /[0-9]+([.]{1}[0-9]+){0,1}/g
const stmt = db.prepare('INSERT INTO flow VALUES (?, ?)')

function getUrl (page) {
  return `https://api.weibo.cn/2/cardlist?gsid=_2A2521ZXkDeRxGeRM6lMX8C7KzjyIHXVTwq4srDV6PUJbkdANLVbzkWpNU-THDBzZFugtumTrvGWbvasLqeXXhSzP&wm=3333_2001&i=97f38df&b=0&from=108A293010&c=iphone&networktype=wifi&v_p=67&skin=default&v_f=1&s=bbbbbbbb&lang=en_US&sflag=1&ua=iPhone7,1__weibo__8.10.2__iphone__os12.0.1&ft=1&aid=01Agn28Mnkd7HBsCAYC43QVxtOZNuCNBGAM-JCYUJF4VTqQWc.&lon=121.425175&uid=2211600650&container_ext=profile_uid%3A1742987497%7Cnettype%3Awifi%7Cgps_timestamp%3A1540530800532.108%7Cshow_topic%3A1%7Cnewhistory%3A0&count=100&luicode=10000198&containerid=100103type%3D401%26q%3D%E5%9C%B0%E9%93%81%E7%BD%91%E7%BB%9C%E5%AE%A2%E6%B5%81%26t%3D0&featurecode=10000085&uicode=10000003&fid=100103type%3D401%26q%3D%E5%9C%B0%E9%93%81%E7%BD%91%E7%BB%9C%E5%AE%A2%E6%B5%81%26t%3D0&need_head_cards=1&lat=31.230206&feed_mypage_card_remould_enable=1&page=${page}&lfid=1076031742987497&moduleID=pagecard&cum=EB7434DF`
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

let page = 1

;(async () => {
  while (true) {
    let text
    try {
      const { data } = await request(page)
      const cards = data.cards
      if (cards.length === 0) {
        process.exit()
      }

      cards[0].card_group.forEach(card => {
        text = card.mblog.text
        if (card.mblog.user.id === WEIBO_ID && text.indexOf('地铁网络客流') > -1) {
          const creatdAt = card.mblog.created_at
          const arr = text.match(RE_NUM)
          const subDate = subDays(new Date(creatdAt), 1)
          const num = arr[2]
          stmt.run(dateFns.format(subDate, 'YYYY-MM-DD'), Number(num))
        }
      })
    } catch (e) {
      console.log(e)
    }
    sleep.sleep(3)
    console.log(page)
    page++
  }
})()
