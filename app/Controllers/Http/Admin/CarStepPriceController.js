"use strict"
const CarStepPrice = use("App/Models/CarStepPrice")
const CarCrawl = use("App/Models/CarCrawl") //** */ 
const Car = use("App/Models/Admin/Car") ///*
const { CAR_STATUS, CAR_STEP_PRICE, FEE } = use("App/Helpers/Enum")
const QuantityRow = 2000

class CarStepPriceController {

    // async index(realtimeEvent) {
    async getAnalysis() {
        await CarStepPrice.query().where({ type_2: CAR_STEP_PRICE.NEW_TO_USED }).delete() // xóa bước giá xe mới -> cũ
        let lastPage = await this.getLastPage() // lấy số trang cuối cùng  
        for (let page = 1; page <= lastPage; page++) {
            let cars = await Car.query().paginate(page, QuantityRow) // lấy 1 lần 2000 row để xử lý bước giá
            cars = cars.toJSON()
            let listAvgBrands = []
            let type
            let type_2
            //
            let carWatings = []
            for (let i in cars.data) {
                let car = cars.data[i]
                carWatings.push(car)
                if (carWatings.length == 20 || i == carWatings.length - 1) { // tính bước giá 20 xe cùng lúc
                    let dataArrs = carWatings.map(
                        async car => {
                            let listAvgBrand = {}
                            let [listCarUsed, carNewPrice] = await Promise.all([
                                this.getCarUseds(car.attribute_id),// xe đã qua sử dụng
                                this.getCarNewToCarUsed(car.attribute_id) // lưu bước giá từ xe cũ năm mới nhất đến xe mới năm mới nhất
                            ])
                                .catch(error => console.log(`Error in promises ${error}`))

                            let listAvg = this.getPriceAvgEachYear(listCarUsed) // lấy giá trung bình từng xe theo từng năm
                            listAvgBrand.attribute_id = car.attribute_id
                            listAvgBrand.avg = listAvg
                            listAvgBrands.push(listAvgBrand)
                            console.log('đang tính bước giá')
                        }
                    )
                    carWatings = []
                    await Promise.all(dataArrs)
                        .catch(error => console.log(`Error in promises ${error}`))
                }
                // if (realtimeEvent) {
                //     realtimeEvent(`Phân tích định giá xe: ${listAvgBrand.brand_slug} - ${listAvgBrand.model_slug} - ${listAvgBrand.attribute_slug}`)
                // }
            }

            // 
            let listCarStepPrice = this.getlistAvgBrands(listAvgBrands) // danh sách bước giá các hãng xe theo năm
            let carStepPriceWaitings = []
            for (let i in listCarStepPrice) { // lưu lại bước giá
                let step = listCarStepPrice[i]
                carStepPriceWaitings.push(step)
                if (carStepPriceWaitings.length == 200 || i == listCarStepPrice.length - 1) { // lưu 200 row cùng lúc
                    let dataArrs = carStepPriceWaitings.map(
                        async data =>
                            this.createFluctuate(
                                data.attribute_id,
                                data.from,
                                data.to,
                                data.percent,
                                type,
                                type_2,
                            )
                    )
                    carStepPriceWaitings = []
                    await Promise.all(dataArrs)
                        .catch(error => console.log(`Error in promises ${error}`))
                }
                console.log('đang lưu bước giá')
            }
        }

        return 'Completed'
    }

    async createFluctuate(attribute_id, from, to, percent, type, type_2) {
        type = type || CAR_STEP_PRICE.YEAR // or mothly
        type_2 = type_2 || CAR_STEP_PRICE.USED_TO_USED
        let index = `${attribute_id}-${from}-${to}-${type}-${type_2}`
        try {
            // let checkExist = await CarStepPrice.query().where({ attribute_id, from, to, percent, type, type_2 }).first()
            let checkExist = await CarStepPrice.query().where({ index }).first()
            if (checkExist && checkExist.percent != percent) {
                checkExist.percent = percent
                await checkExist.save()
                return 'Complete'
            }
            await CarStepPrice.findOrCreate(
                { index },
                { attribute_id, from, to, percent, type, type_2, index }
            )
        } catch (error) {
            if (error.code == 'ER_DUP_ENTRY') { // tránh trường hợp tạo nhiều step cùng lúc dẫn đến bị đúp
                let checkExist = await CarStepPrice.query().where({ index }).first()
                if (checkExist && checkExist.percent != percent) {
                    checkExist.percent = percent
                    await checkExist.save()
                    return 'Complete'
                }
            }
        }
    }

    async getCarNewToCarUsed(attribute_id) {
        let carNewPrice = {} // giá xe mới đã qua thuế lăn bánh
        let carUsedPrice = {} // giá xe cũ, theo năm mới nhất
        let [carNews, carUseds] = await Promise.all([
            CarCrawl.query()
                .whereHas('car', builder => builder.where({ attribute_id }))
                .where({ condition: CAR_STATUS.NEW })
                .with('car', builder => builder.select('id', 'year')).fetch(),
            CarCrawl.query()
                .where({ condition: CAR_STATUS.USED })
                .whereHas('car', builder => builder.where({ attribute_id }))
                .with('car', builder => builder.select('id', 'year')).fetch(),
        ])
            .catch(error => console.log(`Error in promises ${error}`))

        carNews = carNews.toJSON()
        if (carNews.length) {
            let years = carNews.reduce(function (r, a) { // lấy giá xe mới theo năm mới nhất
                r[a.car.year] = r[a.car.year] || []
                r[a.car.year].push(a.price)
                return r
            }, Object.create(null))
            let yearMax = Math.max.apply(Math, Object.keys(years))
            let priceRangeYearMax = years[yearMax] // khoảng giá xe mới trong năm mới nhất
            let avg = priceRangeYearMax.reduce((item, current) => item + current, 0) / priceRangeYearMax.length // giá xe mới tb theo năm mới nhất
            //
            let price = avg + FEE + (avg * 10) / 100
            // giá xe lăn bánh: giá trung bình + các chi phí + phí trước bạ 10% 
            // FEE = 22.694.000 bao gồm: Phí sử dụng đường bộ (01 năm). 1.560.000 ₫ Bảo hiểm trách nhiệm dân sự (01 năm). 794.000 ₫ Phí 
            // đăng ký biển số. 20.000.000 ₫. Phí đăng kiểm 340.000 ₫. Tính theo phí Hà Nội
            carNewPrice.year = yearMax.toString()
            carNewPrice.price = price
        }
        carUseds = carUseds.toJSON()
        if (carNews.length && carUseds.length) {
            let years = carUseds.reduce(function (r, a) { // lấy giá cũ mới theo năm mới nhất
                r[a.car.year] = r[a.car.year] || []
                r[a.car.year].push(a.price)
                return r
            }, Object.create(null))
            let yearMax = Math.max.apply(Math, Object.keys(years))
            let priceRangeYearMax = years[yearMax] // khoảng giá xe cũ trong năm mới nhất
            let price = priceRangeYearMax.reduce((item, current) => item + current, 0) / priceRangeYearMax.length // giá xe mới trung bình theo năm mới nhất
            carUsedPrice.year = yearMax.toString()
            carUsedPrice.price = price
        }
        if (((Object.keys(carNewPrice).length) && (Object.keys(carUseds).length))) {
            let from = carNewPrice.year
            let to = carUsedPrice.year
            let percent = parseFloat((((carNewPrice.price - carUsedPrice.price) / carNewPrice.price) * 100).toFixed(2))
            let type = CAR_STEP_PRICE.YEAR
            let type_2 = CAR_STEP_PRICE.NEW_TO_USED
            await this.createFluctuate(attribute_id, from, to, percent, type, type_2)
        }
        return 'Completed'
    }

    async getCarUseds(attribute_id) { // hàm lấy danh sách xe đã sử dụng
        let cars = await CarCrawl.query()
            .whereHas('car', builder => builder.where({ attribute_id }))
            .where({ condition: CAR_STATUS.USED })
            .with('car', builder => builder.select('id', 'year'))
            .fetch()
        return cars = cars.toJSON()
    }

    getlistAvgBrands(listAvgBrands) { // tính bước giá xe theo năm 
        let listCarStepPrice = [].concat(
            ...listAvgBrands.map(item => {
                return item.avg.map((_item, key) => {
                    let nextItem = item.avg[key + 1]
                    if (!nextItem) return null
                    return {
                        attribute_id: item.attribute_id,
                        to: _item.year,
                        from: nextItem.year,
                        percent: parseFloat((((nextItem.avg - _item.avg) / nextItem.avg) * 100).toFixed(2))
                    }
                })
            })
        ).filter(item => item) // loại bỏ item = null  
        return listCarStepPrice
    }

    getPriceAvgEachYear(listCarUsed) { // lấy giá trung bình từng xe theo từng năm
        let allPriceByYear = // chứa tất cả giá, theo từng năm
            listCarUsed.filter(item => !!item.car.year).reduce(function (r, a) {
                r[a.car.year] = r[a.car.year] || []
                r[a.car.year].push(a.price)
                return r
            }, Object.create(null))
        let listAvg // chứa giá tb theo từng năm
        listAvg = Object.keys(allPriceByYear).map(item => {
            return {
                year: item,
                avg:
                    allPriceByYear[item].reduce(
                        (val, val1) =>
                            parseInt(val1) + parseInt(val),
                        0
                    ) / allPriceByYear[item].length
            }
        })
        return listAvg
    }
    // getPriceByYear(cars) {
    //     let years = Array.from(
    //         new Set((cars || []).map(item => item.year))
    //     ).sort()
    //     return years
    // }

    async getStepPriceByAttribute({ params, request, response }) {
        const { attribute_id } = params
        let data = await CarStepPrice.query().where({ attribute_id })
            .fetch()
        return response.json({
            success: true, data
        })
    }

    async getLastPage() { // lấy số trang cuối dùng
        let count = await Car.query().getCount()
        let lasPage = count / QuantityRow
        return Math.ceil(lasPage)
    }
}

module.exports = CarStepPriceController
