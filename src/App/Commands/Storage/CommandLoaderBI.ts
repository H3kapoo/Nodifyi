import { Logger, LoggerLevel } from "../../../Logger/Logger"
import { CommandsStruct } from "../../types"
import { ValidTypes } from '../Validation/ValidTypes'


/** Handles the loading of built in commands (not user accessible) */
export default class CommandLoaderBI {
    private logger = new Logger('CommandLoaderBI')

    private commands: CommandsStruct

    public initialize(builtin: Object) {

        if (!Object.entries(builtin).length) {
            this.logger.log('Could not find built-in commands for loading!', LoggerLevel.ERR)
            return false
        }

        const commandsFaker = {}

        for (const [key, command] of Object.entries(builtin)) {

            if (!this.verifyIntegrity(command, key))
                return false

            //@ts-ignore
            if (commandsFaker[command.schema.name]) {
                //@ts-ignore
                this.logger.log(`Command '${command.schema.name}' already exists!`, LoggerLevel.ERR)
                return false
            }

            //@ts-ignore
            commandsFaker[command.schema.name] = { schema: command.schema, logic: command.logic }
        }

        this.commands = commandsFaker
        return true
    }

    private verifyIntegrity(command: Object, key: string): boolean {
        //@ts-ignore
        if (!command.schema) {
            this.logger.log(`Built-in command key ${key} has no schema set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        if (!command.logic) {
            this.logger.log(`Built-in command key ${key} has no logic set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        if (!command.schema.name) {
            this.logger.log(`Built-in command key ${key} has no 'name'!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        if (!command.schema.mandatory) {
            this.logger.log(`Built-in command key ${key} has no 'mandatory' field set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        for (const mandatoryOpt of command.schema.mandatory) {
            //@ts-ignore
            if (!command.schema[mandatoryOpt]) {
                this.logger.log(`Missing mandatory option '${mandatoryOpt}' from schema`, LoggerLevel.ERR)
                return false
            }
        }

        //@ts-ignore
        for (const [opt, argType] of Object.entries(command.schema)) {
            if (opt === 'name' || opt === 'mandatory') continue

            //@ts-ignore
            if (!Object.values(ValidTypes).includes(argType)) {
                this.logger.log(`Argument type for option '${opt}' is not valid (current: ${argType})!`, LoggerLevel.ERR)
                return false
            }
        }
        return true
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }
}