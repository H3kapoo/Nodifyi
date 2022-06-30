const { ipcRenderer } = require('electron')


export enum LoggerLevel {
    DBG = 'DBG',
    INFO = 'INFO',
    WRN = 'WRN',
    ERR = 'ERR',
    FATAL = 'FATAL'
}
enum LoggerColor {
    DBG = '#999',
    INFO = '#00ff00',
    WRN = '#00aadd',
    ERR = '#ff2200'
}

export class Logger {

    private context: string
    private defaultLevel: LoggerLevel
    static loggingActive: boolean = true
    private static alreadyDid = false;
    constructor(context: string, defaultLevel: LoggerLevel = LoggerLevel.INFO) {
        this.context = context
        this.defaultLevel = defaultLevel
    }

    public log(msg: any, level?: LoggerLevel) {
        if (!Logger.loggingActive) return

        if (level)
            console.log(`%c[${level}][${this.context}] ${msg}`, this.getLoggerLevelColor(level))
        else
            console.log(`%c[${this.defaultLevel}][${this.context}] ${msg}`, this.getLoggerLevelColor(this.defaultLevel))

        /* Only open error dialog on FATAL */
        if (level && level === LoggerLevel.FATAL) {
            ipcRenderer.send("FATAL_ERROR", { msg: msg })
            Logger.alreadyDid = true
        }

    }

    public logc(customContext: string, msg: any, level?: LoggerLevel) {
        if (!Logger.loggingActive) return

        if (level)
            console.log(`%c[${level}][${customContext}] ${msg}`, this.getLoggerLevelColor(level))
        else
            console.log(`%c[${this.defaultLevel}][${customContext}] ${msg}`, this.getLoggerLevelColor(this.defaultLevel))
    }

    public raw(msg: any) {
        console.log(`[${this.context}] printed ->`)
        console.log(msg)
    }

    public getContext(): string {
        return this.context
    }

    private getLoggerLevelColor(lvl: LoggerLevel): string {
        let color = 'color: '
        switch (lvl) {
            case LoggerLevel.DBG:
                return color + LoggerColor.DBG
            case LoggerLevel.INFO:
                return color + LoggerColor.INFO
            case LoggerLevel.WRN:
                return color + LoggerColor.WRN
            case LoggerLevel.ERR:
                return color + LoggerColor.ERR
        }
    }
}
