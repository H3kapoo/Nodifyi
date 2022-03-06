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
    private allSaveNames: string[]
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
        // const collection = await this.tryToConnect()

        // // await collection.insertOne(
        // //     {
        // //         name: 'SomeName',
        // //         data: this.graphModel.getJson()
        // //     }
        // // )
        // this.allSaveNames = []
        // const c = await collection.find({})
        // const allData = await c.toArray()

        // allData.forEach(e => this.allSaveNames.push(e.name))
        // console.log(this.allSaveNames);

        ipcRenderer.send('DISPATCH_OPEN_CLOUD_SAVE', { 'names': this.allSaveNames })

        // FETCH ALL SAVE NAMES
        // SHOW 'INPUT SAVE NAME DIALOG' passing the names of saves along
        // ^ in this dialog say that file exists and will be overriten

        // shall open a dialog to input the name of save file
        // shall check if another file with this name is present, if say, say that
        // shall push data to mongo db an close the dialog on succes, on fail show fail screen

        // IF NO DETAILS ARE PRESENT FOR CONNECTION TO DB, FAIL
    }

    private async finalizeSave(data: any) {
        console.log('lulz');

        const collection = await this.tryToConnect()

        if (this.allSaveNames.includes(data.name)) {
            // update entry
            await collection.updateOne({ "name": { "$regex": data.name } }, {
                $set: { data: this.graphModel.getJson() }
            })
            // show updated dialog
            console.log('updated entry');

        }
        else {
            // create new entry
            await collection.insertOne({
                name: data.name,
                data: this.graphModel.getJson()
            })
            // show created dialog
            console.log('created entry');
        }
    }

    public async load() {
        const collection = await this.tryToConnect()
        if (!collection) {
            this.logger.log('Failed to connect to mongo, bail out!', LoggerLevel.WRN)
            return
        }

        const name = 'LOl'
        const obj = await collection.findOne({ 'name': 'LOl' })
        console.log(obj);

        // shall open a dialog with a list of available saves
        // on save click, try to load it into canvas
        // on fail shall show fail dialog

        // IF NO DETAILS ARE PRESENT FOR CONNECTION TO DB, FAIL
    }

    private async finalizeLoad(data: any) {

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