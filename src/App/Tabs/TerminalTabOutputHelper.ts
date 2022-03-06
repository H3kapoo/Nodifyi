import { sanitizeInput } from "./TerminalUtils"


/** Use this class if you want your component to std output to TerminalTab*/
export default class TerminalTabOutputHelper {

    private context: string
    private static isBlockStd: boolean = false
    private static isBlockErr: boolean = false

    public setOutputContext(context: string) { this.context = `[${context}]` }

    public setBlockStdOutput() { TerminalTabOutputHelper.isBlockStd = true }

    public setBlockErrOutput() { TerminalTabOutputHelper.isBlockErr = true }

    public printStd(msg: string) {
        if (TerminalTabOutputHelper.isBlockStd) {
            TerminalTabOutputHelper.isBlockStd = false
            return
        }

        const outputDiv = document.createElement("div")
        const contextDOM = `<span id='cmd-info-text-prep'>${this.context}</span>`
        const sanitized = sanitizeInput(msg)
        const content = sanitized.replace(/[0-9]+/g, (m) => { return `<span id='cmd-text-number'>${m}</span>` })

        outputDiv.id = 'cmd-info-text'
        outputDiv.innerHTML = contextDOM + content

        document.getElementById('command-line-base').appendChild(outputDiv)
    }

    public printErr(msg: string) {
        if (TerminalTabOutputHelper.isBlockErr) {
            TerminalTabOutputHelper.isBlockErr = false
            return
        }

        const outputDiv = document.createElement("div")
        const contextDOM = `<span id='cmd-err-text-prep'>${this.context}</span>`
        const sanitized = sanitizeInput(msg)
        const content = sanitized.replace(/[0-9]+/g, (m) => { return `<span id='cmd-text-number'>${m}</span>` })

        outputDiv.id = 'cmd-info-text'
        outputDiv.innerHTML = contextDOM + content

        document.getElementById('command-line-base').appendChild(outputDiv)
    }

    public clearTerminal(): void {
        const div = document.getElementById('command-line-base')
        while (div.firstChild) { div.removeChild(div.firstChild) }
    }
}