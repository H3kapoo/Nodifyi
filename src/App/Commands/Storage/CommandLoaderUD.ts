import { Logger, LoggerLevel } from "../../../Logger/Logger"


/** Handles the loading of user defined commands (user accessible) */
export default class CommandLoaderUD {
    private logger = new Logger('CommandLoaderUD')

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