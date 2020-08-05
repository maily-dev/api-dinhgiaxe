"use strict"

const Curl = use("App/Helpers/Curl")
const { convertDate, underscoreSlug, isSpam, getCarType, filterAttribute } = use("App/Helpers/Utils")
const CarBrand = use("App/Models/CarBrand")
const CarModel = use("App/Models/CarModel")
const CarAttribute = use("App/Models/CarAttribute")
const Car = use("App/Models/Car")
const CarCrawl = use("App/Models/CarCrawl")
const CrawlError = use("App/Models/CrawlError")
const Cache = use('App/Helpers/Cache')

const { CAR_STATUS, SITES_CRAWL } = use("App/Helpers/Enum")

// Websocket
// const Ws = use("Ws")
// const WsCrawlerController = use("App/Controllers/Ws/CrawlerController")
// CONST
const site = "https://bonbanh.com"
const brandDataUrl = "js/menudata.js?v=1.1.10"
const crawlHeader = [
    "accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
    "accept-language: vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "sec-fetch-mode: navigate",
    "sec-fetch-site: none",
    "sec-fetch-user: ?1",
    "user-agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36"
]
/**
 * Add custom prototype Javascript Type
 */
Map.prototype.query = Map.prototype.get
RegExp.prototype.from = function (str) {
    return str.match(this) || []
}
Array.prototype.get = Array.prototype.pop
//<div class="cpage">Trang 12 / 12 &nbsp;&nbsp;
const regexs = new Map([
    ["tabCharacter", /\t+/g],
    ["vertifyIcon", /<span class=\"chk_ico2c\"><\/span>/],
    ["empty", /Không có tin bán xe/],
    ["totalPage", /(?<=<div class="cpage">Trang \d+ \/ ).*(?= &nbsp;&nbsp;)/],
    ["totalPost", /(?<=Tổng: ).*(?= tin<\/b> \)<\/div> <div class="navpage">)/],
    ["currentPage", /(?<=class="cpage">Trang )\d+(?= \/)/],
    ["postList", /<li class="car-item(.*?)<\/li>/gs],
    ["postItemLink", /(?<=itemprop="url" href=").*(?=" title=".+"><div)/],
    ["postItemStatus", /(?<=class="cb1"> ).*(?=<br> <b)/],
    ["postItemYear", /(?<=<br> <b>).*(?=\<\/b> .+cb2_02)/],
    ["postItemName", /(?<=<h3 itemprop="name">).*(?=<\/h3>)/],
    ["postItemPrice", /(?<=<b itemprop="price" content=").*(?="\>\d)/],
    ["postItemPriceStr", /(?<=content="\d+">).*(?=<meta)/],
    ["postItemLocation", /(?<=class="cb4"> <b>).*(?=<\/b> <\/div)/],
    //
    ["postName", /(?<=>Xe).*(?=<\/h1>)/],
    ["postDateUpload", /(?<=class="notes">Đăng ngày).*(?=	. Xem )/],
    [
        "postFrom",
        /Xuất xứ:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ],
    [
        "postCarType",
        /Dòng xe:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ],
    [
        "postCarKm",
        /Số Km đã đi:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)Km<\/span>/
    ],
    [
        "postCarColor",
        /Màu ngoại thất:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ],
    [
        "postCarEngine",
        /Động cơ:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ],
    [
        "postCarGearbox",
        /Hộp số:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ],
    [
        "postCarDrive",
        /Dẫn động:<\/label><\/div><div class="txt_input"><span class="inp">(.*?)<\/span>/
    ]
])

//
class CrawlerController {
    async crawlBrand() {
        try {
            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true
            //
            let urlGetBrand = `${site}/${brandDataUrl}`
            let content = await curl.GET(urlGetBrand)
            let body = await content.body
            let regexContent = /var oto_menu_json = '(.*?)'/
            let brandDts = JSON.parse(body.match(regexContent)[1])
            let data = []
            for (let i in brandDts) {
                let item = {}
                let models = []
                let brandDt = brandDts[i]
                let name = brandDt.name.toLowerCase()
                if (name == 'landrover') name = 'land rover'
                let brand = await CarBrand.findOrCreate({
                    name
                    // slug: brandDt.alias
                })
                for (let i in brandDt.menu_lv2) {
                    let modelDt = brandDt.menu_lv2[i]
                    try {
                        let model = await CarModel.findOrCreate({
                            brand_id: brand.id,
                            name: modelDt.name.toLowerCase(),
                            slug: modelDt.alias
                        })
                        models.push(model)
                    } catch (error) {
                    }
                }
                item.brand = brand
                item.models = models
                data.push(item)
            }
            await this.clearCache()
            console.log(`Crawl hãng và dòng xe hoàn thành: (Số lượng: ${data.length})`)
            return `Crawl hãng và dòng xe hoàn thành: (Số lượng: ${data.length})`
        } catch (error) {
            console.log(error)
            return 'Có lỗi'
        }
    }

    async getCar(https) {
        try {
            // // Biến cờ kết thúc function
            // WsCrawlerController.isStop = false
            // // Đối tượng Realtime
            // let realtime = {
            //     topic: null
            // }
            // //
            let page, condition, brand_slug, model_slug
            if (https && https.request) {
                let request = https.request
                let query = request.get()
                page = query.page
                page = parseInt(page) || 1
                condition = query.condition
                brand_slug = query.brand_slug
                model_slug = query.model_slug

            } else page = 1
            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true

            let url = await this.renderUrlWith(condition, brand_slug, model_slug) // (new||used, brand_slug, model_slug) địa chỉ crawl cụ thể, không truyền sẽ quét full
            url = encodeURI(url)
            curl.AddHeader(crawlHeader)

            let { body } = await curl.GET(`${site}/${url}`)

            let isNotHasCar = regexs.query("empty").from(body)
            if (isNotHasCar.length) return console.log('Dữ liệu xe không có')
            // return response
            //     .status(404)
            //     .json({ success: false, message: "Không có dữ liệu xe" })

            let totalPage = regexs
                .query("totalPage")
                .from(body)
                .get()
                .replace(",", "")
            console.log("url", `${site}/${url}`)
            console.log("totalPage", totalPage)

            //
            // this.sendRealtime(
            //     {
            //         message: "Bắt đầu Crawler data từ site Bonbanh.com",
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )
            //
            console.log('Tổng trang ' + totalPage)

            for (let index = page; index <= totalPage; index++) {
                // mở các trang chưa thông tin xe
                // if (WsCrawlerController.isStop) {
                //     // Kết thúc crawler
                //     this.sendRealtime(
                //         { message: "DONE!", page, totalPage },
                //         realtime
                //     )
                //     return "DONE!"
                // }
                //
                let responseData = await curl.GET(
                    `${site}/${url}/page,${index}`
                )

                let currentPage = regexs.query("currentPage").from(responseData.body).get() // Lấy số trang hiện tại
                console.log('Đang lấy trang: ' + currentPage)
                let listElementPost = regexs.query("postList").from(responseData.body) // Lấy danh sách Element chứa bài post
                //
                let posts = listElementPost.map(element => {
                    let post_item_url = regexs.query("postItemLink").from(element).get()
                    let postItemStatus = regexs.query("postItemStatus").from(element).get().trim()
                    let author_verify = element.includes("chk_ico2c")
                    author_verify = author_verify ? 1 : 0
                    return {
                        post_item_url,
                        post_item_code: post_item_url.split("-").get(),
                        post_item_status:
                            postItemStatus == "Xe mới"
                                ? CAR_STATUS.NEW
                                : postItemStatus == "Xe cũ"
                                    ? CAR_STATUS.USED
                                    : CAR_STATUS.UNKNOWN,
                        post_item_year: regexs.query("postItemYear").from(element).get(),
                        // ten: regexs.query('postItemName').from(element).get(),
                        post_item_price_str: regexs.query("postItemPriceStr").from(element).get(),
                        post_item_price: parseInt(
                            regexs.query("postItemPrice").from(element).get()
                        ),
                        post_item_location: regexs.query("postItemLocation").from(element).get(),
                        author_verify
                    }
                })

                let postArrs = posts.map(
                    async post =>
                        await this.getTin(
                            post.post_item_code,
                            post.post_item_url,
                            post.post_item_year,
                            post.post_item_price,
                            post.post_item_price_str,
                            post.post_item_location,
                            post.author_verify,
                            post.post_item_status,
                            // realtime,
                            page,
                            totalPage
                        )
                )

                await Promise.all(postArrs)

                // this.sendRealtime(
                //     {
                //         message: "✅ Lấy xong các bài của trang " + currentPage,
                //         page,
                //         totalPage
                //     },
                //     realtime
                // )
                // this.sendRealtime(currentPage, realtime, "process")
            }
            let total = await CarCrawl.getCount()

            // this.sendRealtime(
            //     { message: `DONE! (${total} items)`, page, totalPage },
            //     realtime
            // )
            await this.clearCache()
            return `Crawl completed: ${total} item`
        } catch (error) {
            console.log(error)
        }
    }

    async getTin( // get chi tiết từng xe
        post_item_code,
        post_item_url,
        post_item_year,
        post_item_price,
        post_item_price_str,
        post_item_location,
        author_verify,
        post_item_status,
        // realtime,
        page,
        totalPage
    ) {
        // if (WsCrawlerController.isStop) {
        //     // Kết thúc crawler
        //     throw "DONE!"
        // }
        try {
            // truy cập link lấy thông tin
            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true
            let { body } = await curl.GET(
                encodeURI(site + "/" + post_item_url)
            )
            //
            let carTypeDt
            let post_item_car_type = regexs.get("postCarType").from(body).get()
            if (!post_item_car_type) {
                // this.sendRealtime(
                //     {
                //         message: `⚫ Không có loại xe: https://bonbanh.com/${post_item_url}`,
                //         page,
                //         totalPage
                //     },
                //     realtime
                // )
                console.log('Tin không có loại xe: ' + post_item_url)
                return
            } else carTypeDt = await getCarType(post_item_car_type, SITES_CRAWL.BONBANH) // lấy car_type
            let carFound = body.match(/<span itemprop='name'>(.*?)<\/span>/gs)
            let brand = carFound[2].replace(/(<([^>]+)>)/gi, "")
            if (brand.includes("Hãng khác")) {
                // Loại bỏ tin rác
                return
            }

            let model = carFound[3].replace(/(<([^>]+)>)/gi, "")
            if (model.includes("Khác")) {
                // Loại bỏ tin rác
                return
            }

            let post_item_name = regexs.get("postName").from(body).get().trim()
                .replace(regexs.get("tabCharacter"), " ")
                .replace(regexs.get("vertifyIcon"), "")
            post_item_name = post_item_name ? post_item_name.toLowerCase() : ''
            if (!post_item_name) return console.log('Không có tên')
            let brandDb = await CarBrand.query()
                .where({ name: brand })
                .first()
            let modelDb
            if (!brandDb) return console.log('Không tìm thấy hãng ' + post_item_url)
            else {
                modelDb = await brandDb.models()
                    .where({ name: model })
                    .first()
                if (!modelDb) return console.log('Không có dòng xe')
            }
            const regexModelName = new RegExp(modelDb.name, "g")
            //
            let attributeName = post_item_name
                .replace("Xe", "")
                .replace(post_item_year, "")
                .replace(brandDb.name, "")
                .replace(regexModelName, "")
                .split("- ")[0]
                .trim()
                .toLowerCase()
            let car_id
            if (attributeName && isSpam(attributeName)) return 'Bỏ qua' // return attribute nếu là tin spam
            else if (attributeName) car_id = await this.getCarID(brandDb, modelDb, attributeName, carTypeDt, post_item_year,) // tìm hoặc tạo car    
            else return 'Không có attribute'
            //
            let checkStatus = await CarCrawl.query().where({
                author_code: post_item_code
            }).first()
            if (checkStatus) {
                if (
                    checkStatus.price !== post_item_price ||
                    checkStatus.author_location !== post_item_location ||
                    checkStatus.author_verify !== author_verify ||
                    checkStatus.car_id !== car_id
                ) {
                    let input = {
                        price: post_item_price,
                        price_string: post_item_price_str,
                        author_location: post_item_location,
                        author_verify,
                        car_id
                    }
                    await checkStatus.merge(input)
                    await checkStatus.save()

                    // this.sendRealtime(
                    //     {
                    //         message: `🟠 Cập nhật Item: https://bonbanh.com/${post_item_url}`,
                    //         page,
                    //         totalPage
                    //     },
                    //     realtime
                    // )
                    console.log('Đã cập nhật: ' + post_item_url)
                    return "Completed"
                } else {
                    // this.sendRealtime(
                    //     {
                    //         message: `⚫ Đã tồn tại Item: https://bonbanh.com/${post_item_url}`,
                    //         page,
                    //         totalPage
                    //     },
                    //     realtime
                    // )
                    console.log('Đã tồn tại: ' + post_item_url)
                    return "Completed"
                }
            }
            let post_item_date_upload = regexs.get("postDateUpload").from(body).get().trim()
            post_item_date_upload = convertDate(post_item_date_upload) // 2000-10-22
            let post_item_from = regexs.get("postFrom").from(body).get()
            let post_item_km = regexs.get("postCarKm").from(body).get()
            let post_item_color = regexs.get("postCarColor").from(body).get()
            post_item_color = post_item_color ? post_item_color.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let post_item_transmission = regexs.get("postCarGearbox").from(body).get()
            let post_item_drivetrain = regexs.get("postCarDrive").from(body).get()
            let post_item_engine_wraper = regexs.get("postCarEngine").from(body).get()
            let post_item_engine_lw = post_item_engine_wraper
                ? post_item_engine_wraper.toLowerCase()
                : ""
            let post_item_fuel_type
            let post_item_engine
            if (post_item_engine_lw.includes("xăng")) {
                post_item_fuel_type = "Xăng"
                let split = post_item_engine_lw.split("xăng")
                post_item_engine = split[1]
                    ? String(split[1]).replace(regexs.get("tabCharacter"), "")
                    : "Unknown"
            } else if (post_item_engine_lw.includes("dầu")) {
                post_item_fuel_type = "Dầu"
                let split = post_item_engine_lw.split("dầu")
                post_item_engine = split[1]
                    ? split[1].replace(regexs.get("tabCharacter"), "")
                    : "Unknown"
            } else {
                post_item_fuel_type = post_item_engine_wraper
                post_item_engine = post_item_engine_wraper
            }
            await CarCrawl.create({
                car_id,
                name: post_item_name,
                price: post_item_price,
                price_string: post_item_price_str,
                date_upload: post_item_date_upload,
                origin: post_item_from,
                mileage: post_item_km,
                color: post_item_color,
                engine: post_item_engine,
                fuel_type: post_item_fuel_type,
                transmission: post_item_transmission,
                drivetrain: post_item_drivetrain,
                author_site: SITES_CRAWL.BONBANH,
                author_location: post_item_location,
                author_code: post_item_code,
                author_url: `${SITES_CRAWL.BONBANH}/${post_item_url}`,
                author_verify: author_verify,
                condition: post_item_status
            })

            // this.sendRealtime(
            //     {
            //         message: `✔️ Lưu thành công Item: https://bonbanh.com/${post_item_url}`,
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )
            console.log('Đã lưu: ' + post_item_url)
            return "Completed"
        } catch (error) {
            console.log("CrawlError:", error)
            // this.sendRealtime(
            //     {
            //         message: `❌ Lưu thành thất bại Item: https://bonbanh.com/${post_item_url}`,
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )

            await CrawlError.findOrCreate({
                post_item_code,
                author: SITES_CRAWL.BONBANH,
                post_item_url,
                error_in: "funition get tin",
                error: JSON.stringify(error)
            })
            // console.log(error);
            return error
        }
    }

    async renderUrlWith(condition, brand_slug, model_slug) {
        let isNew = ""
        let brand = ""
        let model = ""
        if (brand_slug) {
            let checkBrand = await CarBrand.query().where({ slug: brand_slug }).first()
            let checkModel = await CarModel.query().where({ slug: model_slug }).first()
            if (checkBrand) {
                brand = `/${brand_slug}`
            }
            else if (brand_slug == 'land_rover') brand = `/landrover`
            if (checkModel) {
                model = `-${model_slug}`
            }
        }

        isNew =
            condition === CAR_STATUS.NEW
                ? "-xe-moi"
                : condition === CAR_STATUS.USED
                    ? "-cu-da-qua-su-dung"
                    : ""

        let url = `oto${brand}${model}${isNew}`
        return url
    }

    // async sendRealtime(message, realtime, event = "message") {
    //     if (realtime.topic) {
    //         try {
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:bonbanh`
    //             )
    //         }
    //     } else {
    //         try {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:bonbanh`
    //             )
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) { }
    //     }
    // }


    async getCarID(brandDt, modelDt, attributeName, carTypeDt, year) {
        attributeName = filterAttribute(attributeName) // lọc 15 G = 15G
        let fullSlug = `${brandDt.slug}-${modelDt.slug}-${carTypeDt.slug}-${underscoreSlug(attributeName)}`
        //
        let attribute_id = await this.getAttributeID(modelDt, carTypeDt, attributeName, fullSlug) // tìm hoặc tạo attribute
        //
        let name = `${brandDt.name} ${modelDt.name}\n ${carTypeDt.name} ${attributeName} - ${year}`
        let slug = `${fullSlug}-${year}` // để tạo trường duy nhất
        let car
        try {
            car = await Car.findOrCreate(
                { slug },
                {
                    attribute_id,
                    name,
                    year,
                    slug,
                    author_site: SITES_CRAWL.BONBANH
                })
            return car.id
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                car = await Car.query().where({ slug }).first()
                return car.id
            }
        }
    }

    async getAttributeID(modelDt, carTypeDt, attributeName, fullSlug) {
        let attribute
        try {
            attribute = await CarAttribute.findOrCreate(
                {
                    slug: fullSlug
                },
                {
                    model_id: modelDt.id,
                    car_type_id: carTypeDt.id,
                    name: attributeName,
                    slug: fullSlug,
                    author_site: SITES_CRAWL.BONBANH
                }
            )
            return attribute.id
        } catch (error) { // tránh lỗi đúp khi 
            if (error.code == 'ER_DUP_ENTRY') {
                attribute = await CarAttribute.query().where({ slug: fullSlug, }).first()
                return attribute.id
            }
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('carCrawls'),
            Cache.removeCache('models'),
            Cache.removeCache('attributes'),
            Cache.removeCache('carTypes'),
            Cache.removeCache('cars')
        ])
    }

}

module.exports = CrawlerController
