import { Logger, LoggerLevel } from "../../../Logger/Logger"
import ITerminalTabListener from "../../Tabs/ITerminalTabListener"
import IParserListener from "./IParserListener"


export default class Parser implements ITerminalTabListener {
    private logger = new Logger('Parser')

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        return true
    }

    public subscribeOnParsed(listener: IParserListener) {

    }

    public onListenedKey(userInput: string): void {
        this.logger.log(`Reacted to ${userInput}`)
        // throw new Error("Method not implemented.")
    }
}