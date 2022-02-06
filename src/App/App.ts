import GraphModel from "./GraphModel/GraphModel"
import { Logger, LoggerLevel } from "../Logger/Logger"
import Configuration from "./Configuration/Configuration"
import os from 'os'
import path from 'path'
import Renderer from "./Renderer/Renderer"
import TabsLoader from "./Tabs/TabsLoader"
import Parser from "./Commands/Parser/Parser"
import Executor from "./Commands/Executor/Executor"
import CommandStore from "./Commands/Storage/CommandStore"
import GIFExporter from "./Exporting/GIFExporter"
import ExportManager from "./Exporting/ExportManager"
const { ipcRenderer } = require('electron')


/** Main application entry class*/
export default class App {
    private logger = new Logger('App')

    private commandStore: CommandStore
    private graphModel: GraphModel
    private renderer: Renderer
    private tabsLoader: TabsLoader
    private parser: Parser
    private executor: Executor
    private exportManager: ExportManager

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log(`--- APPLICATION ABORT | CONTACT OWNER ---`, LoggerLevel.FATAL)
    }

    private initialize() {
        const confPath = path.join(os.homedir(), '.defaultConf.json')

        if (!Configuration.get().loadConfOrDefault(confPath) || !this.initializeAndSubscribeComponents())
            return false
        return true
    }

    private initializeAndSubscribeComponents() {
        /* Init modules */
        this.tabsLoader = new TabsLoader()
        this.commandStore = new CommandStore()
        this.graphModel = new GraphModel()
        this.renderer = new Renderer()
        this.parser = new Parser()
        this.executor = new Executor()
        this.exportManager = new ExportManager()

        /* Initialize all components */
        const startupMods = [
            this.commandStore.initialize(),
            this.graphModel.initialize(),
            this.tabsLoader.initialize(),
            this.renderer.initialize(this.graphModel, this.tabsLoader.getCanvasTab().getCanvas()),
            this.parser.initialize(this.commandStore.getCommands()),
            this.executor.initialize(this.graphModel, this.renderer, this.commandStore.getCommands()),
            this.exportManager.initialize(this.renderer, this.tabsLoader.getCanvasTab().getCanvas())
        ]

        const allStarted = startupMods.every(inited => inited === true)

        if (!allStarted)
            return false

        /* Subscribe for input events from terminal tab */
        this.tabsLoader.getTerminalTab().subscribeOnKeyPress('Enter', this.parser)

        /* Subscribe for when something gets parsed */
        this.parser.subscribeOnParsed(this.executor)

        /* Subscribe modules that are affected by conf reload */
        Configuration.get().subscribeReloadable(this.commandStore)
        Configuration.get().subscribeReloadable(this.graphModel)
        Configuration.get().subscribeReloadable(this.tabsLoader.getCanvasTab())
        Configuration.get().subscribeReloadable(this.renderer)
        Configuration.get().subscribeReloadable(this.exportManager)

        ipcRenderer.on('PREFS_UPDATE', (evt: any, val: any) => {
            Configuration.get().updateCurrentConf({
                "udPath": "/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy",
                "canvasWidth": val.canvasWidth,
                "canvasHeight": val.canvasHeight
            })
            this.renderer.render(false)
        })

        /* Start-app render trigger */
        this.renderer.render()

        this.logger.log('Components initialized & subscribbed!')
        return true
    }
}