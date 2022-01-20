import { Logger, LoggerLevel } from "../../../Logger/Logger"


/** Handles the loading of built in commands (not user accessible) */
export default class CommandLoaderBI {
    private logger = new Logger('CommandLoaderBI')

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        return true
    }
}