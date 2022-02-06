const { ipcRenderer } = require('electron')
const { dialog } = require('@electron/remote')
import { writeFileSync } from "fs"


enum ImgType {
    PNG, JPEG
}

export default class ImageExporter {

    private canvas: HTMLCanvasElement

    public initialize(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        ipcRenderer.on('TOGGLE_EXPORT_PNG', () => this.handleExport(ImgType.PNG))
        return true
    }

    private handleExport(type: ImgType) {
        console.log('toggled');

        const data = this.canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "")
        this.showAndSave(data)
    }

    private showAndSave(data: string) {
        dialog.showSaveDialog({}).then((result: any) => {
            let pathToSave = result.filePath.replace('.png', '') + '.png'
            writeFileSync(pathToSave, data, 'base64')
        }).catch((err: any) => { console.log(err) })
    }
}