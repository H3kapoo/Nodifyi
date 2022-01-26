import { AnimationOptions, CircleNodeOptions, GraphNodeBaseOptions, Vec2d } from "../types";
import { NodeType } from "./GraphNodeType";
import GraphNodeBase from "./GraphNodeBase";
import Animator from "../Animation/Animator";


enum CircleNodeDefaults {
    COLOR = 'black',
    RADIUS = 30
}

export default class CircleNode extends GraphNodeBase {

    private animator: Animator
    private options: CircleNodeOptions

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

        if (this.getIndexingState()) { this.renderHeadsUpIndexing(context) }
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

    public uploadAnimationObject(animation: AnimationOptions) {
        this.animator = new Animator(this.options, animation)
    }

    public update(delta: number) {
        if (this.animator)
            this.options = this.animator.update(delta) as CircleNodeOptions
    }

    public isAnimationDone() { return this.animator.isAnimationDone() }

    public updateOptions(options: CircleNodeOptions) { this.options = options }

    public getOptions(): CircleNodeOptions { return this.options }

    public getType() { return NodeType.Circle }

}