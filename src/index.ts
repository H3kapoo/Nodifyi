//@ts-ignore
import Tabby from 'tabbyjs'
import Split from 'split.js'
import App from "./App/App"
import '../src/App/Styles/Tabby.css'
import '../src/App/Styles/index.css'


/* Create tabs area */
new Tabby('[data-tabs-left]')
new Tabby('[data-tabs-right]')

/* Split into 2 parts (area 1 & 2) */
Split(['#subview-1', '#subview-2'], {
    sizes: [65, 35],
    direction: 'vertical'
})

const app = new App()
