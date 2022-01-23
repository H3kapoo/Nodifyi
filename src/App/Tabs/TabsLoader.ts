import { Logger, LoggerLevel } from "../../Logger/Logger";
import IAppStartup from "../IAppStartup";
import CanvasTab from "./CanvasTab";
import TerminalTab from "./TerminalTab";


/** Handles the initialization of all tabs present */
export default class TabsLoader implements IAppStartup {

    private logger = new Logger('TabsLoader')

    private terminalTab: TerminalTab
    private canvasTab: CanvasTab

    public initialize() {
        this.terminalTab = new TerminalTab()
        this.canvasTab = new CanvasTab()

        if (!this.terminalTab.initialize()) {
            this.logger.log('Terminal NOT Initialized!', LoggerLevel.ERR)
            return false
        }
        if (!this.canvasTab.initialize()) {
            this.logger.log('Canvas NOT Initialized!', LoggerLevel.ERR)
            return false
        }
        return true
    }

    public getTerminalTab() { return this.terminalTab }

    public getCanvasTab() { return this.canvasTab }

    public getModuleName(): string { return this.logger.getContext() }
}