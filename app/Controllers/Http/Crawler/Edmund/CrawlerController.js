"use strict"
const axios = require('axios')
const { convertDate, slug, isSpam, getCarType, filterAttribute } = use("App/Helpers/Utils")
const BrandEdmund = use("App/Models/BrandEdmund")
const ModelEdmund = use("App/Models/ModelEdmund")
const AttributeEdmund = use("App/Models/AttributeEdmund")
const ColorEdmund = use("App/Models/ColorEdmund")
const OptionEdmund = use("App/Models/OptionEdmund")
const CarType = use("App/Models/CarType")
const Error = use("App/Models/Error")
const Car = use("App/Models/Car")
const FluctuateController = use("App/Controllers/Http/FluctuateController")
const Cache = use('App/Helpers/Cache')

const { CAR_STATUS, SITES_CRAWL } = use("App/Helpers/Enum")

// Websocket
const Ws = use("Ws")
const WsCrawlerController = use("App/Controllers/Ws/CrawlerController")
const config = {
    method: 'get'
}
// CONST
class CrawlerController {
    async crawlBrand({ request, response }) {
        try {
            config.url = 'https://www.edmunds.com/gateway/api/vehicle/v4/makes/'
            let { data } = await axios(config)
            //
            let brands = Object.values(data.results)
            let brandDts = []
            for (let brand of brands) {
                let brandDt = await BrandEdmund.findOrCreate({ name: brand.name })
                let modelDts = await this.crawlModel(brandDt.slug) // crawl model
                let modelWatings = []
                for (let i in modelDts) {
                    let model = modelDts[i]
                    modelWatings.push(model)
                    if (modelWatings.length == 20 || i == modelDts.length - 1) {
                        let promiseModel = modelWatings.map(async model => {
                            let years = await this.getYears(brandDt.slug, model.slug) // lấy các năm có dòng xe 
                            await this.crawlAttribute(brandDt.slug, model.slug, years) // crawl thuộc tính theo hãng, dòng xe, năm
                        })
                        modelWatings = []
                        await Promise.all(promiseModel)
                            .catch(error => console.log(`Error in promises ${error}`))
                    }
                    // break ////
                }
                // brandDt.modelDts = modelDts
                // brandDts.push(brandDt)
                // break ///
            }
            console.log('Hoàn thành')
            return 'Hoàn thành'
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false })
        }
    }

    async crawlModel(brandSlug) {
        try {
            config.url = `https://www.edmunds.com/gateway/api/vehicle/v4/makes/${brandSlug}/submodels/`
            let { data } = await axios(config)
            let models = Object.values(data.results)
            let modelDts = []
            for (let model of models) {
                let modelDt = await ModelEdmund.findOrCreate({
                    name: model.name,
                    brand_slug: brandSlug
                })
                modelDts.push(modelDt)
            }
            return modelDts
        } catch (error) {
            console.log(error)
        }
    }
    async getYears(brandSlug, modelSlug) {
        try {
            config.url = `https://www.edmunds.com/gateway/api/vehicle/v4/makes/${brandSlug}/models/${modelSlug}/years`
            let { data } = await axios(config)
            let models = Object.values(data.results)
            let fullYears = []
            for (let model of models) {
                let years = Object.keys(model.years)
                for (let year of years) {
                    fullYears.push(year)
                }
            }
            let years = Array.from(
                new Set(fullYears.map(item => item))
            )
            return years
        } catch (error) {
            console.log(error)
        }
    }

    async crawlAttribute(brandSlug, modelSlug, years) {
        try {
            let attributeDts = []
            let yearGeting
            for (let year of years) {
                yearGeting = year
                config.url = `https://www.edmunds.com/gateway/api/vehicle/v4/makes/${brandSlug}/models/${modelSlug}/years/${yearGeting}/styles/`
                let { data } = await axios(config)
                let attributes = Object.values(data.results)
                for (let attribute of attributes) {
                    let getNameAndCarType = await this.getNameAndCarType(attribute.name) // lấy xe loại xe
                    if (!getNameAndCarType.nameAttribute || !getNameAndCarType.carTypeSlug) continue
                    let [
                        colors,
                        // options
                    ] = await Promise.all([
                        this.getColors(attribute.id),
                        // this.getOptions(attribute.id),
                    ])
                    await this.processCreateAttribute(
                        attribute.id,
                        getNameAndCarType.nameAttribute,
                        getNameAndCarType.carTypeSlug,
                        attribute.makeSlug,
                        attribute.modelSlug,
                        attribute.year,
                        attribute.numberOfSeats,
                        colors,
                        options
                    )
                    console.log(`Đã lấy:, ${brandSlug} - ${modelSlug} - ${year} - ${attribute.name}`) ///
                    // attributeDts.push(attributeDt)
                }
            }
            return attributeDts

        } catch (error) {
            console.log(error)
        }
    }

    async getNameAndCarType(nameAttribute) {
        try {
            nameAttribute = nameAttribute.toLowerCase()
            let carTypeSlug = null
            let carTypeCache = await Cache.getCache('carTypes')
            let key = `all-carTypes` // key lấy data
            carTypeCache = carTypeCache || {}
            if (!carTypeCache[key]) {
                carTypeCache[key] = await CarType.query()
                    .setVisible(['_id', 'name', 'slug'])
                    .fetch()
                carTypeCache[key] = carTypeCache[key].toJSON()
                await Cache.saveCache('carTypes', carTypeCache)
            }
            for (let carType of carTypeCache[key]) {
                if (nameAttribute.includes(carType.name)) {
                    carTypeSlug = carType.slug
                    nameAttribute = nameAttribute.replace(`${carType.name} `, '')
                    return { nameAttribute, carTypeSlug }
                }
            }
            return { nameAttribute, carTypeSlug }
        } catch (error) {
        }

    }

    async getColors(attribute_id) {
        try {
            config.url = `https://www.edmunds.com/gateway/api/vehicle/v2/styles/${attribute_id}/colors/?fmt=json&category=Exterior`

            let { data } = await axios(config)
            let colors = Object.values(data.colors)
            colors = colors.map(item => item.name)
            colors = JSON.stringify(colors)
            return colors
            // let colors_ids = []
            // for (let color of colors) {
            //     let name = color.name.toLowerCase()
            //     let colorDt = await ColorEdmund.findOrCreate(
            //         { name },
            //         {
            //             // edmund_id: color.id,
            //             name,
            //             category: 'exterior'
            //         }
            //     )
            //     colors_ids.push(colorDt._id)
            //     let attribute = await AttributeEdmund.where({ edmund_id: attribute_id }).first()
            //     await attribute.colors().attach(colors_ids)
            // }
            // return 'Completed'
        } catch (error) {
            console.log(error)
        }
    }

    async getOptions(attribute_id) {
        try {
            config.url = `https://www.edmunds.com/gateway/api/vehicle/v2/styles/${attribute_id}/equipment?availability=USED`

            let { data } = await axios(config)
            let equipments = Object.values(data.equipment)
            let options = equipments.map(item => item.name)
            options = options.join(' | ')
            //// 
            let configTranslate = {
                method: 'get',
                url: 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en-US&tl=vi&hl=en-US&dt=bd&dj=1&q=' + options,

            }
            let res = await axios(configTranslate)
            options = (res.data.sentences || []).map(item => {
                return {
                    translated: item.trans.replace(' | ', ''),
                    orign: item.orig.replace(' |', '')
                }
            })
            options = JSON.stringify(options)
            return options
            // let equipment_ids = []
            // for (let equipment of equipments) {
            //     let name = equipment.name.toLowerCase()
            //     let optionDt = await OptionEdmund.findOrCreate(
            //         {name }
            //     )
            //     equipment_ids.push(optionDt._id)
            //     let attribute = await AttributeEdmund.where({ edmund_id: attribute_id }).first()
            //     await attribute.options().attach(equipment_ids)
            // }
            // return 'Completed'
        } catch (error) {
            console.log(error)
        }
    }

    async processCreateAttribute(edmund_id, name, car_type_slug, brand_slug, model_slug, year, number_of_seats, colors, options) {
        let attribute = await AttributeEdmund.where({ edmund_id }).first()
        if (attribute) {
            if (attribute.colors != colors || attribute.options != options) {
                attribute.colors = colors
                attribute.options = options
                await attribute.save()
                console.log('Đã cập nhật: ' + edmund_id)
            }
        } else {
            attribute = await AttributeEdmund.create({
                name,
                car_type_slug,
                edmund_id,
                // slug: attribute.niceId,
                brand_slug,
                model_slug,
                year,
                number_of_seats,
                colors,
                options,
            })
        }
        return attribute
    }

}

module.exports = CrawlerController
