'use strict'
const Helpers = use('Helpers')
const Cache = use('App/Helpers/Cache')
const CarType = use("App/Models/Admin/CarType")
const Drive = use('Drive')
const Database = use('Database')
class CarTypeController {
    async index({ request, response }) { // lấy danh sách carType  
        try {
            let input = request.get()
            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'

            const cacheName = 'carTypes'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                dataItem[key] = await CarType.query()
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

    async getCarTypeByConditions({ request, response }) { // lấy kiểu xe theo  model_id và năm
        let { model_id, year } = request.get()
        try {
            let carTypeCache = await Cache.getCache('carTypes')
            let key = `admin-carTypes-${model_id}-${year}` // key lấy data
            carTypeCache = carTypeCache || {}
            if (!carTypeCache[key]) {
                carTypeCache[key] = await CarType.query()
                    .whereHas('attributes', builder => {
                        builder.where({ model_id })
                    })
                    .whereHas('cars', builder => {
                        builder.where({ year })
                    })
                    .fetch()
            }
            await Cache.saveCache('carTypes', carTypeCache)
            return response.json({
                success: true,
                data: carTypeCache[key],
            })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }

    }

    async create({ request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { name } = request.post()
            let carType = await CarType.create({
                name
            }, trx)

            let image = request.file('image')
            if (image) {
                let imageUrl = `/images/car-type/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                await image.move(Helpers.publicPath(), {
                    name: imageUrl,
                    overwrite: true
                })
                    .catch(() => {
                        throw { message: "Không thể tải ảnh lên" }
                    })
                carType.image = imageUrl
                await carType.save(trx)
            }
            await trx.commit()
            await this.clearCache()
            return response.json({ success: true, data: carType })
        } catch (error) {
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async update({ params, request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { id } = params
            let { name, isDeleteImage } = request.post()
            let carType = await CarType.find(id)
            carType.name = name
            // cập nhật hình ảnh
            let image = request.file('image')
            if (image || isDeleteImage) {
                if (carType.image) {
                    await Drive.delete(Helpers.publicPath(carType.image))
                        .catch(() => {
                            throw { message: "Không thể xóa ảnh" }
                        })
                }
                if (image) {
                    let imageUrl = `/images/car-type/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                    await image.move(Helpers.publicPath(), {
                        name: imageUrl,
                        overwrite: true
                    })
                        .catch(() => {
                            throw { message: "Không thể tải ảnh lên" }
                        })
                    carType.image = imageUrl
                }

            }
            await carType.save(trx)
            await trx.commit()
            await this.clearCache()
            //
            return response.json({ success: true, data: carType })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async destroy({ params, request, response }) {
        const { id } = params
        try {
            let carType = await CarType.find(id)
            if (!carType) return response.json({ success: true, message: 'Loại xe không tồn tại' })
            await carType.delete()
            if (carType.image) {
                await Drive.delete(Helpers.publicPath(carType.image))
                    .catch(() => {
                        throw { message: "Không thể xóa ảnh" }
                    })
            }
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
            Cache.removeCache('carTypes')
        ])
    }
}

module.exports = CarTypeController
