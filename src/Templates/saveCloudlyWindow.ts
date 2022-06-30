import '../Templates/saveCloudlyWindow.css'

import { Logger, LoggerLevel } from '../Logger/Logger'
const { ipcRenderer } = require('electron')
const { dialog, getCurrentWindow } = require('@electron/remote')


const logger = new Logger('SaveCloudly')
let saveNames: string[] = []

const saveBtnElement = document.getElementById('saveBtn')
const cancelBtnElement = document.getElementById('cancelBtn')

const saveTextElement = <HTMLInputElement>document.getElementById('saveText')

saveBtnElement.addEventListener('click', () => {
    if (saveTextElement.value !== undefined) {
        if (saveNames.includes(saveTextElement.value))
            //prompt for override
            if (!promptOverride())
                return

        ipcRenderer.send('FINALIZE_SAVE', { name: saveTextElement.value })
    }
    getCurrentWindow().close()
})

cancelBtnElement.addEventListener('click', () => {
    getCurrentWindow().close()
})

function promptOverride(): boolean {
    logger.log('Already in db. Prompting for override', LoggerLevel.DBG)

    const response = dialog.showMessageBoxSync(getCurrentWindow(), {
        title: 'Database Warning',
        message: "The entry name you're trying to save already exists in the database. Override?",
        buttons: ["Ok", "Cancel"],
    })
    if (response === 0) // OK
        return true
    if (response === 1) // CANCEL
        return false
}
ipcRenderer.on('DISPATCH_CLOUD_SAVE', (evt: any, data: any) => {
    saveNames = data.names
})