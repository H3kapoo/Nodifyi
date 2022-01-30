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

        if (options.animation) {
            node.uploadAnimationObject(options.animation)
            await this.renderer.render()
        }
        else
            this.renderer.render(false)
        return Promise.resolve(node.getUniqueId())
    }

    private async updateNode(id: GraphNodeId, options: AnyGraphNodeOptions): Promise<void> {
        const node = this.graphModel.findNode(id)

        if (!node) return null

        node.updateOptions(options)
        if (options.animation) {
            node.uploadAnimationObject(options.animation)
            await this.renderer.render()
        } else
            this.renderer.render(false)
    }

    private deleteNode(id: GraphNodeId) {
        this.graphModel.rmNode(id)
        this.renderer.render()
    }

    private async createConnection(fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions) {
        const conn = this.graphModel.addConnection(fromId, toId, options)
        if (options.animation) {
            conn.uploadAnimationObject(options.animation)
            await this.renderer.render()
        } else
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

    private deleteConnection(fromId: GraphNodeId, toId: GraphNodeId) {
        this.graphModel.rmConnection(fromId, toId)
        this.renderer.render()
    }

    public getAPI(): APIObject {
        return {
            'createNode': this.createNode.bind(this),
            'updateNode': this.updateNode.bind(this),
            'deleteNode': this.deleteNode.bind(this),
            'createConnection': this.createConnection.bind(this),
            'updateConnection': this.updateConnection.bind(this),
            'deleteConnection': this.deleteConnection.bind(this)
        }
    }
}
