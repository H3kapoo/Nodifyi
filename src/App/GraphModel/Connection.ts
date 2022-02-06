import { GraphNodeBaseOptions, Vec2d, ConnectionPoints, ConnectionOptions, AnimationOptions } from "../types"
import GraphNodeBase from "./GraphNodeBase"
import * as utils from '../Renderer/RendererUtils'
import Animator from "../Animation/Animator"


enum ConnectionDefaults {
    COLOR = '#000000ff',
    ELEVATION = 100
}

export default class Connection {
    static idGiver = 1
    private uniqueId: number

    private fromNode: GraphNodeBase
    private toNode: GraphNodeBase

    private options: ConnectionOptions
    private animator: Animator

    constructor(fromNode: GraphNodeBase, toNode: GraphNodeBase, options: ConnectionOptions) {
        this.fromNode = fromNode
        this.toNode = toNode
        this.options = options
        this.options.color = this.options.color ?? ConnectionDefaults.COLOR
        this.options.elevation = this.options.elevation ?? ConnectionDefaults.ELEVATION
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
        //TODO: When start=end pos, it breaks
        //TODO: Remove hack .001
        //POTENTIAL FIX: In validation if elev===0 => elev = .001
        const connElevation: number = this.options.elevation + (.001) || ConnectionDefaults.ELEVATION

        const connPoints: ConnectionPoints =
            utils.getBezierPoints(connStartPos, connEndPos, nodeStartRadius, nodeEndRadius, connElevation)

        ctx.beginPath()
        ctx.lineWidth = 4 //hardcoded
        ctx.moveTo(connPoints.start[0], connPoints.start[1])
        ctx.quadraticCurveTo(connPoints.control[0], connPoints.control[1], connPoints.end[0], connPoints.end[1])
        ctx.strokeStyle = connColor
        ctx.stroke()
    }

    public getUniqueId() { return this.uniqueId }

    public getFromNode() { return this.fromNode }

    public getToNode() { return this.toNode }

    public getConnectionId() { return Connection.getConnectionId(this.fromNode, this.toNode) }

    public getOptions(): ConnectionOptions { return this.options }

    static getConnectionId(fromNode: GraphNodeBase, toNode: GraphNodeBase) {
        return fromNode.getUniqueId() * 1000 + toNode.getUniqueId()
    }

    public uploadAnimationObject(animation: AnimationOptions) {
        this.animator = new Animator(this.options, animation)
    }

    public update(delta: number) {
        if (this.animator)
            this.options = this.animator.update(delta) as ConnectionOptions
    }

    public isAnimationDone() {
        let done = true
        if (this.animator)
            done = this.animator.isAnimationDone()
        if (done)
            this.animator = null
        return done
    }

    public updateOptions(options: ConnectionOptions) {
        for (const [opt, val] of Object.entries(options))
            //@ts-ignore
            this.options[opt] = val
    }
}
