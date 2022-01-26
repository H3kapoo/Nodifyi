import { Logger, LoggerLevel } from "../../../Logger/Logger"
import GraphModel from "../../GraphModel/GraphModel"
import Renderer from "../../Renderer/Renderer"
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper"
import { APIObject, CommandsStruct, ParsedInput } from "../../types"
import IParserListener from "../Parser/IParserListener"
import APIHolder from "./APICommands"


//TODO: TerminalOutputHelper as a helper class, not as extending it
export default class Executor extends TerminalTabOutputHelper implements IParserListener {
    private logger = new Logger('Executor')

    private commands: CommandsStruct
    private API: APIObject

    constructor() { super() }

    public initialize(graphModel: GraphModel, renderer: Renderer) {
        this.API = new APIHolder(graphModel, renderer).getAPI()
        this.setOutputContext(this.logger.getContext())
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
                await this.commands[parsedInput.commandName].logic(parsedInput.options, this.API)
            }
            //TODO: Catch syntax errors here from the user side and process them
            catch (err) {
                console.log(err);
            }
        }

        return true
    }

    public onInputParsed(parsedInputs: ParsedInput[]) { this.executeCommandChain(parsedInputs) }

    public subscribeCommands(commands: CommandsStruct) { this.commands = commands }
}
