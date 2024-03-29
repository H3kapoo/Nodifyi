import { Logger, LoggerLevel } from "../../../Logger/Logger"
import IReloadable from "../../Configuration/IReloadable"
import GraphModel from "../../GraphModel/GraphModel"
import Renderer from "../../Renderer/Renderer"
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper"
import { CommandsStruct, ParsedInput } from "../../types"
import IParserListener from "../Parser/IParserListener"
const { dialog, getCurrentWindow } = require('@electron/remote')
import APIHolder from "./APIHolder"
import UndoRedo from "./UndoRedo"


export default class Executor implements IParserListener, IReloadable {
    private logger = new Logger('Executor')

    private terminalHelper: TerminalTabOutputHelper
    private commands: CommandsStruct
    private API: APIHolder
    private renderer: Renderer
    private undoRedo: UndoRedo

    public initialize(graphModel: GraphModel, renderer: Renderer, commands: CommandsStruct) {
        this.API = new APIHolder(graphModel, renderer, commands)
        this.terminalHelper = new TerminalTabOutputHelper()
        this.renderer = renderer
        this.commands = commands
        this.undoRedo = new UndoRedo(graphModel, renderer, this.API)
        this.terminalHelper.setOutputContext(this.logger.getContext())
        this.logger.log('Module initialized!')
        return true
    }

    private async executeCommandChain(parsedInputs: ParsedInput[]) {
        if (!this.commands) {
            this.logger.log('Commands were not subscribed!', LoggerLevel.ERR)
            return false
        }

        /* Reset interrupt */
        this.API.setAPIBlocked(false)

        for (const parsedInput of parsedInputs) {
            try {
                this.undoRedo.memorizeBeforeExec()
                if (!this.renderer.isBusyDrawing()) {
                    this.setProjectDirty()
                    await this.commands[parsedInput.commandName]
                        .logic(parsedInput.options, this.API.getProxyAPI())
                }
                else {
                    this.logger.log('Canvas is busy drawing right now!', LoggerLevel.WRN)
                    this.terminalHelper.printErr(`Can't execute command right now! Canvas is busy drawing!`)
                }
                this.undoRedo.memorize()
            }
            catch (err) {
                this.showDialogMsg(
                    `Logic error occured while running command '${parsedInput.commandName}':\n ${err.toString()}\nPlease check your logic behaviour!`)
                this.logger.log(err)
            }
        }
        return true
    }

    public updateCommands(commands: CommandsStruct) { this.commands = commands }

    public onInputParsed(parsedInputs: ParsedInput[]) { this.executeCommandChain(parsedInputs) }

    private setProjectDirty() {
        const windowTitle = getCurrentWindow().getTitle()
        if (windowTitle[windowTitle.length - 1] === '*')
            return
        getCurrentWindow().setTitle(windowTitle + '*')
    }

    private showDialogMsg(msg: string) {
        dialog.showMessageBoxSync(getCurrentWindow(), {
            title: 'Custom Commands Notification',
            message: msg,
            buttons: ["OK"],
        })
    }

    public onConfReload() { }

    public onHardReload() {
        this.undoRedo.onHardReload()
        this.logger.log('Succesfully hard reloaded', LoggerLevel.DBG)
    }
}
