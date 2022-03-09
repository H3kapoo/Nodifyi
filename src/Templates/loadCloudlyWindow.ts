import '../Templates/loadCloudlyWindow.css'

import { Logger, LoggerLevel } from '../Logger/Logger'
const { ipcRenderer } = require('electron')
const { dialog, getCurrentWindow } = require('@electron/remote')


const logger = new Logger('SaveCloudly')
let saveNames: string[] = []

const loadBtnElement = document.getElementById('loadBtn')
const cancelBtnElement = document.getElementById('cancelBtn')

const nameBaseElement = document.getElementById('nameBase')
const noEntriesElement = document.getElementById('noEntries')

let selectedLi: HTMLLIElement = null

loadBtnElement.addEventListener('click', () => {
    if (selectedLi != null)
        ipcRenderer.send('FINALIZE_LOAD', { name: selectedLi.innerText })
    getCurrentWindow().close()
})

cancelBtnElement.addEventListener('click', () => {
    getCurrentWindow().close()
})

ipcRenderer.on('DISPATCH_CLOUD_LOAD', (evt: any, data: any) => {
    saveNames = data.names

    saveNames.forEach(saveName => {
        const liElement = document.createElement('li')
        liElement.innerText = saveName

        liElement.addEventListener('click', () => {
            if (selectedLi)
                selectedLi.style.backgroundColor = 'rgb(240, 240, 240)'
            selectedLi = liElement
            liElement.style.backgroundColor = '#40ff00'
        })

        liElement.addEventListener('mouseenter', () => {
            liElement.style.backgroundColor = '#40ff00'
            if (selectedLi != liElement)
                liElement.style.backgroundColor = '#bfbfbf'
        })
        liElement.addEventListener('mouseleave', () => {
            liElement.style.backgroundColor = 'rgb(240, 240, 240)'
            if (selectedLi === liElement)
                liElement.style.backgroundColor = '#40ff00'

        })
        nameBaseElement.appendChild(liElement)
    });

    if (saveNames.length)
        noEntriesElement.style.display = 'none'
})