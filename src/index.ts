// console.log('ceggggg');
// import { Logger, LoggerLevel } from './Logger/Logger'

// const { ipcRenderer } = require('electron')

// ipcRenderer.on('TESTING', () => console.log('am primit'))

// // console.log('hello');
// // let logger = new Logger('App', LoggerLevel.DBG)
// // logger.log('dd')

//@ts-ignore
import Tabby from 'tabbyjs'
import ScrollBooster from 'scrollbooster'
import Split from 'split.js'
import App from "./App/App"

import '../src/App/Styles/Tabby.css'
import '../src/App/Styles/index.css'


new ScrollBooster({
    viewport: document.querySelector('#canvas-container-tab'),
    scrollMode: 'native',
})

/* Create tabs area */
new Tabby('[data-tabs-left]')
new Tabby('[data-tabs-right]')

/* Split into 2 parts (area 1 & 2) */
Split(['#subview-1', '#subview-2'], {
    sizes: [65, 35],
    direction: 'vertical'
})

const app = new App()
