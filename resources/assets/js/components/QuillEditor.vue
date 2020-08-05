<template>
  <div class="quill-editor">
    <slot name="toolbar"></slot>
    <div ref="editor"></div>
  </div>
</template>

<script>
// require sources
import _Quill from 'quill'
const Quill = window.Quill || _Quill
//
import ImageUploader from "quill-image-uploader"
import quillBetterTable from 'quill-better-table'
import ImageResize from 'quill-image-resize-module'

import Compressor from 'compressorjs'

//
Quill.register("modules/imageUploader", ImageUploader)
Quill.register('modules/imageResize', ImageResize)

Quill.register({
  'modules/better-table': quillBetterTable
}, true)
// pollfill
if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, 'assign', {
    value(target, varArgs) {
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }
      const to = Object(target)
      for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index]
        if (nextSource != null) {
          for (const nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey]
            }
          }
        }
      }
      return to
    },
    writable: true,
    configurable: true
  })
}
// export
export default {
  name: 'quill-editor',

  data() {
    const defaultOptions = {
      modules: {
        imageResize: true,
      },
      theme: 'snow',
      boundary: document.body,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          //   [{ 'font': [] }],
          [{ 'align': [] }],
          ['clean'],
          ['link', 'image', 'video', 'ctable'],
        ],
        imageResize: {},
        imageUploader: {
          upload: (file) => {
            return new Promise((resolve, reject) => {
              new Compressor(file, {
                quality: 0.9,
                maxWidth: 800,
                //   height: 300,
                success: (result) => {
                  var blob = result.slice(0, result.size, 'image/png')
                  resolve(new File([blob], `image.png`, { type: 'image/png' }))
                },
                error: (err) => {
                  console.log(err)

                  reject(err)
                }
              }
              )
            }).then((filedata) => {
              let formData = new FormData()
              formData.append("resource_id", this.resourceId)
              formData.append("image", filedata)
              return this.$axios.post("/post/uploadImage", formData).then(({ data }) => data.data)
            })
          },
        },
        table: false,  // disable table module
        'better-table': {
          operationMenu: {
            items: {
              unmergeCells: {
                text: 'Another unmerge cells name'
              }
            },
            color: {
              colors: ['green', 'red', 'yellow', 'blue', 'white'],
              text: 'Background Colors:'
            }
          }
        },
        keyboard: {
          bindings: quillBetterTable.keyboardBindings
        },

      },
      placeholder: 'Insert text here ...',
      readOnly: false
    }
    return {
      loading: false,
      _options: {},
      _content: '',
      defaultOptions
    }
  },
  props: {
    resourceId: {
      type: String,
      require: false,
      default: "",
    },
    content: String,
    value: String,
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      required: false,
      default: () => ({})
    },
    globalOptions: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  mounted() {
    this.initialize()
  },
  beforeDestroy() {
    this.quill = null
    delete this.quill
  },
  methods: {
    // Init Quill instance
    initialize() {
      if (this.$el) {
        // Options
        this._options = Object.assign({}, this.defaultOptions, this.globalOptions, this.options)
        // Instance
        this.quill = new Quill(this.$refs.editor, this._options)

        this.quill.enable(false)
        // Set editor content
        if (this.value || this.content) {
          // console.log(this.value || this.content)
          // console.log(this.quill)
          this.$refs.editor.children[0].innerHTML = this.value || this.content
        }
        // Disabled editor
        if (!this.disabled) {
          this.quill.enable(true)
        }
        // Mark model as touched if editor lost focus
        this.quill.on('selection-change', range => {
          if (!range) {
            this.$emit('blur', this.quill)
          } else {
            this.$emit('focus', this.quill)
          }
        })
        // Update model if text changes
        this.quill.on('text-change', (delta, oldDelta, source) => {
          let html = this.$refs.editor.children[1].innerHTML
          const quill = this.quill
          const text = this.quill.getText()
          if (html === '<p><br></p>') html = ''
          this._content = html
          this.$emit('input', this._content)
          this.$emit('change', { html, text, quill })
        })
        // Emit ready event
        this.$emit('ready', this.quill)
        //
        // document.body.querySelector('.ql-toolbar').classList.add("elevation-1")
        var toolbar = this.quill.getModule('toolbar')
        console.log(toolbar)
        let tableModule = this.quill.getModule('better-table')
        document.body.querySelector('.ql-ctable').innerHTML = `<svg style="width:18px;height:18px" viewBox="0 0 18 18">
         <g transform="scale(.8)">
            <path fill="currentColor" d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z" />
        </g>
        </svg>`
        document.body.querySelector('.ql-ctable').addEventListener("click", function () {
          console.log("z000")
          tableModule.insertTable(3, 3)

        })
        //
        let elProgressBar = document.createElement("div")
        elProgressBar.innerHTML = `<div role="progressbar" aria-valuemin="0" aria-valuemax="100" class="v-progress-linear theme--light" style="height: 6px;"><div class="v-progress-linear__background primary" style="opacity: 0.3; left: 0%; width: 100%;"></div><div class="v-progress-linear__buffer"></div><div class="v-progress-linear__indeterminate v-progress-linear__indeterminate--active"><div class="v-progress-linear__indeterminate long primary"></div><div class="v-progress-linear__indeterminate short primary"></div></div></div>`
        elProgressBar.className = "ql-progressbar"
        document.body.querySelector('.ql-container').insertBefore(
          elProgressBar,
          document.body.querySelector('.ql-container').firstChild,
        )
        //
        this.quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
          if (!['TH', 'TR', 'TD', 'TBODY', 'TABLE'].includes(node.tagName)) {
            this.clipboardHandle(delta)
            delta.ops = []
          }

          return delta
        })
      }
    },
    async clipboardHandle(delta) {
      this.loading = true
      console.log(delta)
      let ops = [
        { retain: this.quill.getSelection().index },
      ]
      for (const op of delta.ops) {
        if (op.insert && typeof op.insert === 'string') {
          if (op.attributes && op.attributes.link) {
            // Kiểm tra có phải link youtube
            if (this.testYoutube(op.attributes.link)) {
              let params = op.attributes.link.split("?")[1]
              let urlParams = new URLSearchParams(params)
              let videoId = urlParams.get("v")
              if (videoId) {
                ops.push({
                  attributes: {
                    height: '400',
                    width: '100%'
                  },
                  insert: {
                    video: `https://www.youtube.com/embed/${videoId}`
                  }
                })
              }
            } else {
              let testImgResult = await this.testImage(op.attributes.link)
              if (testImgResult == "success") {
                // Upload image
                let formData = new FormData()
                formData.append("resource_id", this.resourceId)
                formData.append("url", filedata)
                let { data } = await this.$axios.post("/post/uploadImageByUrl", formData)
                //

                ops.push({
                  attributes: { alt: "" },
                  insert: {
                    image: data.data
                  }
                })
              } else {
                ops.push(op)
              }
            }

            //
          } else {
            ops.push({
              insert: op.insert
            })
          }
        } else {
          if (op.insert && op.insert.image) {
            ops.push(op)
          }
        }
      }

      delta.ops = ops

      this.quill.updateContents(
        delta
      )
      this.loading = false

    },
    testImage(url, timeoutT) {
      return new Promise(function (resolve, reject) {
        var timeout = timeoutT || 5000
        var timer, img = new Image()
        img.onerror = img.onabort = function () {
          clearTimeout(timer)
          resolve("error")
        }
        img.onload = function () {
          clearTimeout(timer)
          resolve("success")
        }
        timer = setTimeout(function () {
          // reset .src to invalid URL so it stops previous
          // loading, but doens't trigger new load
          img.src = "//!!!!/noexist.jpg"
          resolve("timeout")
        }, timeout)
        img.src = url
      })
    },
    testYoutube(url) {
      return /https?:\/\/(?:[a-zA_Z]{2,3}.)?(?:youtube\.com\/watch\?)((?:[\w\d\-\_\=]+&amp;(?:amp;)?)*v(?:&lt;[A-Z]+&gt;)?=([0-9a-zA-Z\-\_]+))/i.test(url)
    },

  },
  watch: {
    // Watch content change
    content(newVal, oldVal) {
      if (this.quill) {
        if (newVal && newVal !== this._content) {
          this._content = newVal
          this.quill.pasteHTML(newVal)
        } else if (!newVal) {
          this.quill.setText('')
        }
      }
    },
    // Watch content change
    value(newVal, oldVal) {
      if (this.quill) {
        if (newVal && newVal !== this._content) {
          this._content = newVal
          this.quill.pasteHTML(newVal)
        } else if (!newVal) {
          this.quill.setText('')
        }
      }
    },
    // Watch disabled change
    disabled(newVal, oldVal) {
      if (this.quill) {
        this.quill.enable(!newVal)
      }
    },
    loading(val) {
      if (val) {
        document.querySelector(".ql-progressbar").classList.add("show")
      } else {
        document.querySelector(".ql-progressbar").classList.remove("show")

      }
    }
  },
}
</script>