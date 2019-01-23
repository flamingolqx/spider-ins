const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const fs = require("fs")
const request = require("request")
const path = require("path")

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    timeout: 300000
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1366,
    height: 768
  })

  await page.goto("https://www.instagram.com/rkrkrk/", {
    timeout: 0,
    waitUntil: "networkidle0"
  })

  const insId = "rkrkrk"
  const cookies = await page.cookies().value
  console.log(cookies)
  // await fetchIns(insId)

  async function fetchIns() {
    const html = await page.content()
    const $ = cheerio.load(html)
    // const $ = cheerio.load(response.body)
    const script = $("body script")
      .first()
      .html()
      .replace(/window/g, "global")
    eval(script)

    const user = global._sharedData.entry_data.ProfilePage[0].graphql.user
    const nodes = user.edge_owner_to_timeline_media.edges

    let end_cursor = user.edge_owner_to_timeline_media.page_info.end_cursor
    const userId = user.id
    const images = nodes.map(node => node.node.thumbnail_src)
    await downloadImage(images, insId)
  }

  async function downloadImage(images, insId) {
    images.forEach(async image => {
      // console.log(typeof image)
      if (typeof image == "string") {
        const info = path.parse(image)
        console.log(info)
        const name = info.name.split("?")[0]
        // downloadPic(image, path.join(__dirname, `images/${insId}`, name))
        await new Promise((resolve, reject) => {
          request(image, (error, response, body) => {
            console.log(error)
            console.log(response)
            if (body) {
              fs.writeFile(
                path.join(__dirname, `images/${insId}`, name),
                body,
                "binary",
                err => {
                  if (err) reject(err)
                  console.log(`${name} 抓取成功`)
                  resolve()
                }
              )
            }
          })
        })
      }
    })
  }
})()

/**
 * 爬 dom 方式
 * 发现dom 上没有1080w 的 图，点击每个缩略图之后才会产生
 */
// const html = await page.content()
// const $ = cheerio.load(html)

// const imgs = $(".KL4Bh img ")

// imageArr = []
// for (const i in imgs) {
//   const attribs = imgs[i].attribs
//   if (attribs) {
//     // console.log(attribs)
//     const image = imgs[i].attribs.srcset
//     const srcArr = image.split(",")
//     console.log(srcArr)

//   }
// }
