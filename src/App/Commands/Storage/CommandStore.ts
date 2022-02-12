import { Logger, LoggerLevel } from "../../../Logger/Logger"
import CommandLoaderBI from "./CommandLoaderBI"
import CommandLoaderUD from "./CommandLoaderUD"
import { CommandsStruct } from "../../types"
import IReloadable from "../../Configuration/IReloadable"
import Configuration from "../../Configuration/Configuration"
const builtin = require('../BuiltinCommands/builtin')


export default class CommandStore implements IReloadable {
    private logger = new Logger('CommandStore')

    private loaderBI: CommandLoaderBI
    private loaderUD: CommandLoaderUD

    private commands: CommandsStruct

    public initialize() {
        const udPath = Configuration.get().param('udPath') as string

        this.loaderBI = new CommandLoaderBI()
        this.loaderUD = new CommandLoaderUD()

        if (!this.loaderBI.initialize(builtin)) {
            this.logger.log(`Fatal error! Built-in commands error overflow!`, LoggerLevel.FATAL)
            return false
        }

        if (!this.loaderUD.initialize(udPath)) {
            this.logger.log(`Fatal error! User-defined commands error overflow!`, LoggerLevel.FATAL)
            return false
        }

        this.commands = this.mergeSources(this.loaderBI.getCommands(), this.loaderUD.getCommands())

        if (!this.commands)
            return false
        return true
    }

    private mergeSources(commandsBI: CommandsStruct, commandsUD: CommandsStruct): CommandsStruct {
        const commandsFaker = commandsBI

        for (const [name, value] of Object.entries(commandsUD)) {
            if (commandsFaker[name]) {
                this.logger.log(`Internal command '${name}' cannot be redefined by user!`, LoggerLevel.FATAL)
                return null
            }
            commandsFaker[name] = value
        }
        return commandsFaker
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }

    public onConfReload(): void {
        this.commands = {}
        if (this.initialize())
            this.logger.log('Sucessfully conf reloaded!', LoggerLevel.DBG)
        else
            this.logger.log('NOT Successfully conf reloaded!', LoggerLevel.ERR)
    }

    public onHardReload() { }
}
