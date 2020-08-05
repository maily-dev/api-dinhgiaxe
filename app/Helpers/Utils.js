"use strict"

const { default: slugify } = require("slugify")

const moment = use("moment")
const Post = use("App/Models/Post")
const CarType = use("App/Models/CarType")

const underscoreSlug = str => {
    str = str.replace(/^\s+|\s+$/g, "") // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from =
        "àáạãảäăằắặẵẳâầấậẫẩđèéẹẽẻëêềếệễểìíịĩỉïîòóọõỏöôồốộỗổơớờợỡởùúüũủûưứừựữửñçỵ·/,_:;"
    var to =
        "aaaaaaaaaaaaaaaaaadeeeeeeeeeeeeiiiiiiioooooooooooooooooouuuuuuuuuuuuncy------"
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
    }

    str = str
        .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "_") // collapse whitespace and replace by -
        .replace(/-+/g, "") // collapse dashes

    return str
}

const convertDate = dateStr => {
    // dd/mm/yy to yyyy-mm-dd
    const [day, month, year] = dateStr.split("/")
    let date = moment(new Date(year, month - 1, day)).format("YYYY-MM-DD")
    return date
}

const post_slug = async str => {
    // Convert to lowercase
    let slug = str.toLowerCase()

    //Remove accent
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    slug = slug.replace(/đ/gi, 'd')
    //Remove special char
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '')
    //Remove white space
    slug = slug.replace(/ /gi, "-")

    //In case user enter to many space
    slug = slug.replace(/\-\-\-\-\-/gi, '-')
    slug = slug.replace(/\-\-\-\-/gi, '-')
    slug = slug.replace(/\-\-\-/gi, '-')
    slug = slug.replace(/\-\-/gi, '-')
    //Trim '-' at start and end of string
    slug = '@' + slug + '@'
    slug = slug.replace(/\@\-|\-\@|\@/gi, '')
    let postSlug = await Post.where({ slug }).first()
    if (postSlug) {
        slug = `${slug}_${Math.random().toString(36).substring(2, 4)}`
        return slug
    }
    return slug
}

// Tạo slug cho Post
const renderPostSlug = async name => {
    let slug = slugify(name)
    let post = await Post.findBy('slug', slug)
    if (post) {
        slug = `${slug}_${Math.random().toString(36).substring(2, 4)}`
        return renderPostSlug(slug)
    }
    return slug
}

const convertPriceStringToNumber = (priceStr) => { // đổi giá kiểu str sang số
    let billion = 0
    let million = 0
    if (priceStr.includes('tỷ') && priceStr.includes('triệu')) {
        billion = priceStr.split('tỷ')[0]
        billion = billion * 1e9
        million = priceStr.split('tỷ')[1]
        million = million.replace(/[^0-9]/g, '') * 1e6
    }
    else if (!priceStr.includes('tỷ') && priceStr.includes('triệu')) {
        million = priceStr.split('triệu')[0]
        million = million.replace(/[^0-9]/g, '') * 1e6
    }
    else if (priceStr.includes('tỷ') && !priceStr.includes('triệu')) {
        million = priceStr.split('tỷ')[0]
        million = million.replace(/[^0-9]/g, '') * 1e9
    }
    return billion + million
}

const isSpam = (name) => { // trả về true khi tin là spam
    let spams = ['khuyến mãi', 'ưu đãi', 'nhập khẩu', 'mới', 'giảm giá', 'trên thế', 'số lượng', 'đời', 'giá tốt', 'nhập',
        'nhất', 'đủ', 'việt nam', 'cẩu', 'nội địa', 'new']
    return (name.toLowerCase().match(new RegExp(spams.map(item => item.toLowerCase()).join("|"), "gi")) || []).length > 0
}
const getCarType = async (name, author_site) => { // tìm và tạo loại xe
    let _slug = underscoreSlug(name)
    name = name.replace(/(\r\n|\n|\r)/gm, "").toLowerCase()
    let carType
    try {
        carType = await CarType.findOrCreate(
            {
                slug: _slug
            },
            {
                name,
                slug: _slug,
                author_site,
            }
        )
        return carType
    } catch (error) {
        if (error.code == 'ER_DUP_ENTRY') { // bắt lỗi khi tạo cùng lúc bị lặp dữ liệu
            carType = await CarType.query()
                .where({ slug: _slug })
                .first()
            return carType
        }
    }
}

const filterAttribute = (attributeName) => {
    attributeName = attributeName.toLocaleUpperCase()
    switch (attributeName) {
        case "SEDAN 1.2 MT":
            return '1.2MT'
        case "LIMOUISNIE":
            return 'LIMOUSINE'
        default:
            if (
                (/^(([,|.]?[0-9]))+ (AT) +(.*)$/g).test(attributeName) ||
                (/^(([,|.]?[0-9]))+ (G|AT|MT|E)$/g).test(attributeName)
            ) {
                return attributeName.replace(" ", '')
            }
            return attributeName
    }

    // if (attributeName == '2.8 AT 4x4') return attributeName = '2.8AT 4x4'
    // else if (attributeName == '1.2 G') return attributeName = '1.2G'
    // else if (attributeName == '1.4 G') return attributeName = '1.4G'
    // else if (attributeName == '1.5 G') return attributeName = '1.5G'
    // else if (attributeName == '2.0 G') return attributeName = '2.0G'
    // else if (attributeName == '2.2 G') return attributeName = '2.2G'
    // else if (attributeName == '2.3 G') return attributeName = '2.3G'
    // else if (attributeName == '2.5 G') return attributeName = '2.5G'
    // else if (attributeName == '2.8 G') return attributeName = '2.8G'
    // else if (attributeName == '1.2 AT') return attributeName = '1.2AT'
    // else if (attributeName == '1.3 AT') return attributeName = '1.3AT'
    // else if (attributeName == '1.3 AT SPORT') return attributeName = '1.3 AT SPORT'
    // else if (attributeName == '1.4 AT') return attributeName = '1.4AT'
    // else if (attributeName == '1.5 AT') return attributeName = '1.5AT'
    // else if (attributeName == '1.6 AT') return attributeName = '1.6AT'
    // else if (attributeName == '1.8 AT') return attributeName = '1.8AT'
    // else if (attributeName == '2.0 AT') return attributeName = '2.0AT'
    // else if (attributeName == '2.2 AT') return attributeName = '2.2AT'
    // else if (attributeName == '2.3 AT') return attributeName = '2.3AT'
    // else if (attributeName == '2.5 AT') return attributeName = '2.5AT'
    // else if (attributeName == '2.5 AT AWD') return attributeName = '2.5AT AWD'
    // else if (attributeName == '3.2 AT') return attributeName = '3.2AT'
    // else if (attributeName == '1.1 MT') return attributeName = '1.1MT'
    // else if (attributeName == '1.2 MT') return attributeName = '1.2MT'
    // else if (attributeName == 'SEDAN 1.2 MT') return attributeName = '1.2MT'
    // else if (attributeName == '1.4 MT') return attributeName = '1.4MT'
    // else if (attributeName == '1.5 MT') return attributeName = '1.5MT'
    // else if (attributeName == '1.6 MT') return attributeName = '1.6MT'
    // else if (attributeName == '2.0 MT') return attributeName = '2.0MT'
    // else if (attributeName == '2.2 MT') return attributeName = '2.2MT'
    // else if (attributeName == '2.3 MT') return attributeName = '2.3MT'
    // else if (attributeName == '2.5 MT') return attributeName = '2.5MT'
    // else if (attributeName == '2.8 MT') return attributeName = '2.8MT'
    // else if (attributeName == '1.2 E') return attributeName = '1.2E'
    // else if (attributeName == '1.4 E') return attributeName = '1.4E'
    // else if (attributeName == '1.5 E') return attributeName = '1.5E'
    // else if (attributeName == '2.0 E') return attributeName = '2.0E'
    // else if (attributeName == '2.2 E') return attributeName = '2.2E'
    // else if (attributeName == '2.3 E') return attributeName = '2.3E'
    // else if (attributeName == '2.5 E') return attributeName = '2.5E'
    // else if (attributeName == '2.8 E') return attributeName = '2.8E'
    // else if (attributeName == 'LIMOUISNIE') return attributeName = 'LIMOUSINE'

    // return attributeName
}

const slug = str => { // o tô => o-to
    // Convert to lowercase
    let slug = str.toLowerCase()

    //Remove accent
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    slug = slug.replace(/đ/gi, 'd')
    //Remove special char
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '')
    //Remove white space
    slug = slug.replace(/ /gi, "-")

    //In case user enter to many space
    slug = slug.replace(/\-\-\-\-\-/gi, '-')
    slug = slug.replace(/\-\-\-\-/gi, '-')
    slug = slug.replace(/\-\-\-/gi, '-')
    slug = slug.replace(/\-\-/gi, '-')
    //Trim '-' at start and end of string
    slug = '@' + slug + '@'
    slug = slug.replace(/\@\-|\-\@|\@/gi, '')
    return slug
}
module.exports = { underscoreSlug, convertDate, post_slug, convertPriceStringToNumber, isSpam, getCarType, filterAttribute, slug, renderPostSlug }
