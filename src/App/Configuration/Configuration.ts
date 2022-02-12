import { Logger, LoggerLevel } from "../../Logger/Logger"
import { StringKeyObject } from "../types"
import IReloadable from "./IReloadable"
import fs from 'fs'
import { join } from "path"

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
    }

    public static get(): Configuration {
        if (!Configuration.instance)
            Configuration.instance = new Configuration()
        return Configuration.instance
    }

    public loadConfOrDefault(confPath: string): boolean {
        try {
            fs.readFileSync(confPath)
        } catch {
            this.logger.log(`Warning! Could not load conf from ${confPath}. Creating default values at location!`, LoggerLevel.WRN)
            const defaultConf = JSON.parse(fs.readFileSync(join(__dirname, '../App/Configuration/defaultValues.json')).toString())
            fs.writeFileSync(confPath, JSON.stringify(defaultConf), 'utf-8')
        }

        try {
            const rawResult = fs.readFileSync(confPath).toString()
            this.conf = JSON.parse(rawResult)
            this.confPath = confPath
            this.logger.log('Initialized')
        }
        catch (error) {
            this.logger.log(`Error! Could not parse conf from ${confPath}!`, LoggerLevel.FATAL)
            return false
        }
        return true
    }

    public loadConf(confPath: string): boolean {
        try {
            const rawResult = fs.readFileSync(confPath).toString()
            this.conf = JSON.parse(rawResult)
            this.confPath = confPath
            this.logger.log('Initialized')
            return true
        }
        catch (error) {
            this.logger.log(`Fatal error! Could not load conf from ${confPath}`, LoggerLevel.FATAL)
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

    public param(paramName: string): string | number | boolean {
        if (this.conf[paramName] || (this.conf[paramName] === false)) // cover bool
            return this.conf[paramName]

        this.logger.log(`Param '${paramName}' could not be found! `, LoggerLevel.ERR)
        return null
    }

    public reloadOnly(reloadable: IReloadable) {
        const index = this.reloadablesList.indexOf(reloadable)
        if (index === -1) {
            this.logger.log('Trying to reload only IReloadable but it is not subscribbed!', LoggerLevel.ERR)
            return false
        }
        this.reloadablesList[index].onConfReload()
        return true
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
