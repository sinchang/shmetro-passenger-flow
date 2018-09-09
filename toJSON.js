'use strict'

const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const db = new Database('flow.db', {})
const stmt = db.prepare('SELECT * FROM flow')

const data = stmt.all()
const FILE_NAME = 'flow_mini.json'

data.sort(function (a, b) {
  return new Date(a.date) - new Date(b.date)
})

const filepath = path.resolve(FILE_NAME)

fs.writeFileSync(filepath, JSON.stringify(data))
