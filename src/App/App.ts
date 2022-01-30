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
    private gifExporter: GIFExporter

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log(`--- APPLICATION ABORT | CONTACT OWNER ---`, LoggerLevel.ERR)
    }

    private initialize() {
        const confPath = path.join(os.homedir(), '.defaultConf.json')

        if (!Configuration.get().loadConf(confPath) || !this.initializeAndSubscribeComponents())
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
        this.gifExporter = new GIFExporter()

        /* Initialize all components */
        const startupMods = [
            this.commandStore.initialize(),
            this.graphModel.initialize(),
            this.tabsLoader.initialize(),
            this.renderer.initialize(this.graphModel),
            this.parser.initialize(),
            this.executor.initialize(this.graphModel, this.renderer),
            this.gifExporter.initialize(this.renderer)
        ]

        const allStarted = startupMods.every(inited => inited === true)

        if (!allStarted)
            return false

        /* Subscribe for input events from terminal tab */
        this.tabsLoader.getTerminalTab().subscribeOnKeyPress('Enter', this.parser)

        /* Subscribe for when something gets parsed */
        this.parser.subscribeOnParsed(this.executor)
        this.parser.subscribeCommands(this.commandStore.getCommands())

        /* Subscribe commands store, graphModel and renderer to Executor */
        this.executor.subscribeCommands(this.commandStore.getCommands())

        /* Subscribe the graphModel & canvas context to the Renderer*/
        this.renderer.subscribeCanvas(this.tabsLoader.getCanvasTab().getCanvas())

        /* Subscribe modules that are affected by conf reload */
        Configuration.get().subscribeReloadable(this.commandStore)
        Configuration.get().subscribeReloadable(this.graphModel)
        Configuration.get().subscribeReloadable(this.tabsLoader.getCanvasTab())
        Configuration.get().subscribeReloadable(this.renderer)

        /** DBG ONLY - TBR */
        ipcRenderer.on('RELOAD_CONFIG', () => {
            // Configuration.get().updateCurrentConf({
            //     "udPath": "/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy",
            //     "canvasWidth": 1500,
            //     "canvasHeight": 1500
            // })
            // this.renderer.render()
        })

        ipcRenderer.on('PREFS_UPDATE', (evt: any, val: any) => {
            Configuration.get().updateCurrentConf({
                "udPath": "/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy",
                "canvasWidth": val.canvasWidth,
                "canvasHeight": val.canvasHeight
            })
            this.renderer.render(false)
            ipcRenderer.send('PREFS_UPDATE_CLOSE', {})
        })

        /* Start-app render trigger */
        this.renderer.render()

        this.logger.log('Components initialized & subscribbed!')
        return true
    }
}