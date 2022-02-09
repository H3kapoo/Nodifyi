import { Logger, LoggerLevel } from "../../Logger/Logger"
import GraphModel from "../GraphModel/GraphModel"
const { ipcRenderer } = require('electron')
const { dialog, getCurrentWindow } = require('@electron/remote')
import { writeFileSync, readFileSync } from "fs"
import Renderer from "../Renderer/Renderer"


export default class SaveLoadFacade {

    private logger = new Logger('SaveLoadFacade')
    private graphModel: GraphModel
    private renderer: Renderer
    private fileExt = '.nod'
    private fileExtNoDot = 'nod'
    private currentlyWorkingPath: string

    public initialize(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer
        this.currentlyWorkingPath = undefined

        ipcRenderer.on('NEW_PROJECT', () => this.newProject())
        ipcRenderer.on('SAVE_LOCALLY', () => this.saveLocally())
        ipcRenderer.on('SAVEAS_LOCALLY', () => this.saveAsLocally())
        ipcRenderer.on('SAVE_CLOULDLY', () => this.saveCloudly())
        ipcRenderer.on('LOAD_LOCALLY', () => this.loadLocally())
        ipcRenderer.on('LOAD_CLOUDLY', () => this.loadCloudly())

        this.logger.log('Module initialized!')
        this.setSaveButtonEnabled(false)

        //DBG
        this.setWindowTitle('Empty Project')
        return true
    }

    private async newProject() {
        if (!this.isProjectClean()) {
            const response = dialog.showMessageBoxSync(getCurrentWindow(), {
                title: 'Project is dirty!',
                message: "Do you want to save it first?",
                buttons: ["Yes", "No", "Cancel"],
            })

            switch (response) {
                case 0: // YES
                    await this.saveAsLocally()
                    break
                case 2: // CANCEL
                    this.logger.log('New project prompt abort..', LoggerLevel.DBG)
                    return
            }
        }

        this.logger.log('Trying create new project..', LoggerLevel.DBG)
        this.graphModel.loadJson({})
        this.renderer.render(false)
        this.logger.log('New project created..', LoggerLevel.DBG)
        this.setProjectClean()
        //TODO: In the future set title dynamically
        this.setWindowTitle('Empty Project')
    }

    private saveLocally() {
        this.logger.log('Trying to save locally..', LoggerLevel.DBG)
        if (!this.currentlyWorkingPath) {
            this.logger.log('Failed to save, no local path set!', LoggerLevel.ERR)
            return
        }

        writeFileSync(this.currentlyWorkingPath, JSON.stringify(this.graphModel.getJson()))
        this.setProjectClean()
        this.logger.log('Project saved locally!', LoggerLevel.DBG)
    }

    private async saveAsLocally() {
        this.logger.log('Trying to save as locally..', LoggerLevel.DBG)

        const res = await dialog.showSaveDialog({})

        if (!res.filePath && res.filePath !== this.fileExt) {
            this.logger.log(`Can't save project, no file path!`, LoggerLevel.WRN)
            return
        }

        const filePath = res.filePath.replace(this.fileExt, '') + this.fileExt
        writeFileSync(filePath, JSON.stringify(this.graphModel.getJson()))
        this.currentlyWorkingPath = filePath
        this.setSaveButtonEnabled(true) // This will 'ungray' the normal Save button
        this.setProjectClean()
        this.setWindowTitle(filePath.replace(/^.*[\\\/]/, ''))
        this.logger.log('Project saved locally!', LoggerLevel.DBG)
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
            this.setWindowTitle(res.filePaths[0].replace(/^.*[\\\/]/, ''))
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

    private setWindowTitle(title: string) {
        getCurrentWindow().setTitle('Nodify | ' + title)
    }

    private setProjectClean() {
        const windowTitle = getCurrentWindow().getTitle()
        //TODO: change to replace just last char if *
        getCurrentWindow().setTitle(windowTitle.replace('*', ''))
    }

    private isProjectClean(): boolean {
        const windowTitle = getCurrentWindow().getTitle()
        if (windowTitle[windowTitle.length - 1] === '*')
            return false
        return true
    }

    private setSaveButtonEnabled(value: boolean) {
        ipcRenderer.send('TOGGLE_SAVE_BTN', { value: value })
    }
}