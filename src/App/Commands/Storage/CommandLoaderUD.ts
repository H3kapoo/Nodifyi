import { Logger, LoggerLevel } from "../../../Logger/Logger"
import { ValidTypes } from "../Validation/ValidTypes"
import { CommandsStruct } from "../../types"
import path from 'path'
import fs from 'fs'


/** Handles the loading of user defined commands (user accessible) */
export default class CommandLoaderUD {
    private logger = new Logger('CommandLoaderUD')

    private commands: CommandsStruct

    constructor(directoryPath: string) {
        if (this.initialize(directoryPath))
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize(directoryPath: string) {
        const commandsFaker = {}

        let cmdPaths: string[]

        try {
            cmdPaths = fs.readdirSync(directoryPath).map(e => directoryPath + path.sep + e)
        } catch (error) {
            this.logger.log(`Could not find user-defined commands folder! Looking at ${directoryPath}`, LoggerLevel.ERR)
            return false
        }

        for (const cmdPath of cmdPaths) {
            let rawObject = ''

            try {
                rawObject = rawObject = fs.readFileSync(cmdPath).toString()
            } catch (err) {
                this.logger.log(`Command defined at ${cmdPath} could not be read!`, LoggerLevel.ERR)
                return false
            }

            if (!rawObject.indexOf('{')) {
                this.logger.log(`Command defined at ${cmdPath} has wrong format, missing opening '{' !`, LoggerLevel.ERR)
                return false
            }

            rawObject = rawObject.substring(rawObject.indexOf('{'))

            if (!rawObject.lastIndexOf('}')) {
                this.logger.log(`Command defined at ${cmdPath} has wrong format, missing closing '}' !`, LoggerLevel.ERR)
                return false
            }

            rawObject = rawObject.substring(0, rawObject.lastIndexOf('}') + 1)

            let object = {}

            try {
                object = eval(`new Object( ${rawObject})`)
            } catch (err) {
                this.logger.log(`Command defined at ${cmdPath} object could not be parsed!`, LoggerLevel.ERR)
                return false
            }

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

            //@ts-ignore
            if (commandsFaker[object.schema.name]) {
                //@ts-ignore
                this.logger.log(`User defined command '${object.schema.name}' already exists!`, LoggerLevel.ERR)
                return false
            }

            //@ts-ignore
            commandsFaker[object.schema.name] = { schema: object.schema, logic: object.logic }
        }

        this.commands = commandsFaker
        return true
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }
}