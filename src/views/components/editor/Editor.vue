
<script>
  import jsBeautify from 'js-beautify/js/lib/beautify'
  const ace = require('brace')
  require('brace/mode/javascript')
  require('brace/mode/json')
  require('brace/theme/xcode')
  require('brace/ext/language_tools')
  require('brace/ext/searchbox')
  const Dom = ace.acequire('ace/lib/dom')

  export default {
    props: {
      value: {
        type: String,
        default: ''
      },
      readOnly: {
        type: Boolean,
        default: false
      },
      mockSnippets: {
        type: Boolean,
        default: false
      },
      height: {
        type: Number,
        default: 300
      }
    },
    data () {
      return {
        currentValue: '',
        mockValue: ''
      }
    },
    watch: {
      value (val) {
        this.currentValue = val
        this.setValue(val)
      },
      height () {
        this.$nextTick(() => {
          this.editor.resize()
        })
      }
    },
    methods: {
      install (mode) {
        this.editor = ace.edit(this.$refs.editor)
        this.editor.getSession().setMode(`ace/mode/${mode}`)
        this.editor.$blockScrolling = Infinity
        this.editor.setAutoScrollEditorIntoView(true)
        this.editor.setTheme('ace/theme/xcode')
        this.editor.setShowPrintMargin(false)
        if (this.readOnly) {
          this.editor.setReadOnly(true)
          this.editor.renderer.$cursorLayer.element.style.display = 'none'
        }
        if (this.mockSnippets) {
          this.editor.mockSnippets = true
        } else {
          this.editor.mockSnippets = false
        }
        this.editor.setOptions({
          tabSize: 2,
          fontSize: 14,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true, // 智能补全
          useWorker: true
        })
        this.setValue(this.currentValue)
        this.editor.on('change', this.onChange)
        this.editor.commands.addCommand({
          name: 'save',
          bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
          exec: () => {
            this.$emit('save')
          }
        })
        this.editor.commands.addCommand({
          name: 'Toggle Fullscreen',
          bindKey: 'F9',
          exec: () => {
            const fullScreen = Dom.toggleCssClass(document.body, 'fullscreen')
            Dom.setCssClass(this.editor.container, 'fullscreen', fullScreen)
            this.editor.setAutoScrollEditorIntoView(!fullScreen)
            this.editor.resize()
          }
        })
      },
      onChange () {
        this.currentValue = this.editor.getValue()
        this.$emit('change', this.currentValue)
      },
      format (value) {
        return jsBeautify.js_beautify(value, { indent_size: 2 })
      },
      insert (code) {
        const pos = this.editor.selection.getCursor()
        this.editor.session.insert(pos, code)
      },
      setValue (val) {
        if (val) {
          this.editor.setValue(this.format(val))
        } else {
          this.editor.setValue('')
        }
        this.editor.clearSelection()
      },
      getValue () {
        return this.currentValue
      }
    }
  }
</script>

<style lang="less">
  .ace-editor {
    width: 100%;
    height: 300px;

    &.fullscreen {
      height: auto;
      width: auto;
      border: 0;
      margin: 0;
      position: fixed !important;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000000;
    }

    .ace_gutter {
      background: #fbfbfb !important;
    }
    .ace_marker-layer .ace_active-line {
      background: hsla(0, 0%, 0%, 0.041)!important;
    }
  }
</style>
