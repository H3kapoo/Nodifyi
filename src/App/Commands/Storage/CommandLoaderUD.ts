import { Logger, LoggerLevel } from "../../../Logger/Logger"
import { ValidTypes } from "../Validation/ValidTypes"
import { CommandsStruct } from "../../types"
import path from 'path'
import fs from 'fs'


/** Handles the loading of user defined commands (user accessible) */
export default class CommandLoaderUD {
    private logger = new Logger('CommandLoaderUD')

    private commands: CommandsStruct

    constructor() {
        if (this.initialize())
            this.logger.log('Probably Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        const commandsFaker = {}

        const directoryPath = path.join(__dirname, '../App/Commands/UserDefinedDummy');
        let cmdPaths: string[]

        try {
            cmdPaths = fs.readdirSync(directoryPath).map(e => directoryPath + path.sep + e)
        } catch (error) {
            this.logger.log(`Could not find user-defined commands folder! Looking at ${directoryPath}`, LoggerLevel.ERR)
            return false
        }

        try {
            for (const cmdPath of cmdPaths) {
                const rawResult = fs.readFileSync(cmdPath).toString()
                const prefixEnd = rawResult.indexOf('{')
                const rawJSON = rawResult.split('{').splice(1).join('')
                console.log(rawJSON)

                // this.conf = JSON.parse(rawResult)
            }
        } catch (error) {
            return false
        }
        // read each .js into an {}
        // JSON.stringify({}) then save it into a file similat to builtin.js

        // for (const [currentIndex, cmdPath] of cmdPaths.entries()) {
        //     this.loadScript(cmdPath, () => {

        //         //@ts-ignore
        //         if (!root.schema) {
        //             this.commands = {}
        //             this.logger.log(`Command defined at ${cmdPath} has no schema set!`, LoggerLevel.ERR)
        //             return
        //         }

        //         //@ts-ignore
        //         if (!root.schema.name) {
        //             this.commands = {}
        //             this.logger.log(`Command defined at ${cmdPath} has no name set!`, LoggerLevel.ERR)
        //             return
        //         }

        //         //@ts-ignore
        //         if (!root.schema.mandatory) {
        //             this.commands = {}
        //             this.logger.log(`Command defined at ${cmdPath} has no 'mandatory' field set!`, LoggerLevel.ERR)
        //             return
        //         }

        //         //@ts-ignore
        //         for (const mandatoryOpt of root.schema.mandatory) {
        //             //@ts-ignore
        //             if (!root.schema[mandatoryOpt]) {
        //                 this.commands = {}
        //                 this.logger.log(`Missing mandatory option '${mandatoryOpt}' from schema`, LoggerLevel.ERR)
        //                 return
        //             }
        //         }

        //         //@ts-ignore
        //         for (const [opt, argType] of Object.entries(root.schema)) {
        //             if (opt === 'name' || opt === 'mandatory') continue

        //             //@ts-ignore
        //             if (!Object.values(ValidTypes).includes(argType)) {
        //                 this.commands = {}
        //                 this.logger.log(`Argument type for option '${opt}' is not valid (current: ${argType})!`, LoggerLevel.ERR)
        //                 return
        //             }
        //         }

        //         //@ts-ignore
        //         if (this.commands[root.schema.name]) {
        //             //@ts-ignore
        //             this.logger.log(`User defined command '${root.schema.name}' already exists!`, LoggerLevel.ERR)
        //             this.commands = {}
        //             return
        //         }

        //         //@ts-ignore
        //         this.commands[root.schema.name] = { schema: root.schema, logic: root.logic }

        //         this.unloadScript()

        //         if (currentIndex + 1 === cmdPaths.length) {
        //             this.logger.log(`User defined commands retard loading finished!`)
        //         }
        //     })
        // }
        return true
    }


    private loadScript(filePath: string, callback: any) {
        let head = document.getElementsByTagName('head')[0]
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = filePath
        script.id = 'cmd-script'
        script.onload = callback
        head.appendChild(script)
    }

    private unloadScript(): void {
        const elem = document.getElementById('cmd-script')
        if (elem)
            elem.remove()
        else
            this.logger.log('Unloading of invisible script tag', LoggerLevel.WRN)
    }

    public getCommands(): CommandsStruct { return this.commands ?? null }
}