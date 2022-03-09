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
import SaveLoadFacade from "./SaveLoad/SaveLoadFacade"
import ExportManager from "./Exporting/ExportManager"
import { GraphNodeSet } from "./types"
import ShareManager from "./Sharing/ShareManager"
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
    private shareManager: ShareManager
    private saveLoadFacade: SaveLoadFacade

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
        this.shareManager = new ShareManager()
        this.saveLoadFacade = new SaveLoadFacade()

        /* Initialize all components */
        const startupMods = [
            this.commandStore.initialize(),
            this.graphModel.initialize(),
            this.tabsLoader.initialize(),
            this.renderer.initialize(this.graphModel, this.tabsLoader.getCanvasTab().getCanvas()),
            this.parser.initialize(this.commandStore.getCommands()),
            this.executor.initialize(this.graphModel, this.renderer, this.commandStore.getCommands()),
            this.shareManager.initialize(this.graphModel, this.tabsLoader.getCanvasTab().getCanvas()),
            this.exportManager.initialize(this.renderer, this.tabsLoader.getCanvasTab().getCanvas()),
            this.saveLoadFacade.initialize(this.graphModel, this.renderer)
        ]

        const allStarted = startupMods.every(inited => inited === true)

        if (!allStarted)
            return false

        /* Subscribe for input events from terminal tab */
        this.tabsLoader.getTerminalTab().subscribeOnKeyPress('Enter', this.parser)

        /* Subscribe for when something gets parsed */
        this.parser.subscribeOnParsed(this.executor)

        //TODO: BIG BIG TODO, MOVE THOSE IN THEIR OWN CLASSES, NO NEED FOR THEM HERE IN THE OPEN
        /* Subscribe modules that are affected by conf reload */
        Configuration.get().subscribeReloadable(this.commandStore)
        Configuration.get().subscribeReloadable(this.tabsLoader)
        Configuration.get().subscribeReloadable(this.renderer)
        Configuration.get().subscribeReloadable(this.exportManager)

        /* Subscribe hard reloadables to saveLoadFacade, objects that might need more cleanup */
        this.saveLoadFacade.subscribeHardReloadables([
            this.graphModel, this.exportManager, this.renderer, this.executor])

        /* Preferences might affect every reloadable, so update them all */
        ipcRenderer.on('PREFS_UPDATE', (evt: any, val: any) => {
            Configuration.get().updateCurrentConf(val)
            // This shall be differentiated
            this.parser.updateCommands(this.commandStore.getCommands())
            this.executor.updateCommands(this.commandStore.getCommands())
            this.renderer.render(false)
        })

        /* Commands only affect..commands, so reload only those */
        ipcRenderer.on('RELOAD_COMMANDS', () => {
            Configuration.get().reloadOnly(this.commandStore)
            this.parser.updateCommands(this.commandStore.getCommands())
            this.executor.updateCommands(this.commandStore.getCommands())
        })

        /* Toggle if indexing shall be present on nodes, not the best place to put it..*/
        ipcRenderer.on('TOGGLE_INDEXING', () => {
            const nodes: GraphNodeSet = this.graphModel.getModel()
            for (const [id, node] of Object.entries(nodes)) {
                //@ts-ignore
                node.graphNode.toggleHeadsUpIndexing()
            }
            this.renderer.render(false)
        })

        /* Start-app render trigger */
        this.renderer.render(false)
        this.logger.log('Components initialized & subscribbed!')
        return true
    }
}