export const ws = process.env.NODE_ENV === 'development' ? "ws://" : "wss://"

export function makeId(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}
export function boolean(val) {
    if (val) {
        return val !== "false"
    }
    return true
}
export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}