"use strict"

const Curl = use("App/Helpers/Curl")
const { slug, isSpam, filterAttribute } = use("App/Helpers/Utils")
const CarBrand = use("App/Models/CarBrand")
const CarModel = use("App/Models/CarModel")
const CarAttribute = use("App/Models/CarAttribute")
const CarCrawl = use("App/Models/CarCrawl")
const Error = use("App/Models/Error")
const AuthorLocation = use("App/Models/AuthorLocation")
const Car = use("App/Models/Car")
const FluctuateController = use("App/Controllers/Http/FluctuateController")
const Cache = use('App/Helpers/Cache')

const { CAR_STATUS, SITES_CRAWL } = use("App/Helpers/Enum")

// Websocket
const Ws = use("Ws")
const WsCrawlerController = use("App/Controllers/Ws/CrawlerController")
// CONST
const site = "https://banxehoicu.vn"
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
    ["currentPage", /<a class='active' href='#'>(.*?)<\/a>/],
    ["postList", /<div class='item'>(.*?)So sánh<\/span><\/div>/gs],
    ["postItemLink", /<div class='title'><a href='(.*?)' >.*?<\/a><span class='date'>/],
    ["postItemStatus", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/condition.svg">\s<small>(.*?)<\/small/],
    ["postItemYear", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/build.svg">\s<small>(.*?)<\/small/],
    ["postItemName", /<div class='title'>.*?html' >(.*?)<\/a>.*?<\/span><\/div>/],
    ["postItemPriceStr", /<div class='col price'>.*?Giá xe.*?class='value'>(.*?)<\/span>.*?<\/div>/s],
    ["postItemLocation", /<div class="list-info-detail-item">\s<img src="https:\/\/static.carmudi.vn\/templates\/auto_flatty\/img\/listing\/location.svg">\s<small>(.*?)<\/small/],
    //
    ["postName", /(?<=>Xe).*(?=<\/h1>)/],
    ["postDateUpload", /<div class='item'>.*?<span class='label'>Ngày đăng.*?<span class='value'>(.*?)<\/span>.*?<\/div>/s],
    ["postBrand", /<span class='label'>Hãng xe<\/span>:.*?<span class='value'>(.*?)<\/span>/s],
    ["postModel", /<span class='label'>Loại xe<\/span>:.*?<span class='value'>(.*?)<\/span>/s],
    ["postAttribute", /<span class='label'>Phiên bản<\/span>:.*?<span class='value'>(.*?)<\/span>/s],
    ["postYear", /<span class='label'>Đời xe<\/span>:.*?<span class='value'>(.*?)<\/span>/s],
    [
        "postFrom",
        /<span class='label'>Xuất xứ<\/span>:.*?<span class='value'>(.*?)<\/span>/s
    ],
    [
        "postCarColor",
        /<span class='label'>Màu xe<\/span>:.*?<span class='value'><a href='.*?_blank'>(.*?)<\/a>/s
    ],
    [
        "postItemFuelType",
        /<span class='label'>Nhiên liệu<\/span>:.*?<span class='value'><a href='.*?blank'>(.*?)<\/a><\/span>/s
    ],
    [
        "postCarGearbox",
        /<span class='label'>Hộp số<\/span>:.*?<span class='value'><a href='.*?target='_blank'>(.*?)<\/a><\/span>/s
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
    ],
    [
        "isHasNextPage",
        /<div class='notfound'><span>(.*?)<\/span><\/div>/s
    ],

])

//
class CrawlerController {
    async getCar(https) {
        try {
            // Biến cờ kết thúc function
            WsCrawlerController.isStop = false
            // Đối tượng Realtime
            let realtime = {
                topic: null
            }
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
                brand_slug
            )
            url = encodeURI(url)
            curl.AddHeader(crawlHeader)

            this.sendRealtime(
                {
                    message: `Bắt đầu Crawler data từ site ${SITES_CRAWL.BANXEHOICU}`,
                    page
                },
                realtime
            )
            console.log('Đang crawl data ', SITES_CRAWL.BANXEHOICU)
            //

            for (let index = page; index < 2; index++) {
                // for (let index = page; index > 0; index++) {
                // mở các trang chưa thông tin xe
                if (WsCrawlerController.isStop) {
                    // Kết thúc crawler
                    this.sendRealtime(
                        { message: "DONE!", page },
                        realtime
                    )
                    return "DONE!"
                }
                //

                let responseData = await curl.GET(
                    `${site}/${url}?p=${page}`
                )
                let currentPage = regexs
                    .query("currentPage")
                    .from(responseData.body)
                    .get() // Lấy số trang hiện tại
                let listElementPost = regexs
                    .query("postList")
                    .from(responseData.body) // Lấy danh sách Element chứa bài post
                //
                let posts = listElementPost.map(element => {
                    let post_item_url = regexs
                        .query("postItemLink")
                        .from(element)
                        .get()
                    // let postItemStatus = regexs
                    //     .query("postItemStatus")
                    //     .from(element)
                    //     .get()
                    //     .trim()

                    let post_item_km = element.match(/<div class='col km'>.*?<span class='label'>Đã sử dụng<\/span>:.*?<span class='value'>(.*?) km<\/span>.*?<\/div>/s)
                    post_item_km = post_item_km ? post_item_km[1].replace(/(\r\n|\n|\r)/gm, "").replace('.', '') : 0
                    return {
                        post_item_url,
                        post_item_code: post_item_url.split("-").get().replace(".html", ''),
                        post_item_name: regexs.query('postItemName').from(element).get(),
                        post_item_price_str: regexs
                            .query("postItemPriceStr")
                            .from(element)
                            .get()
                            .replace(/(\r\n|\n|\r)/gm, " "),
                        post_item_km: post_item_km
                    }
                })
                let postArrs = posts.map(
                    async post =>
                        await this.getTin(
                            post.post_item_name,
                            post.post_item_code,
                            post.post_item_url,
                            post.post_item_price_str,
                            post.post_item_km,
                            realtime,
                            page
                        )
                )
                await Promise.all(postArrs)
                this.sendRealtime(
                    {
                        message: "✅ Lấy xong các bài của trang " + currentPage,
                        page
                    },
                    realtime
                )
                console.log('đã lấy: ' + currentPage)
                this.sendRealtime(currentPage, realtime, "process")
                let notNextPage = responseData.body.match(/<div class='notfound'><span>(.*?)<\/span><\/div>/s) // Kiểm tra còn trang tiếp theo không
                if ((notNextPage || []).length) break
            }
            let total = await CarCrawl.where({ author_site: SITES_CRAWL.BANXEHOICU }).count()

            //
            this.sendRealtime(
                { message: `DONE! (${total} items)`, page },
                realtime
            )
            await Cache.removeCache('cars')
            await Cache.removeCache('car-crawls')
            await Cache.removeCache('models')
            await Cache.removeCache('attributes')
            await Cache.removeCache('carTypes')

            return `Crawl completed: ${total} item`
        } catch (error) {
            console.log(error)
        }
    }
    async getTin( // get chi tiết từng xe
        post_item_name,
        post_item_code,
        post_item_url,
        post_item_price_str,
        post_item_km,
        realtime,
        page
    ) {
        if (WsCrawlerController.isStop) {
            // Kết thúc crawler
            throw "DONE!"
        }
        try {
            //
            let post_item_price = this.convertPriceStringToNumber(post_item_price_str)
            if (post_item_price <= 1 * 1e6 || post_item_price > 30 * 1e9) { // giá nhỏ hơn 1 triệu, bỏ qua, hoặc lớn hơn 30 tỷ bỏ qua
                this.sendRealtime(
                    {
                        message: `⚫ Giá không hợp lệ: ${post_item_url}`,
                        page
                    },
                    realtime
                )

                return "Completed"
            }
            let checkStatus = await CarCrawl.where({
                author_code: post_item_code
            }).first()

            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true
            let { body } = await curl.GET(
                encodeURI(post_item_url)
            )

            let post_item_date_upload = regexs
                .get("postDateUpload")
                .from(body)
                .get()
            // .trim()
            post_item_date_upload = post_item_date_upload ? this.convertDate(post_item_date_upload) : null// 2000-10-22, hôm nay -> current day

            if (checkStatus) {
                if (
                    checkStatus.price !== post_item_price ||
                    checkStatus.date_upload !== post_item_date_upload
                ) {
                    let input = {
                        price: post_item_price,
                        date_upload: post_item_date_upload
                    }
                    await checkStatus.merge(input)
                    await checkStatus.save()

                    this.sendRealtime(
                        {
                            message: `🟠 Cập nhật Item: ${post_item_url}`,
                            page
                        },
                        realtime
                    )
                    return "Completed"
                } else {
                    this.sendRealtime(
                        {
                            message: `⚫ Đã tồn tại Item: ${post_item_url}`,
                            page
                        },
                        realtime
                    )
                    return "Completed"
                }
            }
            //---- lấy 5 giá trị quan trọng brand, model, attribute, car_type, year
            let breadcrumb = body.match(/<span itemprop='name'>(.*?)<\/span>/g)
            let brand = regexs
                .query("postBrand")
                .from(body)
                .get()
            let model = regexs
                .query("postModel")
                .from(body)
                .get()
            // if ((breadcrumb || []).length) {
            //     brand = breadcrumb[2] ? breadcrumb[2].replace(/(<([^>]+)>)/gi, "") : null
            //     model = breadcrumb[3] ? breadcrumb[3].replace(/(<([^>]+)>)/gi, "") : null
            // }
            //tiếp tục
            let object = await this.getBrandAndModel(brand, model)
            let brand_slug = object.brand_slug
            let model_slug = object.model_slug
            if (!brand_slug || !model_slug) {
                return "Hãng hoặc dòng xe này không tồn tại"
            }
            let author_location_slug = await this.getAuthorLocation(post_item_location)
            let attributeName = regexs
                .get("postAttribute")
                .from(body)
                .get()
            attributeName = attributeName ? attributeName.replace(/(\r\n|\n|\r)/gm, "") : null
            let attribute_slug = null
            let attribute_id = null
            if (brand != 'Mazda') { // xóa hãng và dòng xe trong thuộc tính, trừ Mazda vì có model 2, 4...
                attributeName = attributeName.toLowerCase()
                let brandLowerCase = brand.toLowerCase()
                let modelLowerCase = model.toLowerCase()
                attributeName = attributeName.replace(brandLowerCase, '').replace(modelLowerCase, '')
                attributeName = attributeName ? attributeName.trim() : ''
            }
            if (attributeName && isSpam(attributeName)) return 'Bỏ qua' // return attribute nếu là tin spam
            else if (attributeName) {
                let result = await this.getAttribute(brand_slug, model_slug, attributeName, car_type_slug) // tìm hoặc tạo attribute
                attribute_slug = result.attribute_slug
                attribute_id = result.attribute_id
            }
            else return "Không có attribute"

            let car_type_slug
            let post_item_car_type = regexs
                .get("postCarType")
                .from(body)
                .get()
            if (!post_item_car_type) {
                this.sendRealtime(
                    {
                        message: `⚫ Không có loại xe: ${post_item_url}`,
                        page
                    },
                    realtime
                )
                return "Completed"
            } else car_type_slug = await getCarType(post_item_car_type, SITES_CRAWL.BANXEHOICU)
            //-----

            let post_item_from = regexs
                .get("postFrom")
                .from(body)
                .get()
            post_item_from = post_item_from ? post_item_from.replace(/(\r\n|\n|\r)/gm, "") : null
            let post_item_color = regexs
                .get("postCarColor")
                .from(body)
                .get()
            post_item_color = post_item_color ? post_item_color.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let post_item_transmission = regexs
                .get("postCarGearbox")
                .from(body)
                .get()
            post_item_transmission = post_item_transmission ? post_item_transmission.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let post_item_fuel_type = regexs
                .get("postItemFuelType")
                .from(body)
                .get()
            post_item_fuel_type = post_item_fuel_type ? post_item_fuel_type.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
            let tableDetail = regexs
                .get("tableDetail")
                .from(body)
                .get()
            let post_item_drivetrain, post_item_engine
            if (tableDetail) {
                post_item_drivetrain = regexs
                    .get("postItemDrivetrain")
                    .from(tableDetail)
                    .get()
                post_item_drivetrain = post_item_drivetrain ? post_item_drivetrain.replace(/(\r\n|\n|\r)/gm, "").toLowerCase() : null
                post_item_engine = regexs
                    .get("postCarEngine")
                    .from(tableDetail)
                    .get()
                post_item_engine = post_item_engine ? post_item_engine.replace(/(\r\n|\n|\r)/gm, "") : null
            }

            await Promise.all([
                CarCrawl.create({
                    brand_slug,
                    model_slug,
                    attribute_slug,
                    attribute_id,
                    year: post_item_year,
                    name: post_item_name,
                    price: post_item_price,
                    priceStr: post_item_price_str,
                    date_upload: post_item_date_upload,
                    origin: post_item_from,
                    car_type_slug,
                    kilomet: post_item_km,
                    color: post_item_color,
                    engine: post_item_engine,
                    fuel_type: post_item_fuel_type,
                    transmission: post_item_transmission,
                    drivetrain: post_item_drivetrain,
                    author_site: SITES_CRAWL.BANXEHOICU,
                    author_location_slug,
                    author_code: post_item_code,
                    author_url: post_item_url,
                    condition: post_item_status
                }),
                Car.findOrCreate(
                    {
                        brand_slug,
                        model_slug,
                        attribute_slug,
                        year: post_item_year,
                        car_type_slug,
                    },
                    {
                        brand_slug,
                        model_slug,
                        attribute_slug,
                        year: post_item_year,
                        car_type_slug,
                        author_site: SITES_CRAWL.BANXEHOICU,
                    }
                )
            ]).catch(error => { })

            this.sendRealtime(
                {
                    message: `✔️ Lưu thành công Item: ${post_item_url}`,
                    page
                },
                realtime
            )

            return "Completed"
        } catch (error) {
            console.log("Error", error)
            this.sendRealtime(
                {
                    message: `❌ Lưu thành thất bại Item: ${post_item_url}`,
                    page
                },
                realtime
            )

            await Error.findOrCreate({
                post_item_code,
                author: SITES_CRAWL.BANXEHOICU,
                post_item_url,
                error_in: "funition get tin",
                error: JSON.stringify(error)
            })
            // console.log(error);
            return error
        }
    }

    async renderUrlWith(brand_slug) {
        let url
        let checkBrand = await CarBrand.where({ slug: brand_slug }).first()
        if (brand_slug == 'mercedes_benz') url = `ban-oto-cu/mercedes-benz`
        else if (brand_slug == 'land_rover') url = `ban-oto-cu/land-rover`
        else if (brand_slug == 'rolls_royce') url = `ban-oto-cu/rolls-royce`
        else if (checkBrand) {
            url = `ban-oto-cu/${checkBrand.slug}`
        }
        else {
            url = `ban-oto-cu`
        }
        return url
    }

    async sendRealtime(message, realtime, event = "message") {
        if (realtime.topic) {
            try {
                realtime.topic.broadcastToAll(event, message)
            } catch (error) {
                realtime.topic = Ws.getChannel(`crawler:*`).topic(
                    `crawler:banxehoicu`
                )
            }
        } else {
            try {
                realtime.topic = Ws.getChannel(`crawler:*`).topic(
                    `crawler:banxehoicu`
                )
                realtime.topic.broadcastToAll(event, message)
            } catch (error) { }
        }
    }

    async getBrandAndModel(brand, model) {
        let brand_slug = null
        let model_slug = null
        // tiep tuc
        return { brand_slug, model_slug }
    }

    async findOrCreateModel(model, modelSlug, brandSlug) {
        let modelDb = await CarModel.findOrCreate(
            {
                slug: modelSlug,
                brand_slug: brandSlug
            },
            {
                name: model,
                brand_slug: brandSlug,
                author_site: SITES_CRAWL.BANXEHOICU,
            }
        )
            .catch(error => { })

        return modelDb
    }

    async getAuthorLocation(post_item_location) {
        // tiep tuc
    }

    async getAttribute(brand_slug, model_slug, attributeName, car_type_slug) {
        let attribute
        let attribute_id
        attributeName = filterAttribute(attributeName) // lọc 15 G = 15G
        let attribute_slug = slug(attributeName)
        try {
            attribute = await CarAttribute.findOrCreate(
                {
                    brand_slug,
                    model_slug,
                    slug: attribute_slug,
                    car_type_slug
                },
                {
                    name: attributeName,
                    brand_slug,
                    model_slug,
                    slug: attribute_slug,
                    car_type_slug,
                    author_site: SITES_CRAWL.BANXEHOICU
                }
            )
            if (attribute) attribute_id = attribute._id  // tránh lỗi findOrCreate chưa xog, đã xuống dưới attribute._id
            return { attribute_slug, attribute_id }
        } catch (error) {
            if (error.code == 11000) {
                attribute = await CarAttribute
                    .where({ brand_slug })
                    .where({ model_slug })
                    .where({ slug: attribute_slug })
                    .where({ car_type_slug })
                    .first()

                if (attribute) attribute_id = attribute._id  // tránh lỗi findOrCreate chưa xog, đã xuống dưới attribute._id
                return { attribute_slug, attribute_id }
            }
        }
    }

    convertPriceStringToNumber(priceString) {
        let price = null
        priceString = priceString.toLowerCase()
        if (priceString.includes('tỷ')) {
            priceString = priceString.replace(',', '.').replace('tỷ', '')
            price = parseFloat(priceString) * 1e9
        } else if ('triệu') {
            priceString = priceString.replace(',', '.').replace('triệu', '')
            price = parseFloat(priceString) * 1e6
        }
        return price
    }

    convertDate(date) {
        // dd/mm/yy to yyyy-mm-dd
        if (date) date = date.toLowerCase()
        if (date == 'hôm nay') {
            let today = new Date()
            let dd = String(today.getDate()).padStart(2, '0')
            let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
            let yyyy = today.getFullYear()
            today = yyyy + '-' + mm + '-' + dd
            return today
        }
        else if (date == 'hôm qua') {
            let today = new Date()
            today.setDate(today.getDate() - 1)
            let dd = String(today.getDate()).padStart(2, '0')
            let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
            let yyyy = today.getFullYear()
            today = yyyy + '-' + mm + '-' + dd
            return today
        }
        else {
            let [day, month, year] = date.split("/")
            date = moment(new Date(year, month - 1, day)).format("YYYY-MM-DD")
        }
        return date
    }

    async getCarType() {
        // tiep tuc
    }

}

module.exports = CrawlerController
