import { GraphNodeBaseOptions, Vec2d, ConnectionPoints, ConnectionOptions } from "../types"
import GraphNodeBase from "./GraphNodeBase"
import * as utils from '../Renderer/RendererUtils'


enum ConnectionDefaults {
    COLOR = 'black',
    ELEVATION = 100
}

export default class Connection {
    static idGiver = 1
    private uniqueId: number

    private fromNode: GraphNodeBase
    private toNode: GraphNodeBase

    private options: ConnectionOptions

    constructor(fromNode: GraphNodeBase, toNode: GraphNodeBase, options: ConnectionOptions) {
        this.initialize(fromNode, toNode, options)
    }

    private initialize(fromNode: GraphNodeBase, toNode: GraphNodeBase, options: ConnectionOptions) {
        this.fromNode = fromNode
        this.toNode = toNode
        this.options = options
        this.uniqueId = Connection.idGiver++
    }

    public render(ctx: CanvasRenderingContext2D) {
        const fromNodeOpts: GraphNodeBaseOptions = this.fromNode.getOptions()
        const toNodeOpts: GraphNodeBaseOptions = this.toNode.getOptions()

        const connStartPos: Vec2d = fromNodeOpts.position
        const connEndPos: Vec2d = toNodeOpts.position

        const nodeStartRadius: number = fromNodeOpts.radius
        const nodeEndRadius: number = toNodeOpts.radius

        const connColor: string = this.options.color || ConnectionDefaults.COLOR
        const connElevation: number = this.options.elevation || ConnectionDefaults.ELEVATION

        const connPoints: ConnectionPoints =
            utils.getBezierPoints(connStartPos, connEndPos, nodeStartRadius, nodeEndRadius, connElevation)

        ctx.beginPath()
        ctx.strokeStyle = connColor
        ctx.lineWidth = 4 //hardcoded
        ctx.beginPath()
        ctx.moveTo(connPoints.start[0], connPoints.start[1])
        ctx.quadraticCurveTo(connPoints.control[0], connPoints.control[1], connPoints.end[0], connPoints.end[1])
        ctx.stroke()

    }

    public getUniqueId() { return this.uniqueId }

    public getFromNode() { return this.fromNode }

    public getToNode() { return this.toNode }

    public getConnectionId() { return Connection.getConnectionId(this.fromNode, this.toNode) }

    static getConnectionId(fromNode: GraphNodeBase, toNode: GraphNodeBase) {
        return fromNode.getUniqueId() * 1000 + toNode.getUniqueId()
    }
}