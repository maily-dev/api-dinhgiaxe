'use strict'

const Task = use('Task')
const BonBanh = use('App/Controllers/Http/Crawler/Bonbanh/CrawlerController')
const Carmudi = use('App/Controllers/Http/Crawler/Carmudi/CrawlerController')
const Vnexpress = use('App/Controllers/Http/Crawler/Vnexpress/CrawlerController')
// const CarStepPrice = use('App/Controllers/Http/CarStepPriceController')
class Index extends Task {
    static get schedule() {
        return '0 0 * * 0' // At 00:00 on Sunday
        // return '* * * * *' // 1m
    }

    async handle() {
        this.crawlData() // bắt đầu crawl data
    }
    bonBanh() {
        let bonBanh = new BonBanh()
        return bonBanh.getCar()

    }
    vnexpress() {
        let vnexpress = new Vnexpress()
        return vnexpress.getNewPrice()
    }
    // carStepPrice() {
    //     let carStepPrice = new CarStepPrice()
    //     return carStepPrice.index()
    // }
    carmudi() {
        let carmudi = new Carmudi()
        return carmudi.getCar()
    }

    async crawlData() {
        try {
            await Promise.all([
                this.bonBanh(),
                this.vnexpress(),
                this.carmudi(),
            ])
            // await this.carStepPrice() // tính bước giá
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Index
