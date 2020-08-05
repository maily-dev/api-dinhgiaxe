'use strict'

const CarCrawl = use("App/Models/CarCrawl")
const User = use("App/Models/User")
const CarAttribute = use("App/Models/CarAttribute")
const Car = use("App/Models/Car")
const CarBrand = use("App/Models/CarBrand")
const CarResultHistory = use("App/Models/CarResultHistory")
const CarStepPrice = use("App/Models/CarStepPrice")
const { CAR_STATUS, CONDITION_CAR, FEE } = use("App/Helpers/Enum")
//
const Cache = use('App/Helpers/Cache')
const Helpers = use('Helpers')
// const { existsSync } = require('fs')
// const { registerFont, createCanvas, loadImage } = require('canvas')
const moment = use("moment")
//
class CarValueController {
    async index({ request, response }) { // định giá xe cũ
        try {
            let {
                // brand_slug,
                // model_slug,
                // attribute_slug,
                // car_type_slug,
                attribute_id,
                year,
                mileage,
                condition, // tình trạng xe
                user_id,
                save_result
            } = request.get()

            //
            let [rangePriceMarket, formulaPrice] = await Promise.all([
                this.getRangePriceMarket(attribute_id, year),// khoảng giá thị trường
                this.getPriceByFormula(attribute_id, year) // giá theo công thức
            ])
            //---
            let priceRange = [] // khoảng giá trả về
            if (rangePriceMarket) priceRange.push(rangePriceMarket.min, rangePriceMarket.max) // giá thị trường
            if (formulaPrice) priceRange.push(formulaPrice.value) // giá theo công thức
            let result = { min: null, max: null }
            if (priceRange.length) {
                let minMaxByMileage = this.getMinMaxByMileage(priceRange, mileage) // trả min max dựa theo số kilomet đã đi
                let minMaxByCondition = this.getMinMaxByCondition(minMaxByMileage.min, minMaxByMileage.max, condition) // trả kết quả min max dựa theo tình trạng xe
                result.min = minMaxByCondition.min
                result.max = minMaxByCondition.max
            }

            /**
             * Lấy Car detail
             */
            let carValue = await Car.query()
                .where({ attribute_id })
                .where({ year })
                .select('id', 'name', 'image')
                .firstOrFail()

            let carResultHistory = null
            if (save_result) {
                if (user_id) {
                    let user = await User.findOrFail(user_id)
                    carResultHistory = await CarResultHistory.create(
                        {
                            user_id: user.id,
                            car_id: carValue.id,
                            mileage,
                            condition,
                            min: result.min,
                            max: result.max,
                        },
                    )
                } else {
                    carResultHistory = await CarResultHistory.create({
                        user_id: null,
                        car_id: carValue.id,
                        mileage,
                        condition,
                        min: result.min,
                        max: result.max,
                    })
                }
                await Cache.removeCache('carResultHistories')
                return response.json({
                    success: true,
                    data: {
                        result_id: carResultHistory.id
                    }
                })
            } else {
                return response.json({
                    success: true,
                    data: {
                        mileage,
                        condition,
                        min: result.min,
                        max: result.max,
                        car_id: carValue.id,
                        car: carValue.toJSON()
                    }
                })
            }
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, data: "Lỗi định giá xe" })
        }
    }

    async getPriceByFormula(attribute_id, year) {
        let priceByFormula
        let carNewPrice
        let hasCarNew = await CarCrawl.query()
            .whereHas('car', builder => builder.where({ attribute_id }).where({ year }))
            .where({ condition: CAR_STATUS.NEW })
            .with('car', q => q.select('id', 'year'))
            .fetch()
        hasCarNew = hasCarNew.toJSON()

        if (hasCarNew.length) {
            let prices = []
            let years = hasCarNew.reduce(function (r, a) {
                r[a.car.year] = r[a.car.year] || []
                r[a.car.year].push(a.price)
                return r
            }, Object.create(null))

            let priceRangeYearMax =
                years[Math.max.apply(Math, Object.keys(years))] // khoảng giá trong năm mới nhất

            let avg = priceRangeYearMax.reduce((item, current) => item + current, 0) / priceRangeYearMax.length // giá trung bình theo năm mới nhất
            //
            carNewPrice = avg + FEE + (avg * 10) / 100
            //--- giá xe lăn bánh: giá trung bình + các chi phí + phí trước bạ 10% 
            // 22.694.000 bao gồm: Phí sử dụng đường bộ (01 năm). 1.560.000 ₫ Bảo hiểm trách nhiệm dân sự (01 năm). 794.000 ₫ Phí 
            // đăng ký biển số. 20.000.000 ₫. Phí đăng kiểm 340.000 ₫. Tính theo phí Hà Nội 
            let carStepPrices = await CarStepPrice.query()
                .whereHas('attribute', builder => {
                    builder.where({ id: attribute_id })
                        .whereHas('cars', builder => {
                            builder.where({ year })
                        })
                })
                .fetch()
            carStepPrices = carStepPrices.toJSON()
            carStepPrices = carStepPrices.map(item => {
                return {
                    from: item.from,
                    to: item.to,
                    percent: item.percent
                }
            }).sort(this.compare)

            if (!carStepPrices.length) return priceByFormula // không có bước giá trả về rỗng
            let priceCurrent = carNewPrice
            for (let i = 0; i < carStepPrices.length; i++) {
                let carStepPrice = carStepPrices[i]
                // console.log(
                //     `years: fluctuate from: ${carStepPrice.from} to: ${carStepPrice.to}: ${priceCurrent} * (100 - ${carStepPrice.percent}) / 100 = `,
                //     (priceCurrent * (100 - carStepPrice.percent)) / 100
                // )
                let price = {}
                price.year = carStepPrice.to
                price.value = (priceCurrent * (100 - carStepPrice.percent)) / 100
                priceCurrent = price.value
                prices.push(price)
            }
            priceByFormula = prices.find(item => item.year == year)
        }
        return priceByFormula
    }

    async getRangePriceMarket(attribute_id, year) {
        let max
        let min
        let listsCar = await CarCrawl.query()
            .whereHas('car', builder => builder.where({ attribute_id }).where({ year }))
            .where({ condition: CAR_STATUS.USED })
            .fetch()

        listsCar = listsCar.toJSON()
        if (!listsCar.length) return
        let prices = listsCar.map(item => item.price)
        max = Math.max.apply(Math, prices)
        min = Math.min.apply(Math, prices)
        return { max, min }
    }

    compare(a, b) { // sắp sếp lớn đến nhỏ
        if (a.from < b.from) {
            return 1
        }
        if (a.from > b.from) {
            return -1
        }
        return 0
    }

    getMinMaxByMileage(priceRange, mileage) {

        let min = null
        let max = null
        if (!priceRange.length) return { min, max } // không có khoảng giá
        let minPrice = Math.min.apply(Math, priceRange)
        let maxPrice = Math.max.apply(Math, priceRange)

        if (maxPrice === minPrice) return {
            min: minPrice,
            max: maxPrice
        }
        let step = (maxPrice - minPrice) / 6 // để tính 6 đoạn giá min max
        mileage = parseInt(mileage)

        let range = Array.from(Array(parseInt(maxPrice / step)).keys()).reduce((total, item) => { // 6 đoạn giá
            if (total.length < 6)
                total.push([
                    maxPrice - step * item,
                    maxPrice - step * (item + 1)
                ])
            return total
        }, [])
        let rangeIndex
        if (mileage <= 20000) rangeIndex = 0
        else if (20000 < mileage && mileage <= 40000) rangeIndex = 1
        else if (40000 < mileage && mileage <= 60000) rangeIndex = 2
        else if (60000 < mileage && mileage <= 80000) rangeIndex = 3
        else if (80000 < mileage && mileage <= 100000) rangeIndex = 4
        else if (100000 < mileage) rangeIndex = 5
        max = range[rangeIndex][0]
        min = range[rangeIndex][1]
        return { min, max }
    }

    // async getResultImage({ params, request, response }) {
    //     //
    //     function vnd(value) {
    //         if (value >= 1e9) {
    //             let ti = parseInt(value / 1e9)
    //             let tr = value - ti * 1e9

    //             return (ti + ' Tỷ ' + (tr > 0 ? (tr / 1e6).toFixed(1) + ' Tr' : '')).trim()
    //         }
    //         return (value / 1e6).toFixed(1) + ' Triệu'
    //     }
    //     function wrapText(context, text, x, y, maxWidth, lineHeight) {
    //         var words = text.split(' ')
    //         var line = ''

    //         for (var n = 0; n < words.length; n++) {
    //             var testLine = line + words[n] + ' '
    //             var metrics = context.measureText(testLine)
    //             var testWidth = metrics.width
    //             if (testWidth > maxWidth && n > 0) {
    //                 context.fillText(line, x, y)
    //                 line = words[n] + ' '
    //                 y += lineHeight
    //             }
    //             else {
    //                 line = testLine
    //             }
    //         }
    //         context.fillText(line, x, y)
    //         return y
    //     }

    //     var can
    //     //
    //     let {
    //         data
    //     } = params

    //     let urlParams = new URLSearchParams(Buffer.from(data, 'base64').toString())

    //     //
    //     let {
    //         brand_name,
    //         model_name,
    //         attribute_name,
    //         year,
    //         mileage,
    //         avg,
    //         max,
    //         min,
    //         rate = 4,
    //         condition,
    //         image,
    //         car_type,
    //     } = Object.fromEntries(urlParams)
    //     //
    //     const width = 1200
    //     const height = 630

    //     const canvas = createCanvas(width, height)
    //     const context = canvas.getContext('2d')
    //     //
    //     registerFont(Helpers.publicPath() + '/images/img_render/fonts/Roboto/Roboto-Light.ttf', { family: 'RobotoLight' })
    //     registerFont(Helpers.publicPath() + '/images/img_render/fonts/Roboto/Roboto-Black.ttf', { family: 'RobotoBlack' })

    //     //
    //     context.fillStyle = '#141526'
    //     context.fillRect(0, 0, width, height)
    //     //
    //     const imageBg = await loadImage(Helpers.publicPath() + '/images/img_render/bg_1.png')
    //     context.drawImage(imageBg, 0, 0, width, height)

    //     //
    //     let starX = width / 4 + 10
    //     //
    //     context.textAlign = 'center'
    //     context.font = '26px RobotoBlack'
    //     context.fillStyle = '#fff'
    //     let starY = wrapText(context, `${brand_name} ${model_name} ${attribute_name} - ${year}`, starX, 370, 370, 28) + 36

    //     //
    //     //
    //     context.textAlign = 'center'
    //     context.font = '64px RobotoBlack'
    //     context.fillStyle = '#fff'
    //     context.fillText(vnd(parseFloat(avg)), width / 2 + width / 4, 450)
    //     //
    //     context.font = '24px RobotoLight'
    //     context.fillStyle = '#ccc'
    //     context.fillText(`${vnd(parseFloat(min))} - ${vnd(parseFloat(max))}`, width / 2 + width / 4, 570)
    //     //
    //     //
    //     context.font = '20px RobotoLight'
    //     context.fillStyle = '#ccc'
    //     context.fillText(`Kiểu xe: ${car_type}`, starX, starY)
    //     //
    //     //
    //     const imageStart = await loadImage(Helpers.publicPath() + '/images/img_render/star.png')
    //     const imageUnStart = await loadImage(Helpers.publicPath() + '/images/img_render/unstar.png')

    //     context.textAlign = 'center'
    //     starY = starY + 20
    //     for (let index = 0; index <= 5; index++) {
    //         if (index <= rate) {

    //             context.drawImage(imageStart, starX + 25 * index - 72, starY, 20, 20)
    //         } else {
    //             context.drawImage(imageUnStart, starX + 25 * index - 72, starY, 20, 20)

    //         }

    //     }


    //     context.font = '20px RobotoLight'
    //     context.fillStyle = '#ccc'
    //     starY = starY + 60
    //     context.fillText(`Đã đi: ${mileage}KM`, starX, starY)
    //     starY = starY + 26
    //     context.fillText(`Tình trạng xe: ${condition}`, starX, starY)
    //     // Vẽ ảnh xe
    //     if (existsSync(Helpers.publicPath() + image)) {

    //         context.fillStyle = '#141526'
    //         let imageW = 260
    //         context.fillRect(width / 4 - imageW / 2, 200, imageW, 140)
    //         // 300x400 require image
    //         const imageCar = await loadImage(Helpers.publicPath() + image)
    //         let _as = imageW * 100 / imageCar.width

    //         context.drawImage(imageCar, width / 4 - imageW / 2 + 10, 212, imageW, _as * imageCar.height / 100)

    //     }

    //     const buffer = canvas.toBuffer('image/png')
    //     // fs.writeFileSync('./test.png', buffer)
    //     response.header('Content-type', 'image/png')
    //     response.send(buffer)
    // }

    getMinMaxByCondition(min, max, condition) {
        let conditionByCarValue // trừ phần trăm khấu hao tình trạng theo giá trị xe
        if (max >= 10 * 1e9) conditionByCarValue = 2 / 100
        else if (max >= 4 * 1e9) conditionByCarValue = 1.5 / 100
        else if (max >= 2 * 1e9) conditionByCarValue = 1 / 100
        else conditionByCarValue = 0
        if (condition == 'excellent') {
            return { min, max }
        }
        else if (condition == 'very_good') {
            return {
                min: min * CONDITION_CAR.VERY_GOOD_MIN,
                max: max * CONDITION_CAR.VERY_GOOD_MAX
            }
        }
        else if (condition == 'good') {
            return {
                min: min * (CONDITION_CAR.GOOD_MIN + conditionByCarValue),
                max: max * (CONDITION_CAR.GOOD_MAX + conditionByCarValue)
            }
        }
        else {
            return {
                min: min * (CONDITION_CAR.BAD_MIN + conditionByCarValue),
                max: max * (CONDITION_CAR.BAD_MAX + conditionByCarValue)
            }
        }
    }
}

module.exports = CarValueController
