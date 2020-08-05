// eslint-disable-next-line
import Ui from './ui'
import Tunes from './tunes'
// import ToolboxIcon from './svg/toolbox.svg'
require("./index.css")
export default class Table {

    static get enableLineBreaks() {
        return true
    }
    /**
     * Get Tool toolbox settings
     * icon - Tool icon's SVG
     * title - title to show in toolbox
     *
     * @returns {{icon: string, title: string}}
     */
    static get toolbox() {
        return {
            icon: `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
                <path fill="currentColor" d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z" />
            </svg>`,
            title: 'Table',
        }
    }
    // static get isInline() {
    //     return true
    // }
    /**
     * @param {object} tool - tool properties got from editor.js
     * @param {ImageToolData} tool.data - previously saved data
     * @param {ImageConfig} tool.config - user config for Tool
     * @param {object} tool.api - Editor.js API
     */
    constructor ({ data, config, api }) {
        console.log("data", data)

        this.api = api
        this.data = {
            rows: [
                {
                    cells: [
                        {
                            content: "A1",
                            colspan: 2,

                        },

                    ]
                },
                {
                    cells: [
                        {
                            content: "A2",

                        },
                        {
                            content: "B2",

                        },
                    ]

                },
            ]
        }
        /**
        * Set saved state
        */

        /**
         * Tool's initial config
         */
        this.config = {
            endpoints: config.endpoints || '',
            additionalRequestData: config.additionalRequestData || {},
            additionalRequestHeaders: config.additionalRequestHeaders || {},
            field: config.field || 'image',
            types: config.types || 'image/*',
            captionPlaceholder: this.api.i18n.t(config.captionPlaceholder || 'Caption'),
            buttonContent: config.buttonContent || '',
        }


        /**
         * Module for working with UI
         */
        this.ui = new Ui({
            data: this.data,
            api,
            config: this.config,
        })

        /**
         * Module for working with tunes
         */
        this.tunes = new Tunes({
            api,
            onChange: (tuneName) => {

                this.ui.applyTune(tuneName, true)
            }
        })


        this.data = data
    }

    /**
     * Renders Block content
     *
     * @public
     *
     * @returns {HTMLDivElement}
     */
    render() {
        return this.ui.render(this.data)
    }

    /**
     * Return Block data
     *
     * @public
     *
     * @returns {ImageToolData}
     */
    save() {
        const caption = this.ui.nodes.caption


        return this.data
    }

    /**
     * Makes buttons with tunes: add background, add border, stretch image
     *
     * @public
     *
     * @returns {Element}
     */
    renderSettings() {
        return this.tunes.render(this.data)
    }

    /**
     * Fires after clicks on the Toolbox Image Icon
     * Initiates click on the Select File button
     *
     * @public
     */
    appendCallback() {
        this.ui.nodes.fileButton.click()
    }

    /**
     * Specify paste substitutes
     *
     * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
     * @returns {{tags: string[], patterns: object<string, RegExp>, files: {extensions: string[], mimeTypes: string[]}}}
     */
    static get pasteConfig() {
        return {
            /**
             * Paste HTML into Editor
             */
            tags: ['img'],

            /**
             * Paste URL of image into the Editor
             */
            patterns: {
                image: /https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i,
            },

            /**
             * Drag n drop file from into the Editor
             */

        }
    }

    /**
     * Specify paste handlers
     *
     * @public
     * @see {@link https://github.com/codex-team/editor.js/blob/master/docs/tools.md#paste-handling}
     * @param {CustomEvent} event - editor.js custom paste event
     *                              {@link https://github.com/codex-team/editor.js/blob/master/types/tools/paste-events.d.ts}
     * @returns {void}
     */
    async onPaste(event) {
        switch (event.type) {
            case 'tag': {


                break
            }
            case 'pattern': {
                const url = event.detail.data

                // this.uploadUrl(url);
                break
            }
            case 'file': {

                break
            }
        }
    }

    /**
     * Private methods
     * ̿̿ ̿̿ ̿̿ ̿'̿'\̵͇̿̿\з= ( ▀ ͜͞ʖ▀) =ε/̵͇̿̿/’̿’̿ ̿ ̿̿ ̿̿ ̿̿
     */

    /**
     * Stores all Tool's data
     *
     * @private
     *
     * @param {ImageToolData} data - data in Image Tool format
     */
    // set data(data) {

    //     this._data.caption = data.caption || ''
    // this.ui.fillCaption(this._data.caption)

    // Tunes.tunes.forEach(({ name: tune }) => {
    //     const value = typeof data[tune] !== 'undefined' ? data[tune] === true || data[tune] === 'true' : false

    //     this.setTune(tune, value)
    // })
    // }

    /**
     * Return Tool data
     *
     * @private
     *
     * @returns {ImageToolData}
     */
    // get data() {
    //     return this._data
    // }






}
