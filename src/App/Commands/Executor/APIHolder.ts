import CircleNode from "../../GraphModel/CircleNode";
import Connection from "../../GraphModel/Connection";
import GraphModel from "../../GraphModel/GraphModel";
import GraphNodeBase from "../../GraphModel/GraphNodeBase";
import { NodeType } from "../../GraphModel/GraphNodeType";
import Renderer from "../../Renderer/Renderer";
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper";
import {
    AnyConnectionOptions, AnyGraphNodeOptions,
    APIObject, CircleNodeOptions, GraphNodeId, GraphNodeSet
} from "../../types";
import InputValidator from "./InputValidator";


export default class APIHolder {
    private graphModel: GraphModel
    private renderer: Renderer
    private outputHelper: TerminalTabOutputHelper
    private inputValidator: InputValidator
    private apiBlocked: boolean

    constructor(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer
        this.inputValidator = new InputValidator()
        this.outputHelper = new TerminalTabOutputHelper()
        this.outputHelper.setOutputContext("Output")
        this.apiBlocked = false
    }

    private output(message: string) {
        this.outputHelper.printStd(message)
    }

    private clear() {
        this.outputHelper.clearTerminal()
    }

    private getAllNodesConnectedTo(nodeId: number): number[] {
        const srcNode: GraphNodeSet = this.graphModel.getAllDataForNode(nodeId)
        if (!srcNode) {
            this.outputHelper.setBlockStdOutput()
            return null
        }
        //BFS happening here
        let nodeIds: Set<number> = new Set()
        nodeIds.add(nodeId)
        let queue: number[] = [nodeId] // plays the role of queue

        while (queue.length) {
            const curr = queue.shift()
            // console.log(curr);

            // this assumes the node already exists anyway
            const currNode: GraphNodeSet = this.graphModel.getAllDataForNode(curr)
            //@ts-ignore
            const outIds: number[] = currNode.outIds
            //@ts-ignore
            const inIds: number[] = currNode.inIds
            const neighbours: number[] = []
            outIds.forEach(e => neighbours.push(e))
            inIds.forEach(e => neighbours.push(e))
            // console.log(`Nei of ${curr} ${neighbours}`);

            for (const neighbour of neighbours)
                if (!nodeIds.has(neighbour)) {
                    nodeIds.add(neighbour)
                    queue.push(neighbour)
                }
        }

        return Array.from(nodeIds)
    }

    private getNodeProps(nodeId: number) {
        this.outputHelper.setBlockErrOutput() // in case it doesnt find the node, this shall be handled in the cmd logic
        const node: GraphNodeBase = this.graphModel.findNode(nodeId)

        if (!node)
            return null
        return { ...node.getOptions() }
    }

    private getConnectionProps(nodeFromId: number, nodeToId: number) {
        this.outputHelper.setBlockErrOutput() // in case it doesnt find the node, this shall be handled in the cmd logic
        const conn: Connection = this.graphModel.findConnection(nodeFromId, nodeToId)
        if (!conn)
            return null
        return { ...conn.getOptions() }
    }

    private async createNode(options: AnyGraphNodeOptions): Promise<number> {
        if (!this.inputValidator.validateNodeOptions(options, NodeType.Circle)) {
            this.apiBlocked = true
            return
        }
        const node = new CircleNode(options as CircleNodeOptions)
        if (!this.graphModel.addNode(node))
            this.outputHelper.setBlockStdOutput()

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        await this.renderer.render()
        return Promise.resolve(node.getUniqueId())
    }

    private createNodeSync(options: AnyGraphNodeOptions): number {
        if (!this.inputValidator.validateNodeOptions(options, NodeType.Circle)) {
            this.apiBlocked = true
            return
        }

        const node = new CircleNode(options as CircleNodeOptions)
        if (!this.graphModel.addNode(node))
            this.outputHelper.setBlockStdOutput()

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.renderer.render(false)
        return node.getUniqueId()
    }

    private async updateNode(id: GraphNodeId, options: AnyGraphNodeOptions): Promise<void> {
        if (!this.inputValidator.validateNodeOptions(options, NodeType.Circle, false)) {
            this.apiBlocked = true
            return
        }

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
        if (!this.inputValidator.validateNodeOptions(options, NodeType.Circle, false)) {
            this.apiBlocked = true
            return
        }

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

        if (fromId === toId) {
            this.outputHelper.printErr('Self connection is an option only!')
            return
        }

        if (!this.inputValidator.validateConnOptions(options)) {
            this.apiBlocked = true
            return
        }

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
        if (fromId === toId) {
            this.outputHelper.printErr('Self connection is an option only!')
            this.outputHelper.setBlockStdOutput()
            return
        }

        if (!this.inputValidator.validateConnOptions(options)) {
            this.apiBlocked = true
            return
        }

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

        if (!this.inputValidator.validateConnOptions(options, false)) {
            this.apiBlocked = true
            return
        }

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

        if (!this.inputValidator.validateConnOptions(options, false)) {
            this.apiBlocked = true
            return
        }

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
            'doOutput': this.output.bind(this),
            'clear': this.clear.bind(this),
            'getNodeProps': this.getNodeProps.bind(this),
            'getConnectionProps': this.getConnectionProps.bind(this),
            'getAllNodesConnectedTo': this.getAllNodesConnectedTo.bind(this)
        }
    }

    public getProxyAPI(): APIObject {
        const proxyAPI: APIObject = {}
        const thisThis = this
        for (const [name, func] of Object.entries(this.getAPI())) {
            const funcProxy = new Proxy(func, {
                apply: function (target, thisArg, argumentsList) {
                    if (!thisThis.apiBlocked)
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
