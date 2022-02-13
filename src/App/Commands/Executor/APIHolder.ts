import CircleNode from "../../GraphModel/CircleNode";
import GraphModel from "../../GraphModel/GraphModel";
import Renderer from "../../Renderer/Renderer";
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper";
import {
    AnyConnectionOptions, AnyGraphNodeOptions,
    APIObject, CircleNodeOptions, GraphNodeId
} from "../../types";


export default class APIHolder {

    private graphModel: GraphModel
    private renderer: Renderer
    private outputHelper: TerminalTabOutputHelper
    private apiBlocked: boolean

    constructor(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer
        this.outputHelper = new TerminalTabOutputHelper()
        this.outputHelper.setOutputContext("Output")
        this.apiBlocked = false
    }

    private output(message: string) {
        this.outputHelper.printStd(message)
    }

    private async createNode(options: AnyGraphNodeOptions): Promise<number> {
        const node = new CircleNode(options as CircleNodeOptions)
        if (!this.graphModel.addNode(node))
            this.outputHelper.setBlockStdOutput()

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        await this.renderer.render()
        return Promise.resolve(node.getUniqueId())
    }

    private createNodeSync(options: AnyGraphNodeOptions): number {
        const node = new CircleNode(options as CircleNodeOptions)
        if (!this.graphModel.addNode(node))
            this.outputHelper.setBlockStdOutput()

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.renderer.render(false)
        return node.getUniqueId()
    }

    private async updateNode(id: GraphNodeId, options: AnyGraphNodeOptions): Promise<void> {
        const node = this.graphModel.findNode(id)

        if (!node) {
            this.outputHelper.setBlockStdOutput()
            return null
        }

        node.updateOptions(options)
        if (options.animation)
            node.uploadAnimationObject(options.animation)
        await this.renderer.render()
    }

    private updateNodeSync(id: GraphNodeId, options: AnyGraphNodeOptions): void {
        const node = this.graphModel.findNode(id)

        if (!node) {
            this.outputHelper.setBlockStdOutput()

            return null
        }

        node.updateOptions(options)
        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.renderer.render(false)
    }

    private deleteNodeSync(id: GraphNodeId) {
        if (!this.graphModel.rmNode(id)) {
            this.outputHelper.setBlockStdOutput()
            return
        }

        this.renderer.render()
    }

    private async createConnection(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): Promise<void> {

        const conn = this.graphModel.addConnection(fromId, toId, options)
        if (!conn) {
            this.outputHelper.setBlockStdOutput()
            return
        }

        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        await this.renderer.render()
    }

    private createConnectionSync(fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions) {
        const conn = this.graphModel.addConnection(fromId, toId, options)
        if (!conn) {
            this.outputHelper.setBlockStdOutput()
            return
        }

        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        this.renderer.render(false)
    }

    private async updateConnection(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): Promise<void> {

        const conn = this.graphModel.findConnection(fromId, toId)
        if (!conn) {
            this.outputHelper.setBlockStdOutput()
            return null
        }

        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        conn.updateOptions(options)
        await this.renderer.render()
    }

    private updateConnectionSync(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): void {

        const conn = this.graphModel.findConnection(fromId, toId)
        if (!conn) {
            this.outputHelper.setBlockStdOutput()
            return null
        }

        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        conn.updateOptions(options)
        this.renderer.render(false)
    }

    private deleteConnectionSync(fromId: GraphNodeId, toId: GraphNodeId) {
        if (!this.graphModel.rmConnection(fromId, toId)) {
            this.outputHelper.setBlockStdOutput()
            return
        }
        this.renderer.render()
    }

    private getAPI(): APIObject {
        return {
            'createNode': this.createNode.bind(this),
            'createNodeSync': this.createNodeSync.bind(this),
            'updateNode': this.updateNode.bind(this),
            'updateNodeSync': this.updateNodeSync.bind(this),
            'deleteNodeSync': this.deleteNodeSync.bind(this),
            'createConnection': this.createConnection.bind(this),
            'createConnectionSync': this.createConnectionSync.bind(this),
            'updateConnection': this.updateConnection.bind(this),
            'updateConnectionSync': this.updateConnectionSync.bind(this),
            'deleteConnectionSync': this.deleteConnectionSync.bind(this),
            'doOutput': this.output.bind(this)
        }
    }

    public getProxyAPI(): APIObject {
        const proxyAPI: APIObject = {}

        for (const [name, func] of Object.entries(this.getAPI())) {
            const funcProxy = new Proxy(func, {
                apply: function (target, thisArg, argumentsList) {
                    if (!thisArg.apiBlocked)
                        return target(...argumentsList)
                    else
                        return async () => { }
                }
            })
            proxyAPI[name] = funcProxy
        }
        return proxyAPI
    }

    public setAPIBlocked(val: boolean) { this.apiBlocked = val }
}
