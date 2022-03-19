import { Logger, LoggerLevel } from "../../../Logger/Logger"
import { ValidArgTypes } from "../Validation/ValidArgTypes"
import { CommandsStruct } from "../../types"
const { dialog, getCurrentWindow } = require('@electron/remote')
import path from 'path'
import fs from 'fs'


/** Handles the loading of user defined commands (user accessible) */
export default class CommandLoaderUD {
    private logger = new Logger('CommandLoaderUD')

    private commands: CommandsStruct

    public initialize(directoryPath: string) {
        const commandsFaker = {}

        const cmdPaths: string[] = this.getCommandPaths(directoryPath)

        // if it fails here fetching stuff from the folder, it shall continue normally
        // but there ill be no user defined commands available, user shall be notified
        if (!cmdPaths) {
            this.logger.log(`User defined commands could not be loaded from directory.Continuing without them!`, LoggerLevel.WRN)
            this.showDialogMsg(`User defined commands could not be loaded from directory.Continuing without them!`)
            return true
        }

        for (const cmdPath of cmdPaths) {
            const object = this.getObject(cmdPath)

            // currently it will not load any cmds if at least one is failed
            if (!object)
                return false

            if (!this.verifyIntegrity(object, cmdPath))
                return false

            //@ts-ignore
            if (commandsFaker[object.schema.name]) {
                //@ts-ignore
                this.logger.log(`User defined command '${object.schema.name}' already exists!`, LoggerLevel.ERR)
                //@ts-ignore
                this.showDialogMsg(`Definition of command name '${object.schema.name}' already exists! Please delete the dupe!`)
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

            // added now
            for (const cmdPath of cmdPaths) {
                const i = cmdPath.length
                if (i >= 3)
                    if (cmdPath[i - 3] !== '.' && cmdPath[i - 2] !== 'j' && cmdPath[i - 1] !== 's') {
                        this.logger.log(`Commands folder should only contain valid JS files!Not a valid JS file ${cmdPath}`, LoggerLevel.ERR)
                        this.showDialogMsg(`Commands folder should only contain valid JS files! \
                         ${cmdPath} is not a valid JS file!`)
                        return null
                    }
            }
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
            this.showDialogMsg(`Command defined at ${cmdPath} could not be read!`)
            return null
        }

        if (!rawObject.indexOf('{')) {
            this.logger.log(`Command defined at ${cmdPath} has wrong format, missing opening '{' !`, LoggerLevel.ERR)
            this.showDialogMsg(`Command defined at ${cmdPath} has wrong format, missing opening '{' !`)
            return null
        }

        rawObject = rawObject.substring(rawObject.indexOf('{'))

        if (!rawObject.lastIndexOf('}')) {
            this.logger.log(`Command defined at ${cmdPath} has wrong format, missing closing '}' !`, LoggerLevel.ERR)
            this.showDialogMsg(`Command defined at ${cmdPath} has wrong format, missing closing '}' !`)
            return null
        }

        rawObject = rawObject.substring(0, rawObject.lastIndexOf('}') + 1)

        let object = {}

        try {
            object = eval(`new Object( ${rawObject})`)
        } catch (err) {
            this.logger.log(`Command defined at ${cmdPath} object could not be parsed!`, LoggerLevel.ERR)
            this.showDialogMsg(`Command defined at ${cmdPath} object could not be parsed! Check for misspelling or typos!`)
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
            if (!Object.values(ValidArgTypes).includes(argType)) {
                this.logger.log(`Argument type for option '${opt}' is not valid (current: ${argType})!`, LoggerLevel.ERR)
                return false
            }
        }
        return true
    }

    public getCommands(): CommandsStruct { return this.commands ?? {} }

    private showDialogMsg(msg: string) {
        dialog.showMessageBoxSync(getCurrentWindow(), {
            title: 'Custom Commands Notification',
            message: msg,
            buttons: ["OK"],
        })
    }
}