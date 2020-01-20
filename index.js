const puppeteer = require('puppeteer')
const fs = require('fs')

class scrapy {
  constructor() {
    this.depths = 4
    this.unarchive = new Array()
    this.archive = new Array()
    this.data = JSON.parse(fs.readFileSync(__dirname + '/music.json'))
  }
  async run(url) {

  }
  async scrool() {

  }
  async bfs(depth = 4) {
    var next_url = this.unarchive.pop(0)
    if (next_url && this.archive.indexOf(next_url) < 0) {
      this.archive.push(next_url)
      console.log('next')
      var pages = await this.run(next_url)
      if (typeof(pages) == 'object') {
        pages = pages.filter(e => this.archive.indexOf(e) < 0)
        pages = pages.filter(e => this.unarchive.indexOf(e) < 0)
      }
      this.unarchive.push(...pages)
    }
  }
  async get_data(_url) {
    await this.page.goto(_url)
    this.frame = await this.page.frames().find(e => e.name() == 'contentFrame')
    var data = await this.frame.evaluate(() => {
      var img = [...document.querySelectorAll('div>img[src]')].map(e => e.src)
      var data = [...document.querySelectorAll('a.msk')].map(e => [e.title, e.href])
      var next_url = document.querySelector('.u-page>a:last-child').href
      var current_page_number = document.querySelector('.u-page>a:nth-child(2)').text
      var data = data.map(e => [e[0], e[1], img[data.indexOf(e)]])
      return [data, next_url, current_page_number]
    })
    return data
  }
  async write_data(_data, _file = 'music.json') {
    for (let i of _data) {
      this.data['data'].push({
        'name': i[0],
        'href': i[1],
        'img_src': i[2]
      })

      this.data['data'] = this.data['data'].filter((e, v) => {
        return this.data['data'].indexOf(e) == v
      }) //filter 
      fs.writeFileSync(__dirname + '/' + _file, JSON.stringify(this.data))
    }
  }
  async main() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--proxy-server=127.0.0.1:8090']
    })
    this.page = await this.browser.newPage()
    var [data, next_url, number] = await this.get_data('https://music.163.com/#/discover/playlist/?cat=%E6%B5%81%E8%A1%8C').catch(() => console.log('error'))
    await this.write_data(data)
    falg = 0
    while (true) {
      var [data, next_url, page_number] = await this.get_data(next_url)
      await this.write_data(data)
      await new Promise(async resolve => {
        await setTimeout(resolve, (Math.random() + 0.5) * 1500, 'success')
      })
      var [data, next_url, page_number] = await this.get_data(next_url)
      await this.write_data(data)
      flag += 1
      if (falg > 15) {
        break
      }
    }
  }
}

a = new scrapy()
a.main()
