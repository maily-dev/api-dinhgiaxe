import { make } from './ui'
import bgIcon from './svg/background.svg'
import borderIcon from './svg/border.svg'
import stretchedIcon from './svg/stretched.svg'

/**
 * Working with Block Tunes
 */
export default class Tunes {
    /**
     * @param {object} tune - image tool Tunes managers
     * @param {object} tune.api - Editor API
     * @param {Function} tune.onChange - tune toggling callback
     */
    constructor ({ api, onChange }) {
        this.api = api
        this.onChange = onChange
        this.buttons = []
    }

    /**
     * Available Image tunes
     *
     * @returns {{name: string, icon: string, title: string}[]}
     */
    static get tunes() {
        return [
            {
                name: 'mergeCells',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5,10H3V4H11V6H5V10M19,18H13V20H21V14H19V18M5,18V14H3V20H11V18H5M21,4H13V6H19V10H21V4M8,13V15L11,12L8,9V11H3V13H8M16,11V9L13,12L16,15V13H21V11H16Z" />
                    </svg>`,
                switch: false,
                title: 'Gộp ô',
            },
            {
                name: "none"
            },
            {
                name: "none"

            },
            {
                name: "hr"
            },

            {
                name: 'addColLeft',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13,2A2,2 0 0,0 11,4V20A2,2 0 0,0 13,22H22V2H13M20,10V14H13V10H20M20,16V20H13V16H20M20,4V8H13V4H20M9,11H6V8H4V11H1V13H4V16H6V13H9V11Z" />
                </svg>`,
                switch: false,
                title: 'Chèn cột bên trái',
            },
            {
                name: 'addColRight',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M11,2A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H2V2H11M4,10V14H11V10H4M4,16V20H11V16H4M4,4V8H11V4H4M15,11H18V8H20V11H23V13H20V16H18V13H15V11Z" />
                </svg>`,
                switch: false,
                title: 'Chèn cột bên phải',
            },
            {
                name: 'delCol',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M4,2H11A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2M4,10V14H11V10H4M4,16V20H11V16H4M4,4V8H11V4H4M17.59,12L15,9.41L16.41,8L19,10.59L21.59,8L23,9.41L20.41,12L23,14.59L21.59,16L19,13.41L16.41,16L15,14.59L17.59,12Z" />
                </svg>`,
                switch: false,
                classList: ['red--text'],
                title: 'Xóa cột',
            },
            {
                name: 'addRowTop',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22,14A2,2 0 0,0 20,12H4A2,2 0 0,0 2,14V21H4V19H8V21H10V19H14V21H16V19H20V21H22V14M4,14H8V17H4V14M10,14H14V17H10V14M20,14V17H16V14H20M11,10H13V7H16V5H13V2H11V5H8V7H11V10Z" />
                </svg>`,
                switch: false,
                title: 'Chèn dòng bên trên',
            },
            {
                name: 'addRowBottom',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22,10A2,2 0 0,1 20,12H4A2,2 0 0,1 2,10V3H4V5H8V3H10V5H14V3H16V5H20V3H22V10M4,10H8V7H4V10M10,10H14V7H10V10M20,10V7H16V10H20M11,14H13V17H16V19H13V22H11V19H8V17H11V14Z" />
                </svg>`,
                switch: false,
                title: 'Chèn dòng bên dưới',
            },
            {
                name: 'delRow',
                icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9.41,13L12,15.59L14.59,13L16,14.41L13.41,17L16,19.59L14.59,21L12,18.41L9.41,21L8,19.59L10.59,17L8,14.41L9.41,13M22,9A2,2 0 0,1 20,11H4A2,2 0 0,1 2,9V6A2,2 0 0,1 4,4H20A2,2 0 0,1 22,6V9M4,9H8V6H4V9M10,9H14V6H10V9M16,9H20V6H16V9Z" />
                </svg>`,
                switch: false,
                classList: ['red--text'],
                title: 'Xóa hàng',
            },
        ]
    }

    /**
     * Styles
     *
     * @returns {{wrapper: string, buttonBase: *, button: string, buttonActive: *}}
     */
    get CSS() {
        return {
            wrapper: '',
            buttonBase: this.api.styles.settingsButton,
            buttonActive: this.api.styles.settingsButtonActive,
        }
    }

    /**
     * Makes buttons with tunes: add background, add border, stretch image
     *
     * @param {ImageToolData} toolData - generate Elements of tunes
     * @returns {Element}
     */
    render(toolData) {
        const wrapper = make('div', this.CSS.wrapper)

        this.buttons = []

        Tunes.tunes.forEach(tune => {
            switch (tune.name) {
                case "none":
                    const el1 = make('div', [this.CSS.buttonBase])
                    wrapper.appendChild(el1)
                    break
                case "hr":
                    const el2 = make('div', [], {
                        innerHTML: `<hr role="separator" aria-orientation="horizontal" class="my-2 v-divider theme--light">`
                    })
                    wrapper.appendChild(el2)
                    break

                default:

                    const title = this.api.i18n.t(tune.title)
                    const el = make('div', [this.CSS.buttonBase, ...(tune.classList || [])], {
                        innerHTML: tune.icon,
                        title,
                    })
                    el.addEventListener('click', () => {
                        this.tuneClicked(tune.name, tune.switch)
                    })

                    el.dataset.tune = tune.name
                    if (tune.switch)
                        el.classList.toggle(this.CSS.buttonActive, toolData[tune.name])

                    this.buttons.push(el)

                    this.api.tooltip.onHover(el, title, {
                        placement: 'top',
                    })

                    wrapper.appendChild(el)
                    break
            }

        })

        return wrapper
    }

    /**
     * Clicks to one of the tunes
     *
     * @param {string} tuneName - clicked tune name
     * @param {bool} switchAble - clicked tune switch
     * @returns {void}
     */
    tuneClicked(tuneName, switchAble) {
        const button = this.buttons.find(el => el.dataset.tune === tuneName)
        if (switchAble)
            button.classList.toggle(this.CSS.buttonActive, !button.classList.contains(this.CSS.buttonActive))

        this.onChange(tuneName)
    }
}
