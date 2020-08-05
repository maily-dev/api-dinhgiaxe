function _isNotMissed(elem) {
    return (!(elem === undefined || elem === null))
}
export function create(tagName, cssClasses = null, attrs = null, children = null) {
    const elem = document.createElement(tagName)

    if (_isNotMissed(cssClasses)) {
        for (let i = 0; i < cssClasses.length; i++) {
            if (_isNotMissed(cssClasses[i])) {
                elem.classList.add(cssClasses[i])
            }
        }
    }
    if (_isNotMissed(attrs)) {
        for (let key in Object.entries(attrs).reduce((a, [k, v]) => (v ? (a[k] = v, a) : a), {})
        ) {
            elem.setAttribute(key, attrs[key])
        }
    }
    if (_isNotMissed(children)) {
        for (let i = 0; i < children.length; i++) {
            if (_isNotMissed(children[i])) {
                elem.appendChild(children[i])
            }
        }
    }
    return elem
}