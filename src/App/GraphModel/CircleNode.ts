import { AnimationOptions, AnyGraphNodeOptions, CircleNodeOptions, Vec2d } from "../types";
import { NodeType } from "./GraphNodeType";
import GraphNodeBase from "./GraphNodeBase";


enum CircleNodeDefaults {
    COLOR = '#000000ff',
    RADIUS = 30,
}

export default class CircleNode extends GraphNodeBase {

    constructor(options: CircleNodeOptions) {
        super()
        this.initialize()
        this.options = options
        this.options.color = this.options.color ?? CircleNodeDefaults.COLOR
        this.options.radius = this.options.radius ?? CircleNodeDefaults.RADIUS
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

        if (this.options.indexing) { this.renderHeadsUpIndexing(context) }
        // if (true) { this.renderHeadsUpIndexing(context) }
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

    public getType() { return NodeType.Circle }
}
