import { Logger, LoggerLevel } from "../../../Logger/Logger"
import { ValidTypes } from "../Validation/ValidTypes"
import { CommandsStruct } from "../../types"
import path from 'path'
import fs from 'fs'


/** Handles the loading of user defined commands (user accessible) */
export default class CommandLoaderUD {
    private logger = new Logger('CommandLoaderUD')

    private commands: CommandsStruct

    public initialize(directoryPath: string) {
        const commandsFaker = {}

        const cmdPaths: string[] = this.getCommandPaths(directoryPath)

        if (!cmdPaths)
            return false

        for (const cmdPath of cmdPaths) {
            const object = this.getObject(cmdPath)

            if (!object)
                return false

            if (!this.verifyIntegrity(object, cmdPath))
                return false

            //@ts-ignore
            if (commandsFaker[object.schema.name]) {
                //@ts-ignore
                this.logger.log(`User defined command '${object.schema.name}' already exists!`, LoggerLevel.FATAL)
                return false
            }

            //@ts-ignore
            commandsFaker[object.schema.name] = { schema: object.schema, logic: object.logic }
        }

        this.commands = commandsFaker
        return true
    }

    private getCommandPaths(directoryPath: string): string[] {
        try {
            const cmdPaths = fs.readdirSync(directoryPath).map(e => directoryPath + path.sep + e)
            return cmdPaths
        } catch (error) {
            this.logger.log(`Could not find user-defined commands folder! Looking at ${directoryPath}`, LoggerLevel.ERR)
            return null
        }
    }

    private getObject(cmdPath: string): Object {
        let rawObject = ''

        try {
            rawObject = fs.readFileSync(cmdPath).toString()
        } catch (err) {
            this.logger.log(`Command defined at ${cmdPath} could not be read!`, LoggerLevel.ERR)
            return null
        }

        if (!rawObject.indexOf('{')) {
            this.logger.log(`Command defined at ${cmdPath} has wrong format, missing opening '{' !`, LoggerLevel.ERR)
            return null
        }

        rawObject = rawObject.substring(rawObject.indexOf('{'))

        if (!rawObject.lastIndexOf('}')) {
            this.logger.log(`Command defined at ${cmdPath} has wrong format, missing closing '}' !`, LoggerLevel.ERR)
            return null
        }

        rawObject = rawObject.substring(0, rawObject.lastIndexOf('}') + 1)

        let object = {}

        try {
            object = eval(`new Object( ${rawObject})`)
        } catch (err) {
            this.logger.log(`Command defined at ${cmdPath} object could not be parsed!`, LoggerLevel.ERR)
            return null
        }
        return object
    }

    private verifyIntegrity(object: Object, cmdPath: string): boolean {

        //@ts-ignore
        if (!object.schema) {
            this.logger.log(`Command defined at ${cmdPath} has no schema set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        if (!object.schema.name) {
            this.logger.log(`Command defined at ${cmdPath} has no name set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        if (!object.schema.mandatory) {
            this.logger.log(`Command defined at ${cmdPath} has no 'mandatory' field set!`, LoggerLevel.ERR)
            return false
        }

        //@ts-ignore
        for (const mandatoryOpt of object.schema.mandatory) {
            //@ts-ignore
            if (!object.schema[mandatoryOpt]) {
                this.logger.log(`Missing mandatory option '${mandatoryOpt}' from schema`, LoggerLevel.ERR)
                return false
            }
        }

        //@ts-ignore
        for (const [opt, argType] of Object.entries(object.schema)) {
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