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

const finalSubmit = document.getElementById('final_submit')
const changes: { [key: string]: any } = {}
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

/* CANVAS PREFS WINDOW BEING */
const width = <HTMLInputElement>document.getElementById('width')
const height = <HTMLInputElement>document.getElementById('height')

height.value = Configuration.get().param('canvasHeight').toString()
width.value = Configuration.get().param('canvasWidth').toString()

width.addEventListener('focusout', () => {
    if (!width.value || !height.value) {
        logger.log('No values provided')
        return
    }
    width.value = clamp(500, 2000, parseInt(width.value)).toString()
    height.value = clamp(500, 2000, parseInt(height.value)).toString()
    //IMPARTE ASTEA IN DOUA
})
/* CANVAS PREFS WINDOW END */

/* EXPORTING PREFS WINDOW BEING */
const delayElement = <HTMLInputElement>document.getElementById('delay')
const skipFramesElement = <HTMLInputElement>document.getElementById('skip_frames')
// const submitExport = document.getElementById('submit-export')

delayElement.value = Configuration.get().param('gif_delay').toString()
skipFramesElement.value = Configuration.get().param('frame_skip').toString()

// submitExport.addEventListener('click', () => {
//     let delayInt = parseInt(delayElement.value)
//     let skipFramesInt = parseInt(skipFramesElement.value)
//     delayInt = clamp(100, 1000, delayInt)
//     skipFramesInt = clamp(1, 100, skipFramesInt)

// })
/* EXPORTING PREFS WINDOW END */



finalSubmit.addEventListener('click', () => {
    ipcRenderer.send('PREFS_UPDATE', {
        canvasWidth: width.value,
        canvasHeight: height.value,
        gif_delay: delayElement.value,
        frame_skip: skipFramesElement.value
    })

    /* This will close the prefs window */
    getCurrentWindow().close()
})

function clamp(min: number, max: number, value: number) {
    if (value > max)
        return max
    if (value < min)
        return min
    return value
}