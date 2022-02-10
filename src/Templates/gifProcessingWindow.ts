import { Logger, LoggerLevel } from '../Logger/Logger'
const { ipcRenderer } = require('electron')


const status = document.getElementById('status')

ipcRenderer.on('GIF_PROCESSING_MESSAGE', (evt: any, val: any) => {
    status.textContent = val.message
})