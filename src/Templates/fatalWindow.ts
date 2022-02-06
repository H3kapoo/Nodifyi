import { Logger, LoggerLevel } from '../Logger/Logger'
import './fatalWindow.css'
const { ipcRenderer } = require('electron')
const { getCurrentWindow } = require('@electron/remote')


const fatalErrorElement = <HTMLElement>document.getElementById('fatal-error')
const exitButton = <HTMLButtonElement>document.getElementById('exit-button')

ipcRenderer.on('FATAL_ERROR_MESSAGE', (evt: any, val: any) => {
    fatalErrorElement.textContent += '\n' + val.msg
})

exitButton.addEventListener('click', () => {
    /* This will close the prefs window */
    getCurrentWindow().getParentWindow().close()
})
