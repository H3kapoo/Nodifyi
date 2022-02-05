import CircleNode from "../../GraphModel/CircleNode";
import GraphModel from "../../GraphModel/GraphModel";
import Renderer from "../../Renderer/Renderer";
import {
    AnyConnectionOptions, AnyGraphNodeOptions,
    APIObject, CircleNodeOptions, GraphNodeId
} from "../../types";


export default class APIHolder {

    private graphModel: GraphModel
    private renderer: Renderer

    constructor(graphModel: GraphModel, renderer: Renderer) {
        this.graphModel = graphModel
        this.renderer = renderer
    }

    private async createNode(options: AnyGraphNodeOptions): Promise<number> {
        const node = new CircleNode(options as CircleNodeOptions)
        this.graphModel.addNode(node)

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        await this.renderer.render()
        return Promise.resolve(node.getUniqueId())
    }

    private createNodeSync(options: AnyGraphNodeOptions): number {
        const node = new CircleNode(options as CircleNodeOptions)
        this.graphModel.addNode(node)

        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.renderer.render(false)
        return node.getUniqueId()
    }

    private async updateNode(id: GraphNodeId, options: AnyGraphNodeOptions): Promise<void> {
        const node = this.graphModel.findNode(id)

        if (!node) return null

        node.updateOptions(options)
        if (options.animation)
            node.uploadAnimationObject(options.animation)
        await this.renderer.render()
    }

    private updateNodeSync(id: GraphNodeId, options: AnyGraphNodeOptions): void {
        const node = this.graphModel.findNode(id)

        if (!node) return null

        node.updateOptions(options)
        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.renderer.render(false)
    }

    private deleteNodeSync(id: GraphNodeId) {
        this.graphModel.rmNode(id)
        this.renderer.render()
    }

    private async createConnection(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): Promise<void> {

        const conn = this.graphModel.addConnection(fromId, toId, options)
        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        await this.renderer.render()
    }

    private createConnectionSync(fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions) {
        const conn = this.graphModel.addConnection(fromId, toId, options)
        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        this.renderer.render(false)
    }

    private async updateConnection(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): Promise<void> {

        const conn = this.graphModel.findConnection(fromId, toId)

        if (!conn) return null
        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        conn.updateOptions(options)
        await this.renderer.render()
    }

    private updateConnectionSync(
        fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions): void {

        const conn = this.graphModel.findConnection(fromId, toId)

        if (!conn) return null
        if (options.animation)
            conn.uploadAnimationObject(options.animation)
        conn.updateOptions(options)
        this.renderer.render(false)
    }

    private deleteConnectionSync(fromId: GraphNodeId, toId: GraphNodeId) {
        this.graphModel.rmConnection(fromId, toId)
        this.renderer.render()
    }

    public getAPI(): APIObject {
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
            'deleteConnectionSync': this.deleteConnectionSync.bind(this)
        }
    }
}
