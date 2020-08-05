'use strict'

const CarBrand = use("App/Models/CarBrand")
const Cache = use('App/Helpers/Cache')
const Helpers = use('Helpers')
const Drive = use('Drive')
const Database = use('Database')

/**
 * Resourceful controller for interacting with carbrands
 */
class CarBrandController {

    async index({ request, response }) {
        const cacheName = 'brands'
        let dataItem = await Cache.getCache(cacheName)
        const key = `admin`
        dataItem = dataItem || {}
        if (!dataItem[key]) {
            dataItem[key] = await CarBrand.query()
                .setVisible(['id', 'name', 'slug', 'image', 'created_at'])
                .fetch()
        }
        await Cache.saveCache(cacheName, dataItem) // lưu lại để reset thời gian lưu trong ram
        return response.json({ success: true, data: dataItem[key] })
    }

    async create({ request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { name } = request.post()
            let brand = await CarBrand.create({
                name
            }, trx)
            let image = request.file('image')
            if (image) {
                let brandDir = "images/brands"
                await image.move(Helpers.publicPath(brandDir), {
                    overwrite: true
                })
                    .catch(() => {
                        throw { message: "Không thể tải ảnh lên" }
                    })
                brand.image = `/${brandDir}/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                await brand.save(trx)
            }
            await trx.commit()
            await this.clearCache()
            return response.json({ success: true, data: brand })
        } catch (error) {
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }

    }

    async update({ params, request, response }) {
        let { id } = params
        const trx = await Database.beginTransaction()
        try {
            let { name, isDeleteImage } = request.post()
            let image = request.file('image')
            let data = await CarBrand.findOrFail(id)
            data.name = name
            //
            let brandDir = "images/brands"
            if (image || isDeleteImage) {
                if ((data.image && isDeleteImage) || data.image) {
                    await Drive.delete(Helpers.publicPath(data.image))
                }
                if (image) {
                    await image.move(Helpers.publicPath(brandDir), { overwrite: true })
                        .catch(() => {
                            throw { message: "Không thể tải ảnh lên" }
                        })
                    data.image = `/${brandDir}/${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                }
            }
            await data.save(trx)
            await trx.commit()
            await this.clearCache()
            return response.json({ success: true, data })
        } catch (error) {
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    /**
     * Delete a carbrand with id.
     * DELETE carbrands/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response }) {
        let { id } = params
        try {
            let brand = await CarBrand.findOrFail(id)
            if (brand.image) {
                await Drive.delete(Helpers.publicPath(brand.image))
            }
            await brand.delete()
            await this.clearCache()
            return response.json({ success: true, message: "Đã xóa!" })
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    // Clear Cache Function
    async clearCache() {
        await Promise.all([
            Cache.removeCache('brands'),
            Cache.removeCache('carCrawls'),
            Cache.removeCache('models'),
            Cache.removeCache('attributes')
        ])
    }
}

module.exports = CarBrandController
