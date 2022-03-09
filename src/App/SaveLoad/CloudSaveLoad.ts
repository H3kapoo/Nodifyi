import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";
import GraphModel from "../GraphModel/GraphModel";
import Renderer from "../Renderer/Renderer";
import { Collection, MongoClient } from 'mongodb'
const { dialog, getCurrentWindow } = require('@electron/remote')
const { ipcRenderer } = require('electron')


export default class CloudSaveLoad implements IReloadable {
    private logger = new Logger('CloudSaveLoad')
    private graphModel: GraphModel
    private renderer: Renderer
    private connectionURI: string
    private allSaveNames: string[] = []
    private dbName = 'Nodify'
    private collectionName = 'NodifySaved'

    constructor(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer
        this.initialize()
        ipcRenderer.on('FINALIZE_SAVE', (evt: any, data: any) => this.finalizeSave(data))
        ipcRenderer.on('FINALIZE_LOAD', (evt: any, data: any) => this.finalizeLoad(data))
    }

    private initialize() {
        this.connectionURI = Configuration.get().param('dbConnectionURI') as string

        if (!this.connectionURI) {
            this.logger.log('ConnectionURI string not found in configuration! Unable to connect!', LoggerLevel.ERR)
            return
        }

        // try to connect now if there are credentials available
        Configuration.get().subscribeReloadable(this)
        this.logger.log('Initialized!')
    }

    public async save() {
        const collection = await this.tryToConnect()
        if (!collection) {
            this.logger.log('Failed to connect to mongo, bail out!', LoggerLevel.WRN)
            return
        }

        this.allSaveNames = []
        const allSaves = await collection.find({})
        const allData = await allSaves.toArray()
        allData.forEach(e => this.allSaveNames.push(e.name))

        ipcRenderer.send('DISPATCH_OPEN_CLOUD_SAVE', { 'names': this.allSaveNames })
    }

    private async finalizeSave(data: any) {
        const collection = await this.tryToConnect()

        if (this.allSaveNames.includes(data.name)) {
            await collection.updateOne({ "name": { "$regex": data.name } }, {
                $set: { data: this.graphModel.getJson() }
            })
            this.logger.log(`Save '${data.name}' has been updated!`)
            this.showMsgDialog(`Save '${data.name}' has been updated!`)
        }
        else {
            await collection.insertOne({
                name: data.name,
                data: this.graphModel.getJson()
            })
            this.logger.log(`Save '${data.name}' has been created!`)
            this.showMsgDialog(`Save '${data.name}' has been created!`)
        }
    }

    public async load() {
        const collection = await this.tryToConnect()
        if (!collection) {
            this.logger.log('Failed to connect to mongo, bail out!', LoggerLevel.WRN)
            return
        }
        this.allSaveNames = []
        const allSaves = await collection.find({})
        const allData = await allSaves.toArray()
        allData.forEach(e => this.allSaveNames.push(e.name))

        ipcRenderer.send('DISPATCH_OPEN_CLOUD_LOAD', { 'names': this.allSaveNames })
    }

    private async finalizeLoad(data: any) {
        const collection = await this.tryToConnect()
        if (!collection) {
            this.logger.log('Failed to connect to mongo, bail out!', LoggerLevel.WRN)
            return
        }
        const loadedObj = await collection.findOne({ 'name': data.name })

        if (!loadedObj) {
            this.logger.log(`Something went wrong trying to fetch '${data.name}!`)
            this.showMsgDialog(`Something went wrong trying to fetch '${data.name}!`)
        }

        this.graphModel.loadJson(loadedObj.data)
        await this.renderer.render(false)
        this.logger.log(`Loaded '${data.name}!`)
        this.setWindowTitle(data.name)
        this.showMsgDialog(`Loaded '${data.name}!`)
    }

    private async tryToConnect(): Promise<Collection> {
        let client: MongoClient = null

        try {
            client = await MongoClient.connect(this.connectionURI)
        }
        catch (err) {
            // display cannot connect screen
            dialog.showMessageBoxSync(getCurrentWindow(), {
                title: 'Database Error',
                message: "An error occured trying to connect to Mongo. Please revise your credentials!",
                buttons: ["Ok"]
            })
            return null
        }

        let collection: Collection = null

        if (!client) {
            this.logger.log('Failed to connect to mongo, bail out!', LoggerLevel.WRN)
            return
        }

        try {
            collection = await client.db(this.dbName).collection(this.collectionName)
        } catch (err) {
            // show pop-up message
            this.logger.log('Failed to save to mongoDB. Retry later!', LoggerLevel.WRN)
            return
        }
        return collection
    }

    private showMsgDialog(msg: string) {
        dialog.showMessageBoxSync(getCurrentWindow(), {
            title: 'Database Info',
            message: msg,
            buttons: ["Ok"],
        })
    }

    private setWindowTitle(title: string) {
        getCurrentWindow().setTitle('Nodify | ' + title + '.nod')
    }

    public onConfReload(): void {
        // when conf updates, cross check the cached credentials with the potentially new ones
        // and reconnect to that
        this.connectionURI = Configuration.get().param('dbConnectionURI') as string

        if (!this.connectionURI) {
            this.logger.log('ConnectionURI string not found in configuration! Unable to connect!', LoggerLevel.ERR)
            return
        }
    }

    public onHardReload(): void { }
}
