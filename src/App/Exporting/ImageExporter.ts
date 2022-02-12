const { ipcRenderer } = require('electron')
const { dialog } = require('@electron/remote')
import { writeFileSync } from "fs"
import { Logger, LoggerLevel } from "../../Logger/Logger"
import IReloadable from "../Configuration/IReloadable"


enum ImgType { PNG, JPEG }

export default class ImageExporter implements IReloadable {

    private logger = new Logger('ImageExporter')
    private canvas: HTMLCanvasElement

    constructor() {
        ipcRenderer.on('TOGGLE_EXPORT_PNG', () => this.handleExport(ImgType.PNG))
    }

    public initialize(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        return true
    }

    private handleExport(type: ImgType) {
        const data = this.canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "")
        this.showAndSave(data)
    }

    private showAndSave(data: string) {
        dialog.showSaveDialog({}).then((result: any) => {
            let pathToSave = result.filePath.replace('.png', '') + '.png'
            writeFileSync(pathToSave, data, 'base64')
        }).catch((err: any) => { console.log(err) })
    }

    public onConfReload() {
        this.logger.log(`Successfully conf reloaded!`, LoggerLevel.DBG)
    }
    public onHardReload() {
    }


}