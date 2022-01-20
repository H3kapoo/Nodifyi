import { Logger, LoggerLevel } from "../../../Logger/Logger"
import IParserListener from "../Parser/IParserListener"


export default class Executor implements IParserListener {
    private logger = new Logger('Executor')

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        return true
    }

    subscribeOnParsed(): void {
        this.logger.log('Called')
    }
}