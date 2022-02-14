import { Logger, LoggerLevel } from "../../../Logger/Logger";
import IReloadable from "../../Configuration/IReloadable";
import GraphModel from "../../GraphModel/GraphModel";
import Renderer from "../../Renderer/Renderer";
import { GraphCombined } from "../../types";
import APIHolder from "./APIHolder";
const { ipcRenderer } = require('electron')


export default class UndoRedo implements IReloadable {
    logger = new Logger('UndoRedo')

    graphModel: GraphModel
    renderer: Renderer
    apiHolder: APIHolder
    graphHistory: GraphCombined[]
    historyOffset: number
    maxHistoryRecords: number

    constructor(graphModel: GraphModel, renderer: Renderer, apiHolder: APIHolder) {
        this.graphModel = graphModel
        this.renderer = renderer
        this.apiHolder = apiHolder
        this.graphHistory = []
        this.historyOffset = 0
        this.maxHistoryRecords = 10
        this.memorize()
        ipcRenderer.on('UNDO_ACTION', () => this.undoAction())
        ipcRenderer.on('REDO_ACTION', () => this.redoAction())
    }

    public memorize() {
        if (this.graphHistory.length === this.maxHistoryRecords) {
            this.logger.log('Max history achieved, removing from beggining', LoggerLevel.WRN)
            this.graphHistory.shift()
        }
        this.graphHistory.push(this.graphModel.getCombinedCopy())
        this.historyOffset = this.graphHistory.length - 1
    }

    private undoAction() {
        if (this.historyOffset <= 0) {
            this.logger.log('Cannot undo anymore, offset min reached', LoggerLevel.WRN)
            return
        }

        // handle case if renderer is animating while trying to undo
        if (this.renderer.isBusyDrawing()) {
            this.logger.log('Is rendering also, so interrupt', LoggerLevel.DBG)
            this.apiHolder.setAPIBlocked(true)
            this.renderer.interruptRender()
        }

        this.historyOffset--
        this.graphModel.setCombined(this.graphHistory[this.historyOffset])
        this.renderer.render(false)
    }

    private redoAction() {
        if (this.historyOffset >= this.graphHistory.length - 1) {
            this.logger.log('Cannot redo anymore, offset max reached', LoggerLevel.WRN)
            return
        }
        this.historyOffset++
        this.graphModel.setCombined(this.graphHistory[this.historyOffset])
        this.renderer.render(false)
    }

    public onConfReload() { }

    public onHardReload() {
        this.graphHistory = []
        this.historyOffset = 0
        this.maxHistoryRecords = 10
        this.memorize()
        this.logger.log('Successfully hard reloaded!', LoggerLevel.DBG)
    }
}