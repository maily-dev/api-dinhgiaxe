"use strict"
const Curl = use("App/Helpers/Curl")
const CarBrand = use("App/Models/CarBrand")
const CarCrawl = use("App/Models/CarCrawl")
const CarAttribute = use("App/Models/CarAttribute")
const Car = use("App/Models/Car")
const { convertDate, getCarType, underscoreSlug } = use("App/Helpers/Utils")
const { CAR_STATUS, SITES_CRAWL } = use("App/Helpers/Enum")
const Cache = use('App/Helpers/Cache')
// Websocket
// const Ws = use("Ws")
// const WsCrawlerController = use("App/Controllers/Ws/CrawlerController")
//
class CrawlerController {
    async getNewPrice() {
        try {
            // // Biến cờ kết thúc function
            // WsCrawlerController.isStop = false
            // // Đối tượng Realtime
            // var realtime = {
            //     topic: null
            // }
            // //

            let curl = new Curl()
            curl.followRedirect = false
            curl.FullResponse = true
            let data = await curl.GET(
                "https://vnexpress.net/interactive/2016/bang-gia-xe#all;all"
            )
            let listCar = data.body.match(
                /var listCarsByBrand=(.*?)\;var listPriceChange=/
            )
            listCar = listCar[1]
            listCar = JSON.parse(listCar)
            let date_upload = data.body.match(
                /<span class="tm">Cập nhật: (.*?)<\/span>/
            )
            date_upload = date_upload[1]
            date_upload = convertDate(date_upload) // yyyy-mm-dd
            let year = date_upload.substring(0, 4)
            let cars = Object.keys(listCar).map(item => {
                return {
                    name: item,
                    models: Object.values(listCar[item])
                }
            })
            //
            // this.sendRealtime(
            //     { message: "Bắt đầu Crawler data từ site vnexpress.net" },
            //     realtime
            // )
            //
            for (let i in cars) {
                let car = cars[i]
                let models = car.models
                for (let i in models) {
                    //
                    // if (WsCrawlerController.isStop) {
                    //     // Kết thúc crawler
                    //     this.sendRealtime({ message: "DONE!" }, realtime)
                    //     return "DONE!"
                    // }
                    //
                    let _model = models[i]
                    let carTypeDt
                    let carType = _model.carType // loại xe trên web
                    if (!carType) {
                        // this.sendRealtime(
                        //     {
                        //         message: `⚫ Không có loại xe: ${car}`
                        //     },
                        //     realtime
                        // )
                        console.log('Không có loại xe')
                        continue
                    } else carTypeDt = await getCarType(carType, SITES_CRAWL.VNEXPRESS) // dữ liệu loại xe trong database
                    let name = _model.carName // full name của xe
                    let author_site = SITES_CRAWL.VNEXPRESS
                    let author_url = _model.shareUrl
                    let image = `https://i-vnexpress.vnecdn.net/${_model.carImage}`
                    let brand = _model.carBrand
                    let brandDb = await CarBrand.query()
                        .where("name", brand)
                        .with("models")
                        .first()
                    let result
                    if (brandDb) {
                        brandDb = brandDb.toJSON()
                        result = await this.getAttributeAndName(name, brandDb, carTypeDt)
                        if (!result) continue
                        //
                        let car_id = await this.getCarID(result.carName, result.carSlug, result.attributeID, year, image)
                        let origin
                        if (_model.carOrigin == "Lắp ráp")
                            origin = "Lắp ráp trong nước"
                        if (_model.carOrigin == "Nhập khẩu")
                            origin = "Nhập khẩu"
                        let price = _model.carPriceDeviation // lấy giá đàm phán
                        price = price.replace(".", "")
                        price = parseInt(price) * 1e6
                        //
                        let check = await CarCrawl.query()
                            .where({ car_id })
                            .where({ author_site })
                            .where({ name })
                            .where({ price })
                            .first()
                        // Thêm car nếu chưa có trong DB
                        if (!check) {
                            await CarCrawl.create({
                                car_id,
                                name,
                                price,
                                date_upload,
                                origin,
                                engine: _model.carEngine,
                                transmission: _model.carGear, // Hộp số
                                car_moment: _model.carMoment, // Mô-men xoắn (Nm)
                                car_power: _model.carPower, // Công suất
                                car_size: _model.carSize,
                                car_fuel_tank_capacity:
                                    _model.carFuelTankCapacity, // dung tích bình xăng (mm)
                                car_turning_circle: _model.carTurningCircle, // Đường kính vòng quay tối thiểu (m)
                                author_url,
                                author_site,
                                condition: CAR_STATUS.NEW
                            })
                            // this.sendRealtime(
                            //     {
                            //         message:
                            //             "✔️ Lưu thành công Item: " +
                            //             author_site +
                            //             author_url
                            //     },
                            //     realtime
                            // )
                            console.log('Đã lưu: ' + author_url)
                        } else {
                            if (check.price !== price || check.car_id !== car_id) {
                                let input = {
                                    price,
                                    car_id
                                }
                                await check.merge(input)
                                await check.save()
                                // this.sendRealtime(
                                //     {
                                //         message:
                                //             `🟠 Cập nhật Item: ` +
                                //             author_site +
                                //             author_url
                                //     },
                                //     realtime
                                // )
                                console.log('Đã cập nhật: ' + author_url)
                            } else {
                                // this.sendRealtime(
                                //     {
                                //         message:
                                //             `⚫ Đã tồn tại Item: ` +
                                //             author_site +
                                //             author_url
                                //     },
                                //     realtime
                                // )
                                console.log('Đã tồn tại: ' + author_url)
                            }
                        }
                    }
                    else console.log('Không tìm thấy hãng xe')
                }
            }
            await this.clearCache()
            return "Crawl vnexpress completed"
        } catch (error) {
            console.log(error)
        }
    }

    async getAttributeAndName(fullName, brand, carType) {
        let _model
        let model_slug
        let attribute
        let attribute_slug
        let attributeDb
        switch (brand.name) {
            case "Mazda":
                {

                    let newName = fullName
                        .replace("-", "")
                        .replace("Mazda", "") //CX-8 -> CX8, Mazda3 -> 3

                    _model = newName.split(" ")[0] // tên dòng xe = chữ đầu trong fullname
                    attribute = newName.replace(_model, "")
                    attribute = (attribute != _model ? attribute : "")
                        .trim()
                        .toLowerCase()

                    for (let i in brand.models) {
                        let modelDt = brand.models[i]
                        if (_model.toLowerCase().trim() == modelDt.name.toLowerCase().trim()) {
                            model_slug = modelDt.slug
                            if (attribute) {
                                attribute_slug = underscoreSlug(attribute)
                                let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                                let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                                try {
                                    attributeDb = await CarAttribute.findOrCreate(
                                        {
                                            slug
                                        },
                                        {
                                            name: attribute,
                                            model_id: modelDt.id,
                                            car_type_id: carType.id,
                                            slug,
                                            author_site: SITES_CRAWL.VNEXPRESS,
                                        },

                                    )
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                } catch (error) {
                                    if (error.code == 'ER_DUP_ENTRY') {
                                        attributeDb = await CarAttribute.query().where({ slug }).first()
                                        return { attributeID: attributeDb.id, carName, carSlug: slug }
                                    }
                                }
                            }
                        }
                    }
                }
                break
            case "Nissan":
            case "Isuzu":
                {
                    _model = fullName
                        .split(" ")[0]
                        .replace("-", " ")
                        .toLowerCase().trim() // tên dòng xe = chữ đầu trong fullname, X-Trail 2.0 -> x trail
                    attribute = fullName.replace(_model, "")
                    attribute = (attribute != _model ? attribute : "")
                        .trim()
                        .toLowerCase()
                    for (let i in brand.models) {
                        let modelDt = brand.models[i]
                        let nameModelDt = modelDt.name.toLowerCase()
                        if (
                            _model == nameModelDt ||
                            fullName.toLowerCase().includes(`${nameModelDt} `)
                        ) {
                            // kiểm tra dòng xe tách dc có trong Database
                            model_slug = modelDt.slug
                            if (attribute) {
                                attribute_slug = underscoreSlug(attribute)
                                let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                                let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                                try {
                                    let attributeDb = await CarAttribute.findOrCreate(
                                        {
                                            slug
                                        },
                                        {
                                            name: attribute,
                                            model_id: modelDt.id,
                                            car_type_id: carType.id,
                                            slug,
                                            author_site: SITES_CRAWL.VNEXPRESS,
                                        },

                                    )
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                } catch (error) {
                                    if (error.code == 'ER_DUP_ENTRY') {
                                        attributeDb = await CarAttribute.query().where({ slug }).first()
                                        return { attributeID: attributeDb.id, carName, carSlug: slug }
                                    }
                                }
                            }
                        }
                    }
                }
                break
            case "Infiniti":
                {
                    for (let i in brand.models) {
                        let modelDt = brand.models[i]
                        let nameModelDt = modelDt.name.toLowerCase()
                        if (
                            fullName == nameModelDt ||
                            fullName.includes(`${nameModelDt}`)
                        ) {
                            // kiểm tra dòng xe tách dc có trong Database
                            model_slug = modelDt.slug
                            attribute = fullName.replace(nameModelDt)
                            attribute = (attribute != _model ? attribute : "")
                                .trim()
                                .toLowerCase()
                            if (attribute) {
                                attribute_slug = underscoreSlug(attribute)
                                let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                                let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                                try {
                                    let attributeDb = await CarAttribute.findOrCreate(
                                        {
                                            slug
                                        },
                                        {
                                            name: attribute,
                                            model_id: modelDt.id,
                                            car_type_id: carType.id,
                                            slug,
                                            author_site: SITES_CRAWL.VNEXPRESS,
                                        },

                                    )
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                } catch (error) {
                                    if (error.code == 'ER_DUP_ENTRY') {
                                        attributeDb = await CarAttribute.query().where({ slug }).first()
                                        return { attributeID: attributeDb.id, carName, carSlug: slug }
                                    }
                                }

                            }
                        }
                    }
                }
                break
            case "Renault":
                {
                    _model = fullName.split(" ")[0] // tên dòng xe = chữ đầu trong fullname
                    attribute = fullName.replace(_model, "")
                    attribute = (attribute != _model ? attribute : "")
                        .trim()
                        .toLowerCase()
                    if (_model == "Megan") {
                        // Megan -> megane
                        model_slug = "megane"
                        if (attribute) {
                            attribute_slug = underscoreSlug(attribute)
                            let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                            let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                            try {
                                let attributeDb = await CarAttribute.findOrCreate(
                                    {
                                        slug
                                    },
                                    {
                                        name: attribute,
                                        model_id: modelDt.id,
                                        car_type_id: carType.id,
                                        slug,
                                        author_site: SITES_CRAWL.VNEXPRESS,
                                    },

                                )
                                return { attributeID: attributeDb.id, carName, carSlug: slug }
                            } catch (error) {
                                if (error.code == 'ER_DUP_ENTRY') {
                                    attributeDb = await CarAttribute.query().where({ slug }).first()
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                }
                            }

                        }
                    }
                    for (let i in brand.models) {
                        let modelDt = brand.models[i]
                        if (
                            _model == modelDt.name ||
                            fullName.includes(`${modelDt.name} `)
                        ) {
                            // kiểm tra dòng xe tách dc có trong Database
                            model_slug = modelDt.slug
                            if (attribute) {
                                attribute_slug = underscoreSlug(attribute)
                                let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                                let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                                try {
                                    let attributeDb = await CarAttribute.findOrCreate(
                                        {
                                            slug
                                        },
                                        {
                                            name: attribute,
                                            model_id: modelDt.id,
                                            car_type_id: carType.id,
                                            slug,
                                            author_site: SITES_CRAWL.VNEXPRESS,
                                        },
                                    )
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                } catch (error) {
                                    if (error.code == 'ER_DUP_ENTRY') {
                                        attributeDb = await CarAttribute.query().where({ slug }).first()
                                        return { attributeID: attributeDb.id, carName, carSlug: slug }
                                    }
                                }
                            }
                        }
                    }
                }
                break

            default:
                {
                    _model = fullName.split(" ")[0] // tên dòng xe = chữ đầu trong fullname
                    attribute = fullName.replace(_model, "")
                    attribute = (attribute != _model ? attribute : "")
                        .trim()
                        .toLowerCase()

                    for (let i in brand.models.filter(item => item.slug)) {
                        let modelDt = brand.models[i]
                        if (
                            _model == modelDt.name ||
                            fullName.includes(`${modelDt.name} `)
                        ) {
                            // kiểm tra dòng xe tách dc có trong Database
                            model_slug = modelDt.slug
                            if (attribute) {
                                attribute_slug = underscoreSlug(attribute)
                                let slug = `${brand.slug}-${model_slug}-${carType.slug}-${attribute_slug}`
                                let carName = `${brand.name} ${modelDt.name}\n ${carType.name} ${attribute}`
                                try {
                                    let attributeDb = await CarAttribute.findOrCreate(
                                        {
                                            slug
                                        },
                                        {
                                            name: attribute,
                                            model_id: modelDt.id,
                                            car_type_id: carType.id,
                                            slug,
                                            author_site: SITES_CRAWL.VNEXPRESS,
                                        },

                                    )
                                    return { attributeID: attributeDb.id, carName, carSlug: slug }
                                } catch (error) {
                                    if (error.code == 'ER_DUP_ENTRY') {
                                        attributeDb = await CarAttribute.query().where({ slug }).first()
                                        return { attributeID: attributeDb.id, carName, carSlug: slug }
                                    }
                                }
                            }
                        }
                    }
                }
                break
        }
        return null
    }

    async getCarID(name, slug, attribute_id, year, image) {
        let car
        let fullName = `${name}-${year}`
        let fullSlug = `${slug}-${year}`
        try {
            car = await Car.findOrCreate(
                { slug },
                {
                    attribute_id,
                    slug: fullSlug,
                    name: fullName,
                    year,
                    image,
                    author_site: SITES_CRAWL.VNEXPRESS
                })
            return car.id
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') {
                car = await Car.query().where({ slug: fullSlug }).first()
                return car.id
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
    // async sendRealtime(message, realtime, event = "message") {
    //     if (realtime.topic) {
    //         try {
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:vnexpress`
    //             )
    //         }
    //     } else {
    //         try {
    //             realtime.topic = Ws.getChannel(`crawler:*`).topic(
    //                 `crawler:vnexpress`
    //             )
    //             realtime.topic.broadcastToAll(event, message)
    //         } catch (error) { }
    //     }
    // }
}

module.exports = CrawlerController
