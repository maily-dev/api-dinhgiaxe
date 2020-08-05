'use strict'
const User = use("App/Models/User")
const CarModel = use("App/Models/CarModel")
const CarAttribute = use("App/Models/CarAttribute")
const Cache = use('App/Helpers/Cache')
const Route = use('Route')
const Drive = use('Drive')
const Database = use('Database')
const CarCrawl = use("App/Models/CarCrawl") //** */ 
const Car = use("App/Models/Car") //** */ 
var Stream = require('stream')
const Helpers = use('Helpers')
const quantityRow = 100
//
Route.get("/test", async ({ request, response }) => {
    const trx = await Database.beginTransaction()
    try {
        let car = await Car.findOrCreate(
            {
                attribute_id: 'ad12f0de-b2e7-419a-a3c8-41775911daad',
                name: 'test tran 123',
                slug: '123456',
                year: '2018'

            },
            {
                attribute_id: 'ad12f0de-b2e7-419a-a3c8-41775911daad',
                name: 'test tran 123',
                slug: '123456',
                year: '2018'

            }
            ,
            trx
        )

        const image = request.file('image', {
            types: ['image'],
            size: '2mb'
        })
        const name = `${car.id}.png`
        const publicPath = 'img/car'
        await image.move(Helpers.publicPath(publicPath), {
            name,
            overwrite: true
        })

        if (!image.moved()) {
            await trx.rollback()
            return image.error()
        }
        car.image = `/${publicPath}/${name}`
        await car.save(trx)

        let carCrawl = await car.carCrawls().create(
            {
                // name: 'test 123',
                // condition: 'new',
                condition: null,
                // price: 123
            }
            ,
            trx
        )
        await trx.commit()
        return response.json({
            car,
            carCrawl
        })
    } catch (error) {
        console.log(error)
        await trx.rollback()
    }
})//.middleware(['auth:api', 'can:read-and-write-role'])
// .validator("Admin/CarType/GetCarTypeByCondition")

Route.get('/test2', async ({ request, response }) => {
    let count = await Car.query().getCount()
    let number = count / quantityRow
    return Math.ceil(number)
})
Route.get("/test1", async ({ request, response }) => {

    var stream = await eachAttributes(50)
    var list = []
    await new Promise((resolve, eject) => {
        stream.on("data", (data) => {
            if (!data) {
                resolve()
            } else {
                list.push(data)
                /**
                 * list attribute data
                 **/

            }
        })
    })
    return list

})

async function eachAttributes(each = 10) {
    const stream = new Stream()
    stream.readable = true

    const getData = await Database.query()
        .select("id", "model_id", "name")
        .from('03_04_car_attributes')
        .stream()

    let index = 1
    let tempArr = []
    //
    getData.on('data', (row) => {
        tempArr.push(row)
        if ((index / each) % 1 === 0) {
            stream.emit('data', tempArr)
            tempArr = []
        }
        index++

    })
    getData.on('end', () => {
        stream.emit('data', tempArr)
        tempArr = []
        stream.emit('data', false)
    })
    getData.on('error', () => {
        stream.emit('data', false)
    })
    return stream
}