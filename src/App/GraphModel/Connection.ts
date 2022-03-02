import { GraphNodeBaseOptions, Vec2d, ConnectionPoints, ConnectionOptions, AnimationOptions, AnyConnectionOptions } from "../types"
import GraphNodeBase from "./GraphNodeBase"
import * as utils from '../Renderer/RendererUtils'
import Animator from "../Animation/Animator"


enum ConnectionDefaults {
    COLOR = '#000000ff',
    ELEVATION = 100,
    TEXT_ELEVATION = 30
}

export default class Connection {
    static idGiver = 1
    private uniqueId: number

    private fromNode: GraphNodeBase
    private toNode: GraphNodeBase

    private options: AnyConnectionOptions
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
        const connElevation: number = this.options.elevation + (.001) || ConnectionDefaults.ELEVATION

        const connPoints: ConnectionPoints =
            utils.getBezierPoints(connStartPos, connEndPos, nodeStartRadius, nodeEndRadius, connElevation)

        ctx.beginPath()
        ctx.lineWidth = 4 //hardcoded
        ctx.moveTo(connPoints.start[0], connPoints.start[1])
        ctx.quadraticCurveTo(connPoints.control[0], connPoints.control[1], connPoints.end[0], connPoints.end[1])
        ctx.strokeStyle = connColor
        ctx.stroke()

        if (this.options.directed) {
            const arrowPnts = utils.getArrowPoints(connPoints.end, connPoints.control)
            ctx.beginPath()
            ctx.fillStyle = connColor
            ctx.moveTo(arrowPnts.start[0], arrowPnts.start[1])
            ctx.lineTo(arrowPnts.control[0], arrowPnts.control[1])
            ctx.lineTo(arrowPnts.end[0], arrowPnts.end[1])
            ctx.fill()
        }

        if (this.options.text)
            this.handleTextRendering(ctx, connPoints)
    }

    public handleTextRendering(ctx: CanvasRenderingContext2D, bezierPoints: ConnectionPoints) {
        const textColor: string = this.options.textColor || ConnectionDefaults.COLOR
        const textElevation: number = this.options.textElevation + (.001) || ConnectionDefaults.TEXT_ELEVATION

        ctx.strokeStyle = textColor
        ctx.font = '1em Courier New'
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.lineWidth = 0.5 // hardcoded
        const pnt: Vec2d =
            utils.getBezierPointsText(bezierPoints.start, bezierPoints.control, bezierPoints.end, textElevation)

        // cn pos 400,500 && cn pos 600,700 && cc id 2,1 text ceva
        // shall text follow nodes angle or not;  fixed = yes
        if (!this.options.fixedTextRotation) {
            ctx.strokeText(this.options.text, pnt[0], pnt[1])
            return
        }

        let angleRads = utils.getAngleBetweenVectorsRads(bezierPoints.start, bezierPoints.end)

        // if goes under -90 , clamp it to 0 deg
        if (angleRads * 180 / Math.PI <= -90)
            angleRads = 0

        ctx.save()
        ctx.translate(pnt[0], pnt[1])
        ctx.rotate(angleRads)
        ctx.strokeText(this.options.text, 0, 0)
        ctx.restore()
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

    public resetUpdate() {
        if (this.animator)
            this.animator = null
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
