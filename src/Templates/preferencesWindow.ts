import { Logger, LoggerLevel } from '../Logger/Logger'
//@ts-ignore
import Tabby from 'tabbyjs'
const { ipcRenderer } = require('electron')
const { getCurrentWindow } = require('@electron/remote')
import './preferencesWindowTabby.css'
import './preferencesWindow.css'
import Configuration from '../App/Configuration/Configuration'
import path from 'path'
import os from 'os'

/* Load conf */
const confPath = path.join(os.homedir(), '.defaultConf.json')
Configuration.get().loadConf(confPath)

/* Create tabs area */
new Tabby('[data-tabs-prefs]')
const logger = new Logger('PreferencesWindow', LoggerLevel.ERR)

document.addEventListener('tabby', (event) => {
    //@ts-ignore
    console.log(event.target.style)
    //@ts-ignore
    console.log(window.getComputedStyle(event.detail.previousContent).display)
    document.getElementById('canvas-prefs-tab').style.display = 'none'
    //deci asa cu switching tre //TODO:
})

/* Get relevant object*/
const width = <HTMLInputElement>document.getElementById('width')
const height = <HTMLInputElement>document.getElementById('height')
const submit = document.getElementById('submit')

height.value = Configuration.get().param('canvasHeight').toString()
width.value = Configuration.get().param('canvasWidth').toString()

submit.addEventListener('click', () => {
    if (!width.value || !height.value) {
        logger.log('No values provided')
        return
    }

    let w = parseInt(width.value)
    let h = parseInt(height.value)
    w = w < 200 ? 500 : w
    h = h < 200 ? 500 : h

    ipcRenderer.send('PREFS_UPDATE', {
        canvasWidth: w,
        canvasHeight: h
    })

    getCurrentWindow().close()

})
