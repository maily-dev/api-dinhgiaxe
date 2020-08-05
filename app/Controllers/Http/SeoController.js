'use strict'

const { registerFont, createCanvas, loadImage } = require('canvas')
const Helpers = use('Helpers')
var fs = require('fs')

/**
 * Resourceful controller for interacting with seos
 */
class SeoController {

    async formatImage(imgPath, maxWidth) {
        // Ghi Logo vào hình ảnh
        try {
            registerFont(Helpers.publicPath() + '/fonts/Roboto/Roboto-Black.ttf', { family: 'RobotoBlack' })
            const imageBg = await loadImage(imgPath)
            let width = imageBg.width
            let height = imageBg.height
            if (maxWidth) {
                if (width > maxWidth) {
                    height = (maxWidth / width) * imageBg.height
                    width = maxWidth
                }

            }
            console.log(width)
            console.log(height)
            const canvas = createCanvas(width, height)
            const context = canvas.getContext('2d')
            context.fillStyle = '#fff'
            context.fillRect(0, 0, width, height)
            context.drawImage(imageBg, 0, 0, width, height)
            context.textAlign = 'left'
            context.textBaseline = 'top'
            let fontSize = 2 * width / 100
            if (fontSize < 18) fontSize = 18
            context.font = `${fontSize}px RobotoBlack`
            //
            context.shadowColor = "rgba(0, 0, 0, 0.8)"
            context.shadowBlur = 7
            context.fillStyle = "rgba(255, 255, 255, 1)"
            context.fillText("Dinhgiaxe.vn", 25, 20)
            const buffer = canvas.toBuffer('image/jpeg')
            await fs.writeFile(imgPath, buffer, { flag: 'w' }, function () {
            })
        } catch (error) {
            console.log(error)
        }
    }
    async index({ request, response, view }) {
    }

    /**
     * Render a form to be used for creating a new seo.
     * GET seos/create
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async create({ request, response, view }) {
    }

    /**
     * Create/save a new seo.
     * POST seos
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async store({ request, response }) {
    }

    /**
     * Display a single seo.
     * GET seos/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async show({ params, request, response, view }) {
    }

    /**
     * Render a form to update an existing seo.
     * GET seos/:id/edit
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async edit({ params, request, response, view }) {
    }

    /**
     * Update seo details.
     * PUT or PATCH seos/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params, request, response }) {
    }

    /**
     * Delete a seo with id.
     * DELETE seos/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response }) {
    }
}

module.exports = SeoController
