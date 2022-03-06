import '../Templates/saveCloudlyWindow.css'

import { Logger, LoggerLevel } from '../Logger/Logger'
const { ipcRenderer } = require('electron')
const { dialog, getCurrentWindow } = require('@electron/remote')


const logger = new Logger('SaveCloudly')
logger.log('called')

const status = document.getElementById('status')
ipcRenderer.on('DISPATCH_CLOUD_SAVE', (evt: any, val: any) => {
    // status.textContent = val.names[0]
    // close window before dispatch

    // getCurrentWindow().close()

    // ipcRenderer.send('DISPATCH_FINALIZE_SAVE', {
    //     name: 'LOl'
    // })
})