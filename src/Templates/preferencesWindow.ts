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

const tabsIds = [
    'canvas-prefs-tab',
    'commands-prefs-tab',
    'exporting-prefs-tab',
]

/* Hide other tabs besides the first one */
tabsIds.forEach(tabId => {
    if (tabId !== tabsIds[0])
        document.getElementById(tabId).style.display = 'none'
})

document.addEventListener('tabby', (event) => {
    /* Assume every display is 'flex' */
    //@ts-ignore
    const currentTabId = event.detail.tab.id.split('_')[1]

    //set previous tab & all thats not current to display to 'none'
    tabsIds.forEach(tabId => {
        if (tabId !== currentTabId)
            document.getElementById(tabId).style.display = 'none'
    })

    //set current tab display to whatever display was ('flex')
    //@ts-ignore
    document.getElementById(currentTabId).style.display = 'flex'
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

    /* This will close the prefs window */
    getCurrentWindow().close()
})
