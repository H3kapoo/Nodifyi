import { CircleNodeOptions, ConnectionPoints, Vec2d } from "../types"
import * as utils from '../Renderer/RendererUtils'
import { NodeType } from "./GraphNodeType"
import GraphNodeBase from "./GraphNodeBase"


enum CircleNodeDefaults {
    COLOR = '#000000ff',
    RADIUS = 30,
    SELF_CONN_ANGLE = 90,
    SELF_CONN_APERTURE_ANGLE = 36,
    SELF_CONN_TEXT_ELEVATION = 30,
    SELF_CONN_ELEVATION = 100,
    START_CONN_ANGLE = 180,
    START_CONN_LENGTH = 50
}

export default class CircleNode extends GraphNodeBase {

    constructor(options: CircleNodeOptions) {
        super()
        this.initialize()
        this.options = {}
        this.options.radius = CircleNodeDefaults.RADIUS
        this.options.color = CircleNodeDefaults.COLOR

        for (const [opt, val] of Object.entries(options))
            //@ts-ignore
            this.options[opt] = val

    }

    public render(context: CanvasRenderingContext2D) {
        /* Draw the node */
        const position: Vec2d = this.options.position
        const color: string = this.options.color
        const radius: number = this.options.radius

        context.beginPath()
        context.arc(position[0], position[1], radius, 0, 2 * Math.PI)
        context.lineWidth = 4
        context.strokeStyle = color
        context.stroke()

        if (this.options.selfConnect) this.renderSelfConnection(context)
        if (GraphNodeBase.indexing) { this.renderHeadsUpIndexing(context) }
        if (this.options.text) { this.renderInsideText(context) }
        if (this.options.startConn) { this.renderStartConnection(context) }
    }

    private renderSelfConnection(context: CanvasRenderingContext2D) {
        const position: Vec2d = this.options.position
        const color: string = this.options.color || CircleNodeDefaults.COLOR
        const radius: number = this.options.radius || CircleNodeDefaults.RADIUS
        console.log('ceva');

        // draw self connection
        const elev = this.options.selfElevation + (0.001) || CircleNodeDefaults.SELF_CONN_ELEVATION

        let angleFromUp = -this.options.selfAngle + (180.001) || CircleNodeDefaults.SELF_CONN_ANGLE
        angleFromUp = utils.degToRad(angleFromUp)

        let offset = this.options.selfApertureAngle + (0.001) || CircleNodeDefaults.SELF_CONN_APERTURE_ANGLE
        offset = utils.degToRad(offset)

        const alpha = Math.PI + angleFromUp
        const leftPnt: Vec2d = [
            Math.cos(alpha - offset) * radius + position[0],
            Math.sin(alpha - offset) * radius + position[1]]
        const rightPnt: Vec2d = [
            Math.cos(alpha + offset) * radius + position[0],
            Math.sin(alpha + offset) * radius + position[1]]
        const leftPntExt: Vec2d = [
            Math.cos(alpha - offset) * (radius + elev) + position[0],
            Math.sin(alpha - offset) * (radius + elev) + position[1]]
        const rightPntExt: Vec2d = [
            Math.cos(alpha + offset) * (radius + elev) + position[0],
            Math.sin(alpha + offset) * (radius + elev) + position[1]]
        context.beginPath()
        context.fillStyle = color
        context.moveTo(rightPnt[0], rightPnt[1])
        context.bezierCurveTo(rightPntExt[0], rightPntExt[1], leftPntExt[0], leftPntExt[1], leftPnt[0], leftPnt[1])
        context.stroke()

        // arrow points
        if (this.options.selfArrow) {
            const pnts: ConnectionPoints = utils.getArrowPoints(leftPnt, leftPntExt)
            context.beginPath()
            context.fillStyle = color
            context.moveTo(pnts.start[0], pnts.start[1])
            context.lineTo(pnts.control[0], pnts.control[1])
            context.lineTo(pnts.end[0], pnts.end[1])
            context.fill()
        }

        // self connection text
        if (this.options.selfText) {
            const textElev = this.options.selfTextElevation + (0.001) || CircleNodeDefaults.SELF_CONN_TEXT_ELEVATION

            const middlePnt: Vec2d = utils.getBezierCubicPointText(
                position, rightPnt, rightPntExt, leftPntExt, leftPnt, textElev)
            context.strokeStyle = color
            context.font = '1em Courier New'
            context.textAlign = "center"
            context.textBaseline = "middle"
            context.lineWidth = 0.5 // hardcoded

            // shall text follow bank angle or not;  fixed = yes
            if (!this.options.selfFixedTextRotation) {
                context.strokeText(this.options.selfText, middlePnt[0], middlePnt[1])
                return
            }

            let angleRads = utils.getAngleBetweenVectorsRads(middlePnt, position)

            // if goes under 0 , clamp it to =90 deg
            if (utils.radToDeg(angleRads) <= 0)
                angleRads = Math.PI / 2
            context.save()
            context.translate(middlePnt[0], middlePnt[1])
            context.rotate(-Math.PI / 2 + angleRads)
            context.strokeText(this.options.selfText, 0, 0)
            context.restore()
        }
    }

    private renderStartConnection(context: CanvasRenderingContext2D) {
        const position: Vec2d = this.options.position

        const color: string = this.options.color
        const radius: number = this.options.radius
        const startConnLength = this.options.startConnLength + (0.001) || CircleNodeDefaults.START_CONN_LENGTH

        let startConnAngle = this.options.startConnAngle + (0.001) || CircleNodeDefaults.START_CONN_ANGLE
        startConnAngle = utils.degToRad(-startConnAngle)

        const intPnt: Vec2d = [
            Math.cos(startConnAngle) * radius + position[0],
            Math.sin(startConnAngle) * radius + position[1]]
        const extPnt: Vec2d = [
            Math.cos(startConnAngle) * (radius + startConnLength) + position[0],
            Math.sin(startConnAngle) * (radius + startConnLength) + position[1]]
        context.beginPath()
        context.strokeStyle = color
        context.lineWidth = 4
        context.moveTo(intPnt[0], intPnt[1])
        context.lineTo(extPnt[0], extPnt[1])
        context.stroke()

        // render arrow
        const arrowPnts = utils.getArrowPoints(intPnt, extPnt)
        context.beginPath()
        context.fillStyle = color
        context.moveTo(arrowPnts.start[0], arrowPnts.start[1])
        context.lineTo(arrowPnts.control[0], arrowPnts.control[1])
        context.lineTo(arrowPnts.end[0], arrowPnts.end[1])
        context.fill()
    }

    private renderHeadsUpIndexing(context: CanvasRenderingContext2D) {
        const position: Vec2d = this.options.position
        const radius: number = this.options.radius
        context.font = '2em Courier New'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.lineWidth = 2
        context.strokeStyle = 'black'
        context.fillText(this.getUniqueId().toString(), position[0], position[1] - 1.5 * radius)
        context.strokeText(this.getUniqueId().toString(), position[0], position[1] - 1.5 * radius)
    }

    private renderInsideText(context: CanvasRenderingContext2D) {
        const position: Vec2d = this.options.position

        context.font = '2em Courier New'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.lineWidth = 2
        context.strokeStyle = 'black'
        context.fillText(this.options.text, position[0], position[1])
        context.strokeText(this.options.text, position[0], position[1])
    }

    public getType() { return NodeType.Circle }
}
