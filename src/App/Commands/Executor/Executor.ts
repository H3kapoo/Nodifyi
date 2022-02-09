import { Logger, LoggerLevel } from "../../../Logger/Logger"
import GraphModel from "../../GraphModel/GraphModel"
import Renderer from "../../Renderer/Renderer"
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper"
import { APIObject, CommandsStruct, ParsedInput } from "../../types"
import IParserListener from "../Parser/IParserListener"
const { getCurrentWindow } = require('@electron/remote')
import APIHolder from "./APICommands"


export default class Executor implements IParserListener {
    private logger = new Logger('Executor')

    private terminalHelper: TerminalTabOutputHelper
    private commands: CommandsStruct
    private API: APIObject
    private renderer: Renderer

    public initialize(graphModel: GraphModel, renderer: Renderer, commands: CommandsStruct) {
        this.API = new APIHolder(graphModel, renderer).getAPI()
        this.terminalHelper = new TerminalTabOutputHelper()
        this.renderer = renderer
        this.commands = commands
        this.terminalHelper.setOutputContext(this.logger.getContext())
        this.logger.log('Module initialized!')
        return true
    }

    private async executeCommandChain(parsedInputs: ParsedInput[]) {
        if (!this.commands) {
            this.logger.log('Commands were not subscribed!', LoggerLevel.ERR)
            return false
        }

        for (const parsedInput of parsedInputs) {
            try {
                if (!this.renderer.isBusyDrawing()) {
                    this.setProjectDirty()
                    await this.commands[parsedInput.commandName].logic(parsedInput.options, this.API)
                }
                else {
                    this.logger.log('Canvas is busy drawing right now!', LoggerLevel.WRN)
                    this.terminalHelper.printErr(`Can't execute command right now! Canvas is busy drawing!`)
                }
            }
            //TODO: Catch syntax errors here from the user side and process them
            catch (err) {
                console.log(err);
            }
        }
        return true
    }

    public onInputParsed(parsedInputs: ParsedInput[]) { this.executeCommandChain(parsedInputs) }

    private setProjectDirty() {
        const windowTitle = getCurrentWindow().getTitle()
        getCurrentWindow().setTitle(windowTitle + '*')
    }
}
