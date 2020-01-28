const puppeteer = require("puppeteer");

const fs = require("fs");

class scrapy {
  async main() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: ["--proxy-server=127.0.0.1:8090"]
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({
      width: 1242,
      height: 575,
      deviceScaleFactor: 1
    });
    await this.page.goto("http://data.eastmoney.com/hsgtcg/");
    await this.page.waitForSelector("canvas");
    await this.scrool("canvas");
    var canvas = await this.page.$("canvas");
    for (let i = 0; i < 300; i++) {
      var box = await canvas.boundingBox();
      await new Promise(resolve => {
        setTimeout(resolve, 30);
      });
      await this.page.mouse.move(
        box.x + (i * box.width) / 160,
        box.y + box.height / 2
      );
      try {
        await this.page.waitForSelector("#zjlx_chart>div:nth-child(2)", {
          timeout: 100
        });
      } catch {
        continue;
      }
      var text = await this.page.evaluate(() => {
        var data = document.querySelector("#zjlx_chart>div:nth-child(2)")
          .textContent;
        return data;
      });
      fs.appendFileSync(__dirname + "/" + "test.csv", text + "\n");
    }
  }
  to_json(strings) {}
  async scrool(selector) {
    var canvas = await this.page.$(selector);
    var box = await canvas.boundingBox();
    await this.page.evaluate(e => {
      window.scrollTo(0, e);
    }, box.y);
  }
}
a = new scrapy();
a.main();
