import { Logger, LoggerLevel } from "../../../Logger/Logger"
import CommandLoaderBI from "./CommandLodaderBI"
import CommandLoaderUD from "./CommandLoaderUD"
import { CommandsStruct } from "../../types"
import IReloadable from "../../Configuration/IReloadable"
import path from 'path'
import Configuration from "../../Configuration/Configuration"


export default class CommandStore implements IReloadable {

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
        const udPath = Configuration.get().param('udPath') as string
        this.loaderBI = new CommandLoaderBI()
        this.loaderUD = new CommandLoaderUD(udPath)

        const commandsBI = this.loaderBI.getCommands()
        const commandsUD = this.loaderUD.getCommands()

        if (!commandsBI) {
            this.logger.log(`Fatal error! Built-in commands error overflow!`, LoggerLevel.ERR)
            return false
        }

        if (!commandsUD) {
            this.logger.log(`Fatal error! User-defined commands error overflow!`, LoggerLevel.ERR)
            return false
        }

        const commandsFaker = commandsBI

        for (const [name, value] of Object.entries(commandsUD)) {
            if (commandsFaker[name]) {
                this.logger.log(`Internal command '${name}' cannot be redefined by user!`, LoggerLevel.ERR)
                return false
            }
            commandsFaker[name] = value
        }
        this.commands = commandsFaker
        return true
    }

    public onConfReload(): void {
        this.logger.log('Reloading..')
        if (this.initialize())
            this.logger.log('Initialized by Reload')
        else
            this.logger.log('NOT Initialized by Reload')
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }
}
