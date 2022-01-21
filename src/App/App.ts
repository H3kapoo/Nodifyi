import GraphModel from "./GraphModel/GraphModel"
import { Logger, LoggerLevel } from "../Logger/Logger"
import Configuration from "./Configuration/Configuration"
import os from 'os'
import path from 'path'
import TerminalTab from "./Tabs/TerminalTab"
import Parser from "./Commands/Parser/Parser"
import Executor from "./Commands/Executor/Executor"
import CommandStore from "./Commands/Storage/CommandStore"

const { ipcRenderer } = require('electron')

/** Main application entry class*/
export default class App {
    private logger = new Logger('App')

    private commandStore: CommandStore
    private graphModel: GraphModel
    private terminalTab: TerminalTab
    private parser: Parser
    private executor: Executor

    constructor() {
        this.initialize()
        this.logger.log('Initialized')
    }

    private initialize(): void {
        const confPath = path.join(os.homedir(), '.defaultConf.json')

        if (!Configuration.get().loadConf(confPath)) {
            this.logger.log(`--- APPLICATION ABORT | CONTACT OWNER ---`, LoggerLevel.ERR)
            return
        }

        this.initializeAndSubscribeComponents()
    }

    private initializeAndSubscribeComponents() {
        /* Init modules */
        this.terminalTab = new TerminalTab()
        this.commandStore = new CommandStore()
        this.graphModel = new GraphModel()
        this.parser = new Parser()
        this.executor = new Executor()

        /* Subscribe for input events from terminal tab */
        this.terminalTab.subscribeOnKeyPress('Enter', this.parser)

        /* Subscribe for when something gets parsed */
        this.parser.subscribeOnParsed(this.executor)

        /* Subscribe modules that are affected by conf reload */
        Configuration.get().subscribeReloadable(this.commandStore)
        Configuration.get().subscribeReloadable(this.graphModel)

        /** DBG ONLY - TBR */
        ipcRenderer.on('RELOAD_CONFIG', () => {
            Configuration.get().updateCurrentConf({
                "udPath": "/home/hekapoo/Documents/_Licence/nodify2/src/App/Commands/UserDefinedDummy"
            })
        })

        this.logger.log('Components initialized & subscribbed!')
    }
}