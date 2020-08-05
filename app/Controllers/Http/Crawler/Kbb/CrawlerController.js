"use strict"
const axios = require('axios')
const Curl = use("App/Helpers/Curl")
const { convertDate, slug, isSpam, getCarType, filterAttribute } = use("App/Helpers/Utils")
const BrandKbb = use("App/Models/BrandKbb")
const ModelKbb = use("App/Models/ModelKbb")
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
const site = "https://www.kbb.com/car-prices/"
const url = "https://www.kbb.com/carpath/api/"
let graphQL = {
    "operationName": "makesQuery",
    "query": "query makesQuery($year: String) {data: makes(vehicleClass: \"UsedCar\", yearId: $year) {value: id text: name    __typename}}",
    "variables": {}
}
//
class CrawlerController {
    async crawlBrand({ request, response }) {
        try {
            let graphQL = JSON.stringify({
                "operationName": "makesDropdown",
                "query": "query makesDropdown {  list: dropdownmakes {    text: name    value: name    __typename  }}",
                "variables": {}
            })

            let config = {
                method: 'post',
                url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: graphQL
            }

            let { data } = await axios(config)
            //
            let listBrands = data.data.list
            let brands = []
            for (let brand of listBrands) {
                let brandDt = await BrandKbb.findOrCreate({
                    name: brand.text
                })
                let graphQLModel = JSON.stringify({
                    "operationName": "modelsDropdown",
                    "variables": { "make": `${brand.text}` },
                    "query": "query modelsDropdown($make: String) {  list: dropdownmodels(make: $make) {    text: name    value: name    __typename  }}"
                })
                let config = {
                    method: 'post',
                    url,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: graphQLModel
                }
                let content = await axios(config)
                let dataModel = content.data
                let listModels = dataModel.data.list
                let models = []
                for (let model of listModels) {
                    let modelDt = await ModelKbb.findOrCreate({
                        name: model.text,
                        brand_slug: data.slug
                    })
                    models.push(modelDt)
                }
                brandDt.models = models
                brands.push(brandDt)
            }
            return response.json({ success: true, data: brands })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false })
        }
    }


}

module.exports = CrawlerController
