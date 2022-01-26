import CircleNode from "../../GraphModel/CircleNode";
import GraphModel from "../../GraphModel/GraphModel";
import Renderer from "../../Renderer/Renderer";
import {
    AnyConnectionOptions, AnyGraphNodeOptions,
    APIObject, CircleNodeOptions, GraphNodeBaseOptions, GraphNodeId
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
        if (options.animation)
            node.uploadAnimationObject(options.animation)
        this.graphModel.addNode(node)
        await this.renderer.render()
        return node.getUniqueId()
    }

    private updateNode() {

    }

    private deleteNode(id: GraphNodeId) {
        this.graphModel.rmNode(id)
        this.renderer.render()
    }

    private createConnection(fromId: GraphNodeId, toId: GraphNodeId, options: AnyConnectionOptions) {
        this.graphModel.addConnection(fromId, toId, options)
        this.renderer.render()
    }

    private updateConnection(id: GraphNodeId) {

    }

    private deleteConnection(id: GraphNodeId) {

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
