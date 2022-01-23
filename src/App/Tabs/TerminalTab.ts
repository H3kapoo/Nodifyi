import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IAppStartup from "../IAppStartup";
import { StringKeyObject } from "../types";
import ITerminalTabListener from "./ITerminalTabListener";
import * as utils from './TerminalUtils'


/** Class handling interaction with the Terminal tab in subview-2*/
export default class TerminalTab {
    private logger = new Logger('TerminalTab')

    private terminalDOM: HTMLElement
    private terminalPrefix: string
    private userInput: string
    private inputHistory: string[]
    private inputHistoryOffset: number

    private listeners: { [key: string]: ITerminalTabListener[] }

    public initialize() {
        this.inputHistory = []
        this.inputHistoryOffset = 0
        this.userInput = null
        this.listeners = {}
        this.terminalDOM = document.getElementById('terminal-container-tab-input-area')

        if (!this.terminalDOM) {
            this.logger.log('Fatal! Failed fetching terminalDOM!', LoggerLevel.ERR)
            return false
        }

        this.terminalPrefix = Configuration.get().param('beginTerminalText') as string // this.config.strings('beginTerminalText')
        this.terminalDOM.innerText = this.terminalPrefix
        this.initializeListeners()
        this.terminalDOM.addEventListener('keyup', e => this.notifier(e))

        return true
    }

    private notifier(evt: KeyboardEvent) {
        if (this.listeners[evt.key])
            this.listeners[evt.key].forEach(l => l.onListenedKey(this.userInput))

        if (evt.key === 'Enter')
            this.printInput()
    }

    public subscribeOnKeyPress(key: string, listener: ITerminalTabListener) {
        if (!this.listeners[key])
            this.listeners[key] = []
        this.listeners[key].push(listener)
    }

    private printInput() {
        const shallPrintOnlyPrefix = this.userInput.length ? false : true

        if (shallPrintOnlyPrefix)
            this.logger.log('User input is null in printInput', LoggerLevel.WRN)

        const outputDiv = document.createElement("div")
        const beginTextDOM = `<span id='cmd-cli-info-prep'>${this.terminalPrefix}</span>`

        outputDiv.id = 'cmd-info-text'
        outputDiv.innerHTML = beginTextDOM + (shallPrintOnlyPrefix ? '' : utils.sanitizeInput(this.userInput))

        if (!document.getElementById('command-line-base').appendChild(outputDiv)) {
            this.logger.log('Could not appendChild for printInput!', LoggerLevel.ERR)
            return false
        }

        utils.setCaret(this.terminalDOM, this.terminalPrefix)
        return true
    }

    /** Scroll textarea after command execution because it doesn't do it automatically*/
    public scrollDownTerminal(): void {
        const div = document.getElementById('command-line-base')
        div.scrollTop = div.scrollHeight
    }

    private initializeListeners() {
        this.terminalDOM.addEventListener('paste', evt => this.terminalPasteListener(evt))
        this.terminalDOM.addEventListener('keydown', evt => this.terminalKeyDownListener(evt))
        this.terminalDOM.addEventListener('keyup', evt => this.terminalKeyUpListener(evt))
    }

    private terminalKeyDownListener(event: KeyboardEvent) {

        utils.keepCaretAwayFromBeginText(event, this.terminalDOM, this.terminalPrefix)

        /* On enter key down we clear the previous user input and we prevent new line from happening*/
        if (event.preventDefault && event.key === 'Enter') {
            this.userInput = null
            utils.setEndOfContenteditable(this.terminalDOM)
            event.preventDefault();
        }
    }

    private terminalKeyUpListener(event: KeyboardEvent) {

        utils.keepCaretAwayFromBeginText(event, this.terminalDOM, this.terminalPrefix)

        if (event.key === 'Enter') {
            /* We need to replace beginText because innerText grabs beginText that is not part of
               the actual user input*/
            this.userInput = this.terminalDOM.innerText.replace(this.terminalPrefix, '')
            this.terminalDOM.innerText = this.terminalPrefix

            /* On enter save the command in the history. The history offset is used when pressing
               up or down arrows so we can scroll between history commands.
               Recent commands are stored at the end of the array, older at the start*/
            this.inputHistory.push(this.userInput)
            this.inputHistoryOffset = this.inputHistory.length
        }

        /* Handle history up key*/
        if (event.key === 'ArrowUp') {
            if (this.inputHistoryOffset <= 0) return
            this.terminalDOM.innerText = this.terminalPrefix + this.inputHistory[this.inputHistoryOffset - 1]
            this.inputHistoryOffset -= 1

            /* We need to move the cursor to the end of the terminal line */
            utils.setEndOfContenteditable(this.terminalDOM)
        }

        /* Handle history up key*/
        if (event.key === 'ArrowDown') {
            if (this.inputHistoryOffset >= this.inputHistory.length) return
            this.inputHistoryOffset += 1
            this.terminalDOM.innerText = this.terminalPrefix + this.inputHistory[this.inputHistoryOffset - 1]

            /* We need to move the cursor to the end of the terminal line */
            utils.setEndOfContenteditable(this.terminalDOM)
        }

    }

    private terminalPasteListener(event: ClipboardEvent): void {
        /* When something is pasted into the terminal, make sure to prepend beginText to it.
           We could ctrl+A ctrl+V into the terminal, this takes with it the beginText. When we
           ctrl+V we dont want to see the beginText pasted aswell
        */
        event.preventDefault()
        let text = '' + event.clipboardData.getData("text/plain").replace(this.terminalPrefix, '')
        document.execCommand("insertText", false, text)
    }
}