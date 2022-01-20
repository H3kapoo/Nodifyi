import { Logger, LoggerLevel } from "../../../Logger/Logger"
import CommandLoaderBI from "./CommandLodaderBI"
import CommandLoaderUD from "./CommandLoaderUD"


export default class CommandStore {
    private logger = new Logger('CommandStore')

    private loaderBI: CommandLoaderBI
    private loaderUD: CommandLoaderUD

    constructor() {
        if (this.initialize())
            this.logger.log('Initialized')
        else
            this.logger.log('NOT Initialized', LoggerLevel.ERR)
    }

    private initialize() {
        this.loaderBI = new CommandLoaderBI()
        this.loaderUD = new CommandLoaderUD()

        return true
    }
}