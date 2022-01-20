import GraphModel from "./GraphModel/GraphModel"
import { Logger, LoggerLevel } from "../Logger/Logger"
import CircleNode from "./GraphModel/CircleNode"
import Configuration from "./Configuration/Configuration"
import os from 'os'
import path from 'path'


/** Main application entry class*/
export default class App {
    private logger = new Logger('App')

    private graphModel: GraphModel

    constructor() {
        this.initialize()
        this.logger.log('Initialized')
    }

    private initialize(): void {
        const confPath = path.join(os.homedir(), '.defaultConf.json')

        if (!Configuration.get().loadConf(confPath)) {
            this.logger.log(`--- APPLICATION ABORT | CONTACT OWNER ---`, LoggerLevel.ERR)
            return
        }

        this.initializeAndSubscribeComponents()

        // const graphModel = new GraphModel()
        // const node1 = new CircleNode()
        // const node2 = new CircleNode()
        // graphModel.addNode(node1)
        // graphModel.addNode(node2)
        // graphModel.addConnection(node1.getUniqueId(), node2.getUniqueId())
        // graphModel.addConnection(node1.getUniqueId(), node1.getUniqueId())
        // graphModel.rmNode(node1.getUniqueId())
        // graphModel.rmNode(node1.getUniqueId())

        // console.log(graphModel.getModel())
        // console.log(graphModel.getConnections())

    }

    private initializeAndSubscribeComponents() {
        this.graphModel = new GraphModel()

        Configuration.get().subscribeReloadable(this.graphModel)
    }
}