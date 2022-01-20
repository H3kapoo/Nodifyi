import { Logger, LoggerLevel } from '../Logger/Logger'

const { ipcRenderer } = require('electron')


console.log('hello');
let logger = new Logger('GifExporter', LoggerLevel.DBG)

logger.log('ok')
function goToFirstWindow(test: any) {
    console.log('omg');
    ipcRenderer.send('TESTING', {})
}

goToFirstWindow(3)
//@ts-ignore
window.goToFirstWindow = goToFirstWindow