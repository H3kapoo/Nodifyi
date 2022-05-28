//@ts-ignore
import Tabby from 'tabbyjs'
import Split from 'split.js'
import App from "./App/App"
import '../src/App/Styles/Tabby.css'
import '../src/App/Styles/index.css'


/* Create tabs area */
new Tabby('[data-tabs-left]')
new Tabby('[data-tabs-right]')

const app = new App()
