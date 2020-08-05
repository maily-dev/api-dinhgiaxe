"use strict"

const Car = use("App/Models/Admin/Car")
const Cache = use('App/Helpers/Cache')
const CarCrawl = use("App/Models/CarCrawl")
const { slug } = use('App/Helpers/Utils')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Database = use('Database')

/**
 * Resourceful controller for interacting with cars
 */
class CarController {

    async index({ request, response }) { // lấy danh sách xe trong data, là duy nhất
        try {
            let input = request.get()
            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'

            const cacheName = 'cars'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                dataItem[key] = await Car.query()
                    .filter(input)
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }
    }

    async create({ request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { attribute_id, name, year } = request.post()
            let car = await Car.create({
                attribute_id,
                name,
                year,
                author_site: 'created by admin'
            }, trx)
            let image = request.file('image')
            if (image) {
                let carDir = "images/cars"
                await image.move(Helpers.publicPath(carDir), {
                    overwrite: true
                })
                    .catch(() => {
                        throw { message: "Không thể tải ảnh lên" }
                    })
                car.image = `/${carDir}/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                await car.save(trx)
            }
            await trx.commit()
            await this.clearCache()
            return response.json({ success: true, data: car })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async update({ params, request, response }) {
        let { id } = params
        const trx = await Database.beginTransaction()
        let { attribute_id, name, year, isDeleteImage } = request.post()
        try {
            let data = await Car.findOrFail(id)
            data.attribute_id = attribute_id
            data.name = name
            data.year = year
            let image = request.file('image')
            if (image || isDeleteImage) {
                let carDir = "images/cars"
                if ((data.image && isDeleteImage) || data.image) {
                    await Drive.delete(Helpers.publicPath(data.image))
                        .catch(() => {
                            throw { message: "Không thể xóa ảnh" }
                        })
                }
                if (image) {
                    await image.move(Helpers.publicPath(carDir), { overwrite: true })
                        .catch(() => {
                            throw { message: "Không thể tải ảnh lên" }
                        })
                    data.image = `/${carDir}/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                }
            }
            await data.save(trx)
            await trx.commit()
            await this.clearCache()
            //
            return response.json({ success: true, data })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async destroy({ params, request, response }) {
        const { id } = params
        try {
            let data = await Car.findOrFail(id)
            if (data.image) {
                await Drive.delete(Helpers.publicPath(data.image))
            }
            await data.delete()
            await this.clearCache()
            return response.json({ success: true, data: "Đã xóa!" })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('carCrawls'),
            Cache.removeCache('models'),
            Cache.removeCache('attributes'),
            Cache.removeCache('cars'),
        ])
    }
}

module.exports = CarController
