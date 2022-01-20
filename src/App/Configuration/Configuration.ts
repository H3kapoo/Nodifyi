import { Logger, LoggerLevel } from "../../Logger/Logger"
import { StringKeyObject } from "../types"
import IReloadable from "./IReloadable"
import fs from 'fs'


/** Handles loading of configuration file*/
export default class Configuration {
    private logger = new Logger('Configuration')

    private static instance: Configuration
    private reloadablesList: IReloadable[]
    private conf: StringKeyObject
    private confPath: string

    constructor() {
        this.reloadablesList = []
        this.conf = {}
        this.confPath = ''
        this.logger.log('Initialized')
    }

    public static get(): Configuration {
        if (!Configuration.instance)
            Configuration.instance = new Configuration()
        return Configuration.instance
    }

    public loadConf(confPath: string): boolean {
        try {
            const rawResult = fs.readFileSync(confPath).toString()
            this.conf = JSON.parse(rawResult)
            this.confPath = confPath
            return true
        }
        catch (error) {
            this.logger.log(`Fatal error! Could not load conf from ${confPath}`, LoggerLevel.ERR)
            return false
        }
    }

    public updateCurrentConf(subConfObject: StringKeyObject): boolean {
        try {
            for (const [key, value] of Object.entries(subConfObject))
                this.conf[key] = value

            const newConf = JSON.stringify(this.conf)
            fs.writeFileSync(this.confPath, newConf, 'utf-8')
            this.notifyReload()
            return true
        }
        catch (error) {
            this.logger.log(`Fatal error! Could not update conf!`, LoggerLevel.ERR)
            return false
        }
    }

    public param(paramName: string): string | number {
        if (this.conf[paramName])
            return this.conf[paramName]

        this.logger.log(`Param '${paramName}' could not be found! `, LoggerLevel.ERR)
        return null
    }

    public subscribeReloadable(reloadable: IReloadable) {
        if (this.reloadablesList.indexOf(reloadable) !== -1) {
            this.logger.log('Trying to subscribe IReloadable that is already subscribbed!', LoggerLevel.ERR)
            return false
        }

        this.reloadablesList.push(reloadable)
        return true
    }

    public unsubscribeReloadable(reloadable: IReloadable) {
        const index = this.reloadablesList.indexOf(reloadable)
        if (index === -1) {
            this.logger.log('Trying to unsubscribe IReloadable that is not subscribbed!', LoggerLevel.ERR)
            return false
        }

        this.reloadablesList.splice(index, 1)
        return true
    }

    private notifyReload() {
        this.reloadablesList.forEach(r => r.onConfReload())
    }
}
