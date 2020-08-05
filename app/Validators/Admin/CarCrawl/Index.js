'use strict'
const { SITES_CRAWL } = use("App/Helpers/Enum")
class CarCrawl {
    get rules() {
        return {
            brandID: "exists:03_01_car_brands,id",
            modelID: "exists:03_02_car_models,id",
            carTypeID: "exists:03_03_car_types,id",
            sortBy: 'in:created_at,updated_at,name,year',
            sort: 'in:desc,asc',
            keyword: 'max:100',
            authorSite: `in:${SITES_CRAWL.BONBANH},${SITES_CRAWL.VNEXPRESS},${SITES_CRAWL.CARMUDI},${SITES_CRAWL.BANXEHOICU}`
        }
    }

    get sanitizationRules() {
        return {
            brandID: "trim",
            modelID: "trim",
            carTypeID: "trim",
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "brandID.exists": "Hãng không tồn tại",
            "modelID.exists": "Dòng xe không tồn tại",
            "carTypeID.exists": "Kiểu xe không tồn tại",
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, name",
            "sort.in": "Sắp xếp theo: desc, asc",
            'keyword.max': 'Keyword không quá 100 từ',
            'authorSite.in': `in:${SITES_CRAWL.BONBANH},${SITES_CRAWL.VNEXPRESS},${SITES_CRAWL.CARMUDI},${SITES_CRAWL.BANXEHOICU}`
        }
    }
}

module.exports = CarCrawl
