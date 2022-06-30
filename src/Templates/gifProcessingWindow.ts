import '../Templates/gifProcessingWindow.css'
const { ipcRenderer } = require('electron')


const status = document.getElementById('status')

ipcRenderer.on('GIF_PROCESSING_MESSAGE', (evt: any, val: any) => {
    status.textContent = "Current status: " + val.message
})