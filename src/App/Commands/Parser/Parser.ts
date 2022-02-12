import { Logger, LoggerLevel } from "../../../Logger/Logger"
import ITerminalTabListener from "../../Tabs/ITerminalTabListener"
import { ArgTypeParseResult, CommandOptions, CommandsStruct, ParsedInput } from "../../types"
import IParserListener from "./IParserListener"
import { parsers } from './ValidTypesParser'
import { ValidTypes } from "../Validation/ValidTypes"
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper"


export default class Parser implements ITerminalTabListener {
    private logger = new Logger('Parser')

    private terminalHelper: TerminalTabOutputHelper
    private commands: CommandsStruct
    private parseListeners: IParserListener[]

    public initialize(commands: CommandsStruct) {
        this.commands = commands
        this.parseListeners = []
        this.terminalHelper = new TerminalTabOutputHelper()
        this.terminalHelper.setOutputContext(this.logger.getContext())
        this.logger.log('Module initialized!')
        return true
    }

    private parseInputChain(inputs: string): ParsedInput[] {
        let parsedInputs: ParsedInput[] = []
        const splitInputs = inputs.split('&&')

        for (const input of splitInputs) {
            const parseResult = this.parseInput(input)
            if (!parseResult) {
                this.logger.log(`Failed parsing: '${input}'! Won't continue`, LoggerLevel.WRN)
                return null
            }
            parsedInputs.push(this.parseInput(input))
        }
        return parsedInputs
    }

    private parseInput(input: string): ParsedInput {
        let parsedInput: ParsedInput = { commandName: '', options: {} }

        /* Filter for blank spaces and such */
        const commandTokens: string[] = input.replace(/\s+/g, ' ').split(' ').filter(el => el.length !== 0)

        /* Verify command exists in storage */
        if (!this.commands[commandTokens[0]]) {
            this.logger.log(`Command '${commandTokens[0]}' doesn't exist!`, LoggerLevel.WRN)
            this.terminalHelper.printErr(`Command '${commandTokens[0]}' doesn't exist!`)
            return null
        }

        /* Set command's name */
        parsedInput.commandName = commandTokens[0]

        /* Get all options from the input tokens*/
        parsedInput.options = this.extractOptions(commandTokens)

        if (!parsedInput.options) return null

        return parsedInput
    }

    private extractOptions(commandTokens: string[]): CommandOptions {
        const commandOptions: CommandOptions = {}

        const commandSchema = this.commands[commandTokens[0]].schema

        /*If the command needs an arg incFactor = 2, else 1
         Used to accomodate commands that might not need an argument in order to run*/
        let incFactor = 2

        for (let i = 1; i < commandTokens.length; i += incFactor) {
            const optionName = commandTokens[i]

            //@ts-ignore
            if (!commandSchema[optionName]) {
                this.logger.log(`Command '${commandTokens[0]}' doesnt have option '${optionName}'`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Command '${commandTokens[0]}' doesnt have option '${optionName}'`)
                return null
            }

            /* Means option doesnt need an argument */
            //@ts-ignore
            if (commandSchema[optionName] === ValidTypes.NotRequired) {
                incFactor = 1
                commandOptions[optionName] = null
                continue
            }

            /* Otherwise means command option needs arg */
            const optionArg = commandTokens[i + 1] ?? null

            if (!optionArg) {
                this.logger.log(`Option '${optionName}' doesnt have an argument provided!`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Option '${optionName}' doesnt have an argument provided!`)
                return null
            }

            /* It is assured at loading that option arg type is valid */
            //@ts-ignore
            const optionArgType = commandSchema[optionName]

            let parseResult: ArgTypeParseResult

            try {
                //@ts-ignore
                parseResult = parsers[optionArgType](optionArg)
            } catch (error) {
                //@ts-ignore
                this.logger.log(error.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(error.message)

                return null
            }

            commandOptions[optionName] = parseResult
            incFactor = 2
        }

        /* Check if all mandatory options are filled */
        const mandatoryResult = commandSchema.mandatory.every((opt) => {
            if (commandOptions[opt] !== undefined)
                return true
            this.logger.log(`Mandatory option '${opt}' is required but not provided!`, LoggerLevel.WRN)
            this.terminalHelper.printErr(`Mandatory option '${opt}' is required but not provided in '${commandTokens[0]}'!`)
            return false
        })

        if (!mandatoryResult) {
            this.logger.log(`Some mandatory options are not filled for command '${commandTokens[0]}'`, LoggerLevel.WRN)
            return null
        }

        return commandOptions
    }

    public updateCommands(commands: CommandsStruct) { this.commands = commands }

    public subscribeOnParsed(listener: IParserListener) { this.parseListeners.push(listener) }

    public onListenedKey(userInput: string): void {
        if (!userInput.length) {
            this.logger.log('User input is empty, parser skipping', LoggerLevel.DBG)
            return
        }

        const parseResult = this.parseInputChain(userInput)

        /* Notify listeners */
        if (parseResult)
            this.parseListeners.forEach(l => l.onInputParsed(parseResult))
    }
}