"use strict"

const Curl = use("App/Helpers/Curl")
const { convertDate, slug, convertPriceStringToNumber, isSpam, getCarType, filterAttribute, underscoreSlug } = use("App/Helpers/Utils")
const CarBrand = use("App/Models/CarBrand")
const CarModel = use("App/Models/CarModel")
const CarAttribute = use("App/Models/CarAttribute")
const CarCrawl = use("App/Models/CarCrawl")
const Car = use("App/Models/Car")
const CrawlError = use("App/Models/CrawlError")
const Cache = use('App/Helpers/Cache')

const { CAR_STATUS, SITES_CRAWL } = use("App/Helpers/Enum")

// Websocket
// const Ws = use("Ws")
// const WsCrawlerController = use("App/Controllers/Ws/CrawlerController")
// CONST
const site = "https://www.carmudi.vn"
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
const regexs = new Map([
    ["tabCharacter", /\t+/g],
    ["totalResult", /<div class="search-result">(.*?) kết quả<\/div>/],
    ["currentPage", /<a class="pagination-link is-current" aria-current="page">(.*?)<\/a>/],
    ["postList", /<article class="media ">(.*?)<\/article>/gs],
    ["postItemLink", /<a  href="(.*?)" class="title is-5" >/],
    ["postItemStatus", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/condition.svg">\s<small>(.*?)<\/small/],
    ["postItemYear", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/build.svg">\s<small>(.*?)<\/small/],
    ["postItemName", /<h3 class="list-info-title">(.*?)<h3>/],
    ["postItemPrice", /(?<=<b itemprop="price" content=").*(?="\>\d)/],
    ["postItemPriceStr", /<div class="list-price-number">(.*?)<\/div/s],
    ["postItemLocation", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/location.svg">\s<small>(.*?)<\/small/],
    //
    ["postName", /(?<=>Xe).*(?=<\/h1>)/],
    ["postDateUpload", / - Cập nhật ngày: <span class="value">(.*?)<\/span>/],
    [
        "postFrom",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/origin.svg">\sXuất xứ: (.*?)<\/div>/s
    ],
    [
        "postCarType",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/body_style.svg">\sKiểu dáng: (.*?)<\/div>/s
    ],
    [
        "postCarKm",
        /<small>Cũ<\/small>\s\((.*?) km\)/g
    ],
    [
        "postCarColor",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/exterior_color.svg">\sMàu ngoại thất: (.*?)<\/div>/s
    ],
    [
        "postItemFuelType",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/fuel.svg">\sNhiên liệu: (.*?)<\/div>/s
    ],
    [
        "postCarGearbox",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/transmission.svg">\sHộp số: (.*?)<\/div>/s
    ],
    [
        "tableDetail",
        /<table class="table is-striped is-narrow">(.*?)<\/table>/s
    ],
    [
        "postCarEngine",
        /<tr>.*?<span>Động cơ.*? class="value">.*? item out value tpl -->(.*?)<!-- .*?<!-- field output tpl end -->\s<\/tr>/s
    ],
    [
        "postItemDrivetrain",
        /<tr>.*?<span>Dẫn động.*? class="value">.*? item out value tpl -->(.*?)<!-- .*?<!-- field output tpl end -->\s<\/tr>/s
    ],
    [
        "postAttribute",
        /<div class="feature-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/detail\/version.svg">\sPhiên bản: (.*?)<\/div>/s
    ]

])

//
class CrawlerController {
    async getCar(https) {
        try {
            // Biến cờ kết thúc function
            // WsCrawlerController.isStop = false
            // // Đối tượng Realtime
            // let realtime = {
            //     topic: null
            // }
            //
            let page, condition, brand_slug
            if (https && https.request) {
                let request = https.request
                let query = request.get()
                page = query.page
                page = parseInt(page) || 1
                condition = query.condition
                brand_slug = query.brand_slug
            } else page = 1
            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true

            let url = await this.renderUrlWith(
                condition,
                brand_slug
            )
            url = encodeURI(url)
            curl.AddHeader(crawlHeader)
            let { body } = await curl.GET(`${site}/${url}/`)
            let totalResult = regexs.query("totalResult").from(body).get()
            let totalPage = parseInt(totalResult) / 20
            totalPage = Math.ceil(totalPage)
            if (page > totalPage) {
                console.log('Page tối đa: ' + totalPage)
                // this.sendRealtime(
                //     {
                //         message: `${SITES_CRAWL.CARMUDI} tối đa: ${totalPage}`
                //     },
                //     realtime
                // )
            }
            console.log("url ", `${site}/${url}`)
            console.log("totalPage ", totalPage)

            // this.sendRealtime(
            //     {
            //         message: `Bắt đầu Crawler data từ site ${SITES_CRAWL.CARMUDI}`,
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )
            //

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
                    `${site}/${url}/index${index}.html`
                )
                let currentPage = regexs.query("currentPage").from(responseData.body).get() // Lấy số trang hiện tại
                let listElementPost = regexs.query("postList").from(responseData.body) // Lấy danh sách Element chứa bài post
                //
                let posts = listElementPost.map(element => {
                    let post_item_url = regexs.query("postItemLink").from(element).get()
                    let postItemStatus = regexs.query("postItemStatus").from(element).get().trim()
                    let post_item_km = element.match(/<small>Cũ<\/small>\s\((.*?) km\)/)
                    post_item_km = post_item_km ? post_item_km[1].replace(/(\r\n|\n|\r)/gm, "") : 0
                    return {
                        post_item_url,
                        post_item_code: post_item_url.split("-").get().replace("/", ''),
                        post_item_status:
                            postItemStatus == "Mới"
                                ? CAR_STATUS.NEW
                                : postItemStatus == "Cũ"
                                    ? CAR_STATUS.USED
                                    : CAR_STATUS.UNKNOWN,
                        post_item_year: regexs.query("postItemYear").from(element).get(),
                        post_item_name: regexs.query('postItemName').from(element).get(),
                        post_item_price_str: regexs.query("postItemPriceStr").from(element).get().replace(/(\r\n|\n|\r)/gm, " "),
                        post_item_location: regexs.query("postItemLocation").from(element).get(),
                        post_item_km
                    }
                })
                let postArrs = posts.map(
                    async post =>
                        await this.getTin(
                            post.post_item_name,
                            post.post_item_code,
                            post.post_item_url,
                            post.post_item_year,
                            post.post_item_price_str,
                            post.post_item_location,
                            post.post_item_status,
                            post.post_item_km,
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
                console.log('đã lấy: ' + currentPage)
                // this.sendRealtime(currentPage, realtime, "process")
            }
            let total = await CarCrawl.query().where({ author_site: SITES_CRAWL.CARMUDI }).getCount()

            //
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
        post_item_name,
        post_item_code,
        post_item_url,
        post_item_year,
        post_item_price_str,
        post_item_location,
        post_item_status,
        post_item_km,
        // realtime,
        page,
        totalPage
    ) {
        // if (WsCrawlerController.isStop) {
        //     // Kết thúc crawler
        //     throw "DONE!"
        // }
        try {
            //
            let post_item_price = convertPriceStringToNumber(post_item_price_str)
            if (post_item_price <= 1 * 1e6 || post_item_price > 30 * 1e9) { // giá nhỏ hơn 1 triệu, bỏ qua, hoặc lớn hơn 30 tỷ bỏ qua
                // this.sendRealtime(
                //     {
                //         message: `⚫ Giá không hợp lệ: ${post_item_url}`,
                //         page,
                //         totalPage
                //     },
                //     realtime
                // )
                console.log('Giá không hợp lệ: ' + post_item_url)
                return "Completed"
            }
            // -- truy cập link lấy thông tin
            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true
            let { body } = await curl.GET(
                encodeURI(post_item_url)
            )
            ///
            let carTypeDt
            let post_item_car_type = regexs.get("postCarType").from(body).get()
            if (!post_item_car_type) {
                // this.sendRealtime(
                //     {
                //         message: `⚫ Không có loại xe: ${post_item_url}`,
                //         page,
                //         totalPage
                //     },
                //     realtime
                // )
                console.log('Không có loại xe: ' + post_item_url)
                return "Completed"
            } else carTypeDt = await getCarType(post_item_car_type, SITES_CRAWL.CARMUDI)
            let carFound = body.match(/<span style="color: #373737;" itemprop="name">(.*?) <\/span><\/a>/g)
            let brand
            let model
            if (carFound && carFound.length) {
                brand = carFound[2] ? carFound[2].replace(/(<([^>]+)>)/gi, "").toLowerCase() : null
                model = carFound[3] ? carFound[3].replace(/(<([^>]+)>)/gi, "").toLowerCase() : null
            }
            let modelDt = await this.getModelthisCar(brand, model)
            if (!modelDt) return "Hãng hoặc dòng xe này không tồn tại"
            // let author_location_slug = await this.getAuthorLocation(post_item_location)
            let attributeName = regexs.get("postAttribute").from(body).get()
            attributeName = attributeName ? attributeName.replace(/(\r\n|\n|\r)/gm, "") : null
            if (brand != 'mazda') { // xóa hãng và dòng xe trong thuộc tính, trừ Mazda vì có model 2, 4...
                attributeName = attributeName.toLowerCase()
                attributeName = attributeName.replace(brand, '').replace(model, '')
                attributeName = attributeName ? attributeName.trim() : ''
            }
            let car_id
            if (attributeName && isSpam(attributeName)) return 'Bỏ qua' // return attribute nếu là tin spam
            else if (attributeName) {
                car_id = await this.getCarID(brand, modelDt, attributeName, carTypeDt, post_item_year,) // tìm hoặc tạo car 
            }
            else return "Không có attribute"
            let checkStatus = await CarCrawl.query().where({
                author_code: post_item_code
            }).first()
            let post_item_date_upload = regexs.get("postDateUpload").from(body).get()
            post_item_date_upload = post_item_date_upload ? convertDate(post_item_date_upload) : null// 2000-10-22

            if (checkStatus) {
                if (
                    checkStatus.price !== post_item_price ||
                    checkStatus.date_upload !== post_item_date_upload ||
                    checkStatus.car_id !== car_id
                ) {
                    let input = {
                        price: post_item_price,
                        date_upload: post_item_date_upload,
                        car_id
                    }
                    await checkStatus.merge(input)
                    await checkStatus.save()

                    // this.sendRealtime(
                    //     {
                    //         message: `🟠 Cập nhật Item: ${post_item_url}`,
                    //         page,
                    //         totalPage
                    //     },
                    //     realtime
                    // )
                    console.log('Đã cập nhật ' + post_item_url)
                    return "Completed"
                } else {
                    // this.sendRealtime(
                    //     {
                    //         message: `⚫ Đã tồn tại Item: ${post_item_url}`,
                    //         page,
                    //         totalPage
                    //     },
                    //     realtime
                    // )
                    console.log('Đã tồn tại: ' + post_item_url)
                    return "Completed"
                }
            }

            let post_item_from = regexs.get("postFrom").from(body).get()
            post_item_from = post_item_from ? post_item_from.replace(/(\r\n|\n|\r)/gm, "") : null
            let post_item_color = regexs.get("postCarColor").from(body).get()
            post_item_color = post_item_color ? post_item_color.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let post_item_transmission = regexs.get("postCarGearbox").from(body).get()
            post_item_transmission = post_item_transmission ? post_item_transmission.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let post_item_fuel_type = regexs.get("postItemFuelType").from(body).get()
            post_item_fuel_type = post_item_fuel_type ? post_item_fuel_type.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let tableDetail = regexs.get("tableDetail").from(body).get()
            let post_item_drivetrain, post_item_engine
            if (tableDetail) {
                post_item_drivetrain = regexs.get("postItemDrivetrain").from(tableDetail).get()
                post_item_drivetrain = post_item_drivetrain ? post_item_drivetrain.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
                post_item_engine = regexs.get("postCarEngine").from(tableDetail).get()
                post_item_engine = post_item_engine ? post_item_engine.replace(/(\r\n|\n|\r)/gm, "") : null
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
                author_site: SITES_CRAWL.CARMUDI,
                author_location: post_item_location,
                author_code: post_item_code,
                author_url: post_item_url,
                condition: post_item_status
            })

            // this.sendRealtime(
            //     {
            //         message: `✔️ Lưu thành công Item: ${post_item_url}`,
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )
            console.log('Đã lưu: ' + post_item_url)
            return "Completed"
        } catch (error) {
            console.log("CrawlError", error)
            // this.sendRealtime(
            //     {
            //         message: `❌ Lưu thành thất bại Item: ${post_item_url}`,
            //         page,
            //         totalPage
            //     },
            //     realtime
            // )

            await CrawlError.findOrCreate({
                post_item_code,
                author: SITES_CRAWL.CARMUDI,
                post_item_url,
                error_in: "funition get tin",
                error: JSON.stringify(error)
            })
            return error
        }
    }

    async renderUrlWith(condition, brand_slug) {
        brand_slug = brand_slug || null
        let isNew = ""
        let url
        isNew =
            condition === CAR_STATUS.NEW
                ? "-moi"
                : condition === CAR_STATUS.USED
                    ? "-cu"
                    : ""

        if (brand_slug == 'mercedes_benz') url = `xe-o-to-mercedes-benz${isNew}`
        else if (brand_slug == 'landrover') url = `xe-o-to-land-rover${isNew}`
        else if (brand_slug == 'rolls_royce') url = `xe-o-to-rolls-royce${isNew}`
        else {
            let checkBrand = await CarBrand.query().where({ slug: brand_slug }).first()
            if (checkBrand) url = `xe-o-to-${checkBrand.slug}${isNew}`
            else url = `mua-ban-o-to${isNew}`
        }
        return url
    }

    // async sendRealtime(message, realtime, event = "message") {
    //     if (realtime.topic) {
    //         try {
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:carmudi`
    //             )
    //         }
    //     } else {
    //         try {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:carmudi`
    //             )
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) { }
    //     }
    // }

    async getModelthisCar(brand, model) {
        if (!brand || !model) return null
        let brand_slug = underscoreSlug(brand)
        let model_slug = underscoreSlug(model)

        if (brand_slug == 'mazda') {
            brand = await CarBrand.query().where({ slug: brand_slug }).first()
            if (model_slug == '3series' || model_slug == 'mazda3' || model_slug == '3') {
                model_slug = '3'
                model = await brand.models().where({ slug: model_slug }).first()
                return model
            }
            else if (model_slug == 'mazda6') {
                model_slug = '6'
                model = await brand.models().where({ slug: model_slug }).first()
                return model
            } else {
                model = await brand.models().where({ slug: model_slug }).first()
                return model || null
            }
        }
        else if (brand_slug == 'mercedesbenz') {// hãng mercedesbenz  chưa theo chuẩn, cần đồng bộ lại
            return null
            // brand_slug = 'mercedes_benz' // xét về cho đồng bộ
            // let modelDb = await this.findOrCreateModel(model, modelSlug, brand_slug)
            // if (modelDb) model_slug = modelDb.slug // tránh lỗi underfined slug
            // else model_slug = null
            // return model
        }
        else {
            let brandDb = await CarBrand.query().where({ slug: brand_slug }).first()
            if (brandDb) model = await this.findOrCreateModel(brandDb, model, model_slug)
            else return null // không tồn tại hãng này return
        }
        return model
    }

    async findOrCreateModel(brandDb, model, model_slug) { // tìm và tạo model mới
        let brand_id = brandDb.id
        try {
            return await CarModel.findOrCreate(
                {
                    slug: model_slug,
                    brand_id
                },
                {
                    name: model,
                    slug: model_slug,
                    author_site: SITES_CRAWL.CARMUDI,
                    brand_id
                }
            )
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') { // bắt trường hợp nhiều model cùng thêm cùng lúc,  khiến bị dup
                return await CarModel.findOrCreate(
                    {
                        slug: model_slug,
                        brand_id
                    },
                    {
                        name: model,
                        slug: model_slug,
                        author_site: SITES_CRAWL.CARMUDI,
                        brand_id
                    }
                )
            }
        }

    }

    async getAuthorLocation(post_item_location) {
        let author_location_slug = null
        post_item_location = underscoreSlug(post_item_location)
        if (post_item_location == 'ho_chi_minh') return author_location_slug = 'tp-hcm'
        else if (post_item_location == 'ba_ria__vung_tau') return author_location_slug = 'ba-ria-vung-tau'
        else return author_location_slug = post_item_location
    }

    async getCarID(brandName, modelDt, attributeName, carTypeDt, year) { // tìm hoặc tạo car
        attributeName = filterAttribute(attributeName) // lọc 15 G = 15G
        let slug = `${underscoreSlug(brandName)}-${modelDt.slug}-${carTypeDt.slug}-${underscoreSlug(attributeName)}`
        //
        let attribute_id = await this.getAttributeID(modelDt, carTypeDt, attributeName, slug) // tìm hoặc tạo attribute
        //
        let name = `${brandName} ${modelDt.name}\n ${carTypeDt.name} ${attributeName} - ${year}`
        let fullSlug = `${slug}-${year}` // để tạo trường duy nhất
        let car
        try {
            car = await Car.findOrCreate(
                { slug },
                {
                    attribute_id,
                    name,
                    year,
                    slug: fullSlug,
                    author_site: SITES_CRAWL.CARMUDI
                })
            return car.id
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                car = await Car.query().where({ slug }).first()
                return car.id
            }
        }
    }

    async getAttributeID(modelDt, carTypeDt, attributeName, slug) { // tìm hoặc tạo attribute
        let attribute
        attributeName = filterAttribute(attributeName) // lọc 15 G = 15G  
        try {
            attribute = await CarAttribute.query().where({ slug }).first()
            if (attribute) return attribute
            attribute = await CarAttribute.create({
                name: attributeName,
                slug,
                car_type_id: carTypeDt.id,
                model_id: modelDt.id,
                author_site: SITES_CRAWL.CARMUDI
            })
            return attribute.id
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                attribute = await CarAttribute.query().where({ slug }).first()
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
            Cache.removeCache('cars'),
        ])
    }

}

module.exports = CrawlerController
