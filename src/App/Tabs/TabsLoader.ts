import { Logger, LoggerLevel } from "../../Logger/Logger";
import IReloadable from "../Configuration/IReloadable";
import CanvasTab from "./CanvasTab";
import TerminalTab from "./TerminalTab";
import Split from 'split.js'
import Configuration from "../Configuration/Configuration";
const { ipcRenderer } = require('electron')


/** Handles the initialization of all tabs present */
export default class TabsLoader implements IReloadable {

    private logger = new Logger('TabsLoader')

    private splitInstance: Split.Instance
    private terminalTab: TerminalTab
    private canvasTab: CanvasTab

    constructor() {
        /* Quick change of UI pos, TO BE REMOVED: works*/
        ipcRenderer.on('UPDATE_UI', () => {
            this.splitInstance.destroy()
            this.splitInstance = Split(['#subview-1', '#subview-2'], {
                sizes: [50, 50],
                direction: 'horizontal'
            })
        })

        /* Split into 2 parts (area 1 & 2) */
        this.splitInstance = Split(['#subview-1', '#subview-2'], {
            sizes: [75, 25],
            direction: 'vertical'
        })
    }

    public initialize() {
        this.terminalTab = new TerminalTab()
        this.canvasTab = new CanvasTab()
        const rightTerminalSide = Configuration.get().param('rightSideTerminal') as boolean

        if (!this.terminalTab.initialize()) {
            this.logger.log('Terminal NOT Initialized!', LoggerLevel.FATAL)
            return false
        }
        if (!this.canvasTab.initialize()) {
            this.logger.log('Canvas NOT Initialized!', LoggerLevel.FATAL)
            return false
        }

        if (this.splitInstance)
            this.splitInstance.destroy()

        /* Split into 2 parts (area 1 & 2) */
        this.splitInstance = Split(['#subview-1', '#subview-2'], {
            sizes: [75, 25],
            direction: rightTerminalSide ? 'horizontal' : 'vertical'
        })
        document.getElementById('application-container').style.flexDirection = rightTerminalSide ? 'row' : 'column'

        this.logger.log('Module initialized!')
        return true
    }

    public getTerminalTab() { return this.terminalTab }

    public getCanvasTab() { return this.canvasTab }

    onConfReload() {
        const rightTerminalSide = Configuration.get().param('rightSideTerminal') as boolean

        if (this.splitInstance)
            this.splitInstance.destroy()

        /* Split into 2 parts (area 1 & 2) */
        this.splitInstance = Split(['#subview-1', '#subview-2'], {
            sizes: [75, 25],
            direction: rightTerminalSide ? 'horizontal' : 'vertical'
        })
        document.getElementById('application-container').style.flexDirection = rightTerminalSide ? 'row' : 'column'

        this.terminalTab.onConfReload()
        this.canvasTab.onConfReload()
    }

    onHardReload() {
        this.terminalTab.onHardReload()
        this.canvasTab.onHardReload()
    }
}