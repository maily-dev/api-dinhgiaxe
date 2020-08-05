import buttonIcon from './svg/button-icon.svg'
import { create } from "./utils"

/**
 * Class for working with UI:
 *  - rendering base structure
 *  - show/hide preview
 *  - apply tune view
 */
export default class Ui {
    /**
     * @param {object} ui - image tool Ui module
     * @param {object} ui.api - Editor.js API
     * @param {ImageConfig} ui.config - user config
     */
    constructor ({ data, api, config }) {
        this.api = api
        this.data = data
        this.config = config
        this.nodes = {
            wrapper: make('div', [this.CSS.baseClass, this.CSS.tableEditor]),
            table: make('table', [this.CSS.table]),
            trs: make('tr', [this.CSS.tableTr]),
            fileButton: this.createFileButton(),
            imageEl: undefined,
            imagePreloader: make('div', this.CSS.imagePreloader),
            caption: make('div', [this.CSS.input, this.CSS.caption], {
                contentEditable: true,
            }),
        }
        this.rows = []
        this.cellSelectStart = null
        this.cellSelectEnd = null
        this.cellsSelect = []
        this.fillData()
        // for (let index = 0; index < 5; index++) {

        //     let td = create('td', [this.CSS.tableTd], {})
        //     let vm = this
        //     td.addEventListener("click", function (e) {
        //         console.log(e)

        //         document.querySelectorAll("table.table-parent td").forEach((el) => {
        //             el.classList.remove("table-td_active")
        //         })

        //         if (e.ctrlKey) {
        //             //  Kiểm tra đã có thì remove
        //             let pos = {
        //                 y: this.cellIndex,
        //                 x: this.parentNode.rowIndex
        //             }
        //             let delIndex = vm.cellsSelect.findIndex((val) => val.x === pos.x && val.y === pos.y)
        //             if (delIndex >= 0) {
        //                 vm.cellsSelect.splice(delIndex, 1)
        //             } else
        //                 vm.cellsSelect.push({
        //                     y: this.cellIndex,
        //                     x: this.parentNode.rowIndex
        //                 })
        //             vm.cellSelectStart = {
        //                 y: this.cellIndex,
        //                 x: this.parentNode.rowIndex
        //             }
        //         } else {
        //             vm.cellsSelect = []
        //         }
        //         //
        //         vm.activeCellsSelect()

        //     })
        //     td.appendChild(make('div', [this.CSS.inputField], {
        //         contentEditable: true,
        //     }))
        //     this.nodes.trs.appendChild(td)
        // }
        // //
        // let wrap = this._createTableWrapper([this.nodes.trs])
        // //
        // this.nodes.wrapper.appendChild(wrap)
    }
    fillData() {
        let wrap = this._createTableWrapper(
            this.data.rows.map((row) => {
                let rowEl = create('tr', [this.CSS.tableTr], null, row.cells.map((cell) => {
                    let td = create('td', [this.CSS.tableTd], {
                        rowspan: cell.rowspan,
                        colspan: cell.colspan,
                    })
                    this.cellAddEvent(td)
                    // this._addReSizeCell(td)
                    td.appendChild(make('div', [this.CSS.inputField], {
                        innerHTML: cell.content,
                        contentEditable: true,

                    }))
                    return td
                }))
                return rowEl
            })
        )
        //
        this.nodes.wrapper.appendChild(wrap)
    }
    activeCellsSelect() {
        for (const cell of this.cellsSelect) {
            var selectTR = this.nodes.table.rows[cell.y]
            selectTR.querySelectorAll("td")[cell.x].classList.add("table-td_active")
        }
    }
    cellAddEvent(cell) {
        let vm = this
        cell.addEventListener("click", function (e) {

            vm.nodes.table.querySelectorAll("td").forEach(el => {
                el.classList.remove("table-td_active")
            })

            if (e.ctrlKey) {
                //  Kiểm tra đã có thì remove
                let pos = {
                    x: this.cellIndex,
                    y: this.parentNode.rowIndex
                }
                let delIndex = vm.cellsSelect.findIndex((val) => val.x === pos.x && val.y === pos.y)
                if (delIndex >= 0) {
                    vm.cellsSelect.splice(delIndex, 1)
                } else
                    vm.cellsSelect.push({
                        x: this.cellIndex,
                        y: this.parentNode.rowIndex
                    })
                vm.cellSelectStart = {
                    x: this.cellIndex,
                    y: this.parentNode.rowIndex
                }
                vm.activeCellsSelect()
            } else {
                vm.cellsSelect = []
            }
            //

        })
    }
    mergeCells() {
        let count = this.cellsSelect.length
        if (count) {

            let cellTest = this.cellsSelect[0]
            let countSameCellTestRow = this.cellsSelect.filter(item => item.y === cellTest.y).length
            let countSameCellTestCol = this.cellsSelect.filter(item => item.x === cellTest.x).length
            //  Nếu gộp dòng
            if (countSameCellTestRow === count) {
                let x_arr = this.cellsSelect.map(item => item.x)
                let minCol = Math.min.apply(Math, x_arr)
                let maxCol = Math.max.apply(Math, x_arr)
                //
                let firstCell = this.nodes.table.rows[cellTest.y].cells[minCol]
                let defaultFirtColSpan = parseInt(firstCell.getAttribute("colspan") || 1)
                //

                for (let index = minCol; index <= maxCol; index++) {
                    if (index === minCol) {
                        console.log(this.cellsSelect)
                        console.log(defaultFirtColSpan)
                        console.log(count)
                        console.log((defaultFirtColSpan - 1) + count)

                        firstCell.setAttribute("colspan", (defaultFirtColSpan - 1) + count)
                        continue
                    }
                    this.nodes.table.rows[cellTest.y].cells[minCol].getElementsByClassName("tc-table__inp")[0].innerHTML += this.nodes.table.rows[cellTest.y].cells[minCol + 1].getElementsByClassName("tc-table__inp")[0].innerHTML
                    this.nodes.table.rows[cellTest.y].deleteCell(minCol + 1)

                }
                this.cellsSelect = []

            } else if (countSameCellTestCol === count) {
                let y_arr = this.cellsSelect.map(item => item.y)
                let minRow = Math.min.apply(Math, y_arr)
                let maxRow = Math.max.apply(Math, y_arr)
                //
                let firstCell = this.nodes.table.rows[minRow].cells[cellTest.x]
                let defaultFirtRowSpan = parseInt(firstCell.getAttribute("rowspan") || 1)
                //
                for (let index = minRow; index <= maxRow; index++) {
                    if (index === minRow) {
                        firstCell.setAttribute("rowspan", (defaultFirtRowSpan - 1) + count)
                        continue
                    }

                    this.nodes.table.rows[minRow].cells[cellTest.x].getElementsByClassName("tc-table__inp")[0].innerHTML += this.nodes.table.rows[index].cells[cellTest.x].getElementsByClassName("tc-table__inp")[0].innerHTML
                    this.nodes.table.rows[index].deleteCell(cellTest.x)

                }
                this.cellsSelect = []

            }
        }

    }
    addColLeft() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].x
            const rows = this.nodes.table.rows
            for (let i = 0; i < rows.length; i++) {
                const cell = rows[i].insertCell(index)
                this.cellAddEvent(cell)

                this._fillCell(cell)
            }
        }
    }
    addColRight() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].x
            const rows = this.nodes.table.rows
            for (let i = 0; i < rows.length; i++) {
                console.log(index + 1)
                let _index = index + 1
                if (index + 1 > rows[i].cells.length) {
                    _index = rows[i].cells.length
                }

                const cell = rows[i].insertCell(_index)
                this.cellAddEvent(cell)

                this._fillCell(cell)
            }
        }
    }
    delCol() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].x
            const rows = this.nodes.table.rows
            for (let i = 0; i < rows.length; i++) {
                rows[i].deleteCell(index)
            }
        }

    }
    addRowTop() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].y
            let tableCellsCount = 0
            for (let i = 0; i < this.nodes.table.rows[index].cells.length; i++) {
                tableCellsCount += parseInt(this.nodes.table.rows[index].cells[i].getAttribute("colspan") || 1)
            }

            const row = this.nodes.table.insertRow(index)
            this._fillRow(row, tableCellsCount)
        }
    }
    addRowBottom() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].y
            let tableCellsCount = 0
            for (let i = 0; i < this.nodes.table.rows[index].cells.length; i++) {
                tableCellsCount += parseInt(this.nodes.table.rows[index].cells[i].getAttribute("colspan") || 1)
            }

            const row = this.nodes.table.insertRow(index + 1)
            this._fillRow(row, tableCellsCount)
        }
    }
    delRow() {
        if (this.cellsSelect.length) {
            let index = this.cellsSelect[0].y

            this.nodes.table.deleteRow(index)
        }
    }
    _fillCell(cell) {
        cell.classList.add(this.CSS.tableTd)
        const content = this._createContenteditableArea()

        cell.appendChild(content)
    }
    _fillRow(row, tableCellsCount) {
        row.classList.add(this.CSS.tableTr)
        for (let i = 0; i < tableCellsCount; i++) {
            const cell = row.insertCell()
            this._fillCell(cell)
            this.cellAddEvent(cell)
        }
    }

    _createContenteditableArea() {
        return create('div', [this.CSS.inputField], { contenteditable: 'true' })
    }
    _createTableWrapper(child) {
        for (const item of child) {

            this.nodes.table.appendChild(item)
        }
        return create('div', [this.CSS.tableWrapper], null, [this.nodes.table])
    }
    _addReSizeCell(cell) {
        let topBorder = make("div", [this.CSS.resize.top])
        let bottomBorder = make("div", [this.CSS.resize.bottom])
        cell.appendChild(topBorder)
        cell.appendChild(bottomBorder)
    }
    cellSelect() {
        //
        var MinX = null
        var MaxX = null
        var MinY = null
        var MaxY = null
        if (this.cellSelectStart.x < this.cellSelectEnd.x) {
            MinX = this.cellSelectStart.x
            MaxX = this.cellSelectEnd.x

        } else {
            MinX = this.cellSelectEnd.x
            MaxX = this.cellSelectStart.x
        };
        if (this.cellSelectStart.y < this.cellSelectEnd.y) {
            MinY = this.cellSelectStart.y
            MaxY = this.cellSelectEnd.y
        } else {
            MinY = this.cellSelectEnd.y
            MaxY = this.cellSelectStart.y
        };
        this.cellSelectStart = {
            x: MinX,
            y: MinY
        }
        this.cellSelectEnd = {
            x: MaxX,
            y: MaxY
        }
        for (var i = MinX; i <= MaxX; i++) {
            for (var j = MinY; j <= MaxY; j++) {
                var SelectTR = document.querySelectorAll('table.table-parent tr')[i]
                SelectTR.querySelectorAll("td")[j].classList.add("table-td_active")
            }
        }
    }
    /**
     * CSS classes
     *
     * @returns {object}
     */
    get CSS() {
        return {
            baseClass: this.api.styles.block,
            loading: this.api.styles.loader,
            input: this.api.styles.input,
            button: this.api.styles.button,

            /**
             * Tool's classes
             */
            tableEditor: 'table-editor',
            tableTr: 'table-tr',
            tableTd: 'table-td',
            inputField: 'tc-table__inp',
            table: 'table-parent',
            tableWrapper: 'table-wrapper',
            /**
             * Resize border
             */
            resize: {
                top: "table-resize-top",
                bottom: "table-resize-bottom",
            },
            // wrapper: 'image-tool',
            imageContainer: 'image-tool__image',
            imagePreloader: 'image-tool__image-preloader',
            imageEl: 'image-tool__image-picture',
            caption: 'image-tool__caption',
        }
    };

    /**
     * Ui statuses:
     * - empty
     * - uploading
     * - filled
     *
     * @returns {{EMPTY: string, UPLOADING: string, FILLED: string}}
     */
    static get status() {
        return {
            EMPTY: 'empty',
            UPLOADING: 'loading',
            FILLED: 'filled',
        }
    }

    /**
     * Renders tool UI
     *
     * @param {ImageToolData} toolData - saved tool data
     * @returns {Element}
     */
    render(toolData) {

        return this.nodes.wrapper
    }

    /**
     * Creates upload-file button
     *
     * @returns {Element}
     */
    createFileButton() {
        const button = make('div', [this.CSS.button])

        button.innerHTML = this.config.buttonContent || `${buttonIcon} ${this.api.i18n.t('Select an Image')}`

        // button.addEventListener('click', () => {
        //     this.onSelectFile()
        // })

        return button
    }

    /**
     * Shows uploading preloader
     *
     * @param {string} src - preview source
     * @returns {void}
     */
    showPreloader(src) {
        this.nodes.imagePreloader.style.backgroundImage = `url(${src})`

        this.toggleStatus(Ui.status.UPLOADING)
    }

    /**
     * Hide uploading preloader
     *
     * @returns {void}
     */
    hidePreloader() {
        this.nodes.imagePreloader.style.backgroundImage = ''
        this.toggleStatus(Ui.status.EMPTY)
    }

    /**
     * Shows an image
     *
     * @param {string} url - image source
     * @returns {void}
     */
    fillImage(url) {
        /**
         * Check for a source extension to compose element correctly: video tag for mp4, img — for others
         */
        const tag = /\.mp4$/.test(url) ? 'VIDEO' : 'IMG'

        const attributes = {
            src: url,
        }

        /**
         * We use eventName variable because IMG and VIDEO tags have different event to be called on source load
         * - IMG: load
         * - VIDEO: loadeddata
         *
         * @type {string}
         */
        let eventName = 'load'

        /**
         * Update attributes and eventName if source is a mp4 video
         */
        if (tag === 'VIDEO') {
            /**
             * Add attributes for playing muted mp4 as a gif
             *
             * @type {boolean}
             */
            attributes.autoplay = true
            attributes.loop = true
            attributes.muted = true
            attributes.playsinline = true

            /**
             * Change event to be listened
             *
             * @type {string}
             */
            eventName = 'loadeddata'
        }

        /**
         * Compose tag with defined attributes
         *
         * @type {Element}
         */
        this.nodes.imageEl = make(tag, this.CSS.imageEl, attributes)

        /**
         * Add load event listener
         */
        this.nodes.imageEl.addEventListener(eventName, () => {
            this.toggleStatus(Ui.status.FILLED)

            /**
             * Preloader does not exists on first rendering with presaved data
             */
            if (this.nodes.imagePreloader) {
                this.nodes.imagePreloader.style.backgroundImage = ''
            }
        })

        this.nodes.imageContainer.appendChild(this.nodes.imageEl)
    }

    /**
     * Shows caption input
     *
     * @param {string} text - caption text
     * @returns {void}
     */
    fillCaption(text) {
        if (this.nodes.caption) {
            this.nodes.caption.innerHTML = text
        }
    }

    /**
     * Changes UI status
     *
     * @param {string} status - see {@link Ui.status} constants
     * @returns {void}
     */
    toggleStatus(status) {
        for (const statusType in Ui.status) {
            if (Object.prototype.hasOwnProperty.call(Ui.status, statusType)) {
                this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${Ui.status[statusType]}`, status === Ui.status[statusType])
            }
        }
    }

    /**
     * Apply visual representation of activated tune
     *
     * @param {string} tuneName - one of available tunes {@link Tunes.tunes}
     * @param {boolean} status - true for enable, false for disable
     * @returns {void}
     */
    applyTune(tuneName, status) {
        console.log(tuneName, status)
        switch (tuneName) {
            case "mergeCells":
                this.mergeCells()
                break
            case "addColLeft":
                this.addColLeft()
                break
            case "addColRight":
                this.addColRight()
                break
            case "delCol":
                this.delCol()
                break
            case "addRowTop":
                this.addRowTop()
                break
            case "addRowBottom":
                this.addRowBottom()
                break
            case "delRow":
                this.delRow()
                break

            default:
                break
        }
        // this.nodes.wrapper.classList.toggle(`${this.CSS.wrapper}--${tuneName}`, status)
    }

}

/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {Array|string} classNames  - list or name of CSS class
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
export const make = function make(tagName, classNames = null, attributes = {}) {
    const el = document.createElement(tagName)

    if (Array.isArray(classNames)) {
        el.classList.add(...classNames)
    } else if (classNames) {
        el.classList.add(classNames)
    }

    for (const attrName in attributes) {
        el[attrName] = attributes[attrName]
    }

    return el
}
