const WangEditor = Vue.component('wang-editor', {
    template: `
        <div id="wangEditor" ref="editor"></div>
    `,
    props: {
        value: {
            type: String
        }
    },
    mounted () {
        this.init()
    },
    data () {
        return {
            editor: null,
            config: {
                height: 248 - 42,
                menus: [
                    'bold',
                    'head',
                    'link',
                    'italic',
                    'underline',
                    'image',
                    'video',
                    'emoticon'
                ],
                zIndex: 1,
                emotions: [
                    {
                        title: 'emoji',  // tab 的标题
                        type: 'emoji', // 'emoji' / 'image'
                        // emoji 表情，content 是一个数组即可
                        content: '😀 😃 😄 😁 😆 😅 😂 😊 😇 🙂 🙃 😉 😓 😪 😴 🙄 🤔 😬 🤐'.split(/\s/),
                    }
                ],
                placeholder: 'Enter 发送, Ctrl+Enter 换行',
                onchange: (html) => {
                    this.$emit('input', html)
                },
                onfocus: () => {
                    this.isFocus = true
                },
                onblur: () => {
                    this.isFocus = false
                }
            },
            isFocus: false
        }
    },
    methods: {
        init () {
            this.createEditor()
            this.listenKeydown()
        },
        createEditor () {
            const E = window.wangEditor
            this.editor = new E('#wangEditor')
            this.editor.config = {
                ...this.editor.config,
                ...this.config
            }
            this.editor.create()
        },
        listenKeydown () {
            this.$refs.editor.addEventListener('keydown', (e) => {
                if (this.isFocus) {
                    if (e.code === 'Enter' && !e.ctrlKey) {
                        this.$emit('on-ok')
                    }
                    if (e.code === 'Enter' && e.ctrlKey) {
                        this.editor.txt.append('<br>')
                    }
                }
            })
        }
    },
    watch: {
        value (val) {
            if (val === this.editor.txt.html()) return
            this.editor.txt.html(val)
        }
    }
})
