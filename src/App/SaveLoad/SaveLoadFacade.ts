import { Logger, LoggerLevel } from "../../Logger/Logger"
import GraphModel from "../GraphModel/GraphModel"
const { ipcRenderer } = require('electron')
const { dialog } = require('@electron/remote')
import { writeFileSync, readFileSync } from "fs"
import Renderer from "../Renderer/Renderer"


export default class SaveLoadFacade {

    private logger = new Logger('SaveLoadFacade')
    private graphModel: GraphModel
    private renderer: Renderer
    private fileExt = '.nod'
    private fileExtNoDot = 'nod'

    public initialize(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer

        ipcRenderer.on('SAVEAS_LOCALLY', () => this.saveAsLocally())
        ipcRenderer.on('SAVE_CLOULDLY', () => this.saveCloudly())
        ipcRenderer.on('LOAD_LOCALLY', () => this.loadLocally())
        ipcRenderer.on('LOAD_CLOUDLY', () => this.loadCloudly())

        this.logger.log('Module initialized!')
        return true
    }

    private saveAsLocally() {
        this.logger.log('Trying to save as locally..', LoggerLevel.DBG)
        dialog.showSaveDialog({}).then((result: any) => {
            let pathToSave = result.filePath.replace(this.fileExt, '') + this.fileExt
            if (pathToSave === this.fileExt) {
                this.logger.log(`Can't save project, no file path!`, LoggerLevel.WRN)
                return
            }
            writeFileSync(pathToSave, JSON.stringify(this.graphModel.getJson()))
            this.logger.log('Project saved locally!', LoggerLevel.DBG)

        }).catch((err: any) => { console.log(err) })
    }

    private async loadLocally() {
        this.logger.log('Trying to load from locally..', LoggerLevel.DBG)

        const res = await dialog.showOpenDialog({
            filters: [
                { name: 'NodifySave', extensions: [this.fileExtNoDot] },
            ]
        })

        if (res.filePaths[0] !== undefined) {
            const content = readFileSync(res.filePaths[0]).toString()

            try {
                this.graphModel.loadJson(JSON.parse(content))
            } catch (ex) {
                this.logger.log('Corrupted save file!', LoggerLevel.FATAL)
                return
            }

            this.logger.log('Project loaded from locally!', LoggerLevel.DBG)
            this.renderer.render(false)
        } else
            this.logger.log('Trying to load from locally but nothing selected!', LoggerLevel.WRN)
    }

    private saveCloudly() {
        //TODO:
    }

    private loadCloudly() {
        //TODO:
    }
}