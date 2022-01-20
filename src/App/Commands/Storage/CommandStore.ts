import { Logger, LoggerLevel } from "../../../Logger/Logger"
import CommandLoaderBI from "./CommandLodaderBI"
import CommandLoaderUD from "./CommandLoaderUD"
import { CommandsStruct } from "../../types"


export default class CommandStore {
    private logger = new Logger('CommandStore')

    private loaderBI: CommandLoaderBI
    private loaderUD: CommandLoaderUD

    private commands: CommandsStruct

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        this.commands = {}
        this.loaderBI = new CommandLoaderBI()
        this.loaderUD = new CommandLoaderUD()

        let commandsBI = this.loaderBI.getCommands()
        let commandsUD = this.loaderUD.getCommands()

        if (!commandsBI) {
            this.logger.log(`Fatal error! Built-in commands error overflow!`, LoggerLevel.ERR)
            return false
        }

        // this is retarded, really
        if (!commandsUD) {
            this.logger.log(`Fatal error! User-defined commands error overflow!`, LoggerLevel.ERR)
            return false
        }

        // merge commands into one package..
        return true
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }

}