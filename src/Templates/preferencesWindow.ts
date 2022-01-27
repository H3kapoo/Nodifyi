import { Logger, LoggerLevel } from '../Logger/Logger'

const { ipcRenderer } = require('electron')


const width = <HTMLInputElement>document.getElementById('width')
const height = <HTMLInputElement>document.getElementById('height')
const submit = document.getElementById('submit')

submit.addEventListener('click', () => {
    ipcRenderer.send('PREFS_UPDATE', {
        canvasWidth: parseInt(width.value),
        canvasHeight: parseInt(height.value)
    })
})

// console.log('hello');
// let logger = new Logger('GifExporter', LoggerLevel.DBG)

// logger.log('ok')
// function goToFirstWindow(test: any) {
//     console.log('omg');
//     ipcRenderer.send('TESTING', {})
// }

// goToFirstWindow(3)
// //@ts-ignore
// window.goToFirstWindow = goToFirstWindow