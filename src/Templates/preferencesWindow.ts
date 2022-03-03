import { Logger, LoggerLevel } from '../Logger/Logger'
//@ts-ignore
import Tabby from 'tabbyjs'
const { ipcRenderer } = require('electron')
import './preferencesWindowTabby.css'
import './preferencesWindow.css'
import Configuration from '../App/Configuration/Configuration'
import path from 'path'
import os from 'os'
const { dialog, getCurrentWindow } = require('@electron/remote')


/* Load conf */
const confPath = path.join(os.homedir(), '.defaultConf.json')
Configuration.get().loadConf(confPath)

/* Create tabs area */
new Tabby('[data-tabs-prefs]')
const logger = new Logger('PreferencesWindow', LoggerLevel.ERR)

const finalSubmit = document.getElementById('final_submit')
const tabsIds = [
    'canvas-prefs-tab',
    'commands-prefs-tab',
    'exporting-prefs-tab',
    'terminal-prefs-tab',
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
const hsep = <HTMLInputElement>document.getElementById('hsep')
const vsep = <HTMLInputElement>document.getElementById('vsep')
const bgGrid = <HTMLInputElement>document.getElementById('bgGrid')
const bgConstraint = <HTMLInputElement>document.getElementById('bgConstraint')

height.value = Configuration.get().param('canvasHeight').toString()
width.value = Configuration.get().param('canvasWidth').toString()
hsep.value = Configuration.get().param('backgroundHsep').toString()
vsep.value = Configuration.get().param('backgroundVsep').toString()
bgGrid.checked = Configuration.get().param('backgroundGridDraw') as boolean
bgConstraint.checked = Configuration.get().param('backgroundConstraint') as boolean

bgConstraint.disabled = hsep.disabled = vsep.disabled = !bgGrid.checked

width.addEventListener('focusout', () => {
    if (!width.value) {
        logger.log('No value provided for width!', LoggerLevel.WRN)
        width.value = "500"
    }

    width.value = clamp(500, 2000, parseInt(width.value)).toString()
})
height.addEventListener('focusout', () => {
    if (!height.value) {
        logger.log('No value provided for height!', LoggerLevel.WRN)
        height.value = "500"
    }
    height.value = clamp(500, 2000, parseInt(height.value)).toString()
})
hsep.addEventListener('focusout', () => {
    if (!hsep.value) {
        logger.log('No value provided for horizontal separation!', LoggerLevel.WRN)
        hsep.value = "100"
    }

    hsep.value = clamp(20, 300, parseInt(hsep.value)).toString()
    vsep.value = bgConstraint.checked ? hsep.value : vsep.value
})
vsep.addEventListener('focusout', () => {
    if (!vsep.value) {
        logger.log('No value provided for vertical separation!', LoggerLevel.WRN)
        vsep.value = "100"
    }
    vsep.value = clamp(20, 300, parseInt(vsep.value)).toString()
    hsep.value = bgConstraint.checked ? vsep.value : hsep.value
})
bgConstraint.addEventListener('change', () => {
    hsep.value = bgConstraint.checked ? vsep.value : hsep.value
})
bgGrid.addEventListener('change', () => {
    bgConstraint.disabled = hsep.disabled = vsep.disabled = !bgGrid.checked
})
bgGrid.addEventListener('focus', () => {
    bgConstraint.disabled = hsep.disabled = vsep.disabled = !bgGrid.checked
})
/* CANVAS PREFS WINDOW END */

/* COMMANDS PREFS WINDOW BEING */
const udPathElement = <HTMLInputElement>document.getElementById('udPath')

udPathElement.value = Configuration.get().param('udPath').toString()
udPathElement.addEventListener('click', () => {
    //TODO:
    dialog.showOpenDialog(getCurrentWindow(), {
        properties: ['openDirectory']
    }).then((result: any) => {
        console.log(result.filePaths)
        if (!result.filePaths.length && !result.filePaths[0]) {
            logger.log('No folder was selected', LoggerLevel.WRN)
            return
        }
        udPathElement.value = result.filePaths[0]

    }).catch((err: any) => { console.log(err) })

})
/* COMMANDS PREFS WINDOW END */

/* EXPORTING PREFS WINDOW BEING */
const delayElement = <HTMLInputElement>document.getElementById('delay')
const skipFramesElement = <HTMLInputElement>document.getElementById('skip_frames')

delayElement.value = Configuration.get().param('gif_delay').toString()
skipFramesElement.value = Configuration.get().param('frame_skip').toString()

delayElement.addEventListener('focusout', () => {
    if (!delayElement.value) {
        logger.log('No value provided for delay!', LoggerLevel.WRN)
        delayElement.value = "100"
    }
    delayElement.value = clamp(100, 1000, parseInt(delayElement.value)).toString()
})
skipFramesElement.addEventListener('focusout', () => {
    if (!skipFramesElement.value) {
        logger.log('No value provided for skipFrames!', LoggerLevel.WRN)
        skipFramesElement.value = "1"
    }
    skipFramesElement.value = clamp(1, 100, parseInt(skipFramesElement.value)).toString()
})
/* EXPORTING PREFS WINDOW END */

/* TERMINAL PREFS WINDOW BEING */
const pretextElement = <HTMLInputElement>document.getElementById('pretext')

pretextElement.value = Configuration.get().param('beginTerminalText').toString()

pretextElement.addEventListener('focusout', () => {
    if (!pretextElement.value) {
        logger.log('No value provided for pretext!', LoggerLevel.WRN)
        pretextElement.value = Configuration.get().param('beginTerminalText').toString()
    }

    if (pretextElement.value.length < 3 || pretextElement.value.length > 20) {
        logger.log('Pretext too short or too long!', LoggerLevel.WRN)
        pretextElement.value = Configuration.get().param('beginTerminalText').toString()
    }
})
/* TERMINAL PREFS WINDOW END */


finalSubmit.addEventListener('click', () => {
    ipcRenderer.send('PREFS_UPDATE', {
        canvasWidth: parseInt(width.value),
        canvasHeight: parseInt(height.value),
        gif_delay: parseInt(delayElement.value),
        frame_skip: parseInt(skipFramesElement.value),
        backgroundHsep: parseInt(hsep.value),
        backgroundVsep: parseInt(vsep.value),
        backgroundConstraint: bgConstraint.checked,
        backgroundGridDraw: bgGrid.checked,
        beginTerminalText: pretextElement.value,
        udPath: udPathElement.value
    })

    /* This will close the prefs window */
    // getCurrentWindow().close()
})

function clamp(min: number, max: number, value: number) {
    if (value > max)
        return max
    if (value < min)
        return min
    return value
}