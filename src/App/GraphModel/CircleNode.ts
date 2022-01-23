import { CircleNodeOptions, GraphNodeBaseOptions, Vec2d } from "../types";
import { NodeType } from "./GraphNodeType";
import GraphNodeBase from "./GraphNodeBase";


enum CicleNodeDefaults {
    COLOR = 'black',
    RADIUS = 30
}

export default class CircleNode extends GraphNodeBase {

    private options: CircleNodeOptions

    constructor(options: CircleNodeOptions) {
        super()
        this.initialize()
        this.options = options
    }

    public render(context: CanvasRenderingContext2D): void {
        /* Draw the node */
        const position: Vec2d = this.options.position
        const color: string = this.options.color
        const radius: number = this.options.radius

        context.beginPath()
        context.arc(position[0], position[1], radius, 0, 2 * Math.PI)
        context.lineWidth = 4
        context.strokeStyle = color
        context.stroke()

        if (this.getIndexingState()) { this.renderHeadsUpIndexing(context) }
    }

    private renderHeadsUpIndexing(context: CanvasRenderingContext2D) {
        const position: Vec2d = this.options.position
        const radius: number = this.options.radius || CicleNodeDefaults.RADIUS

        context.font = '2em Courier New'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.lineWidth = 2
        context.strokeStyle = 'black'
        context.fillText(this.getUniqueId().toString(), position[0], position[1] - 1.5 * radius)
        context.strokeText(this.getUniqueId().toString(), position[0], position[1] - 1.5 * radius)
    }


    public getOptions(): CircleNodeOptions { return this.options }

    public getType() { return NodeType.Circle }

}