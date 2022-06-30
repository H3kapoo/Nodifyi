import Animator from "../Animation/Animator";
import { AnimationOptions, AnyGraphNodeOptions, CircleNodeOptions, GraphNodeBaseOptions } from "../types"
import { NodeType } from "./GraphNodeType";
const { ipcRenderer } = require('electron')


export default abstract class GraphNodeBase {
    static idGiver = 1
    protected uniqueId: number
    protected static indexing: boolean = false
    protected animator: Animator
    protected options: AnyGraphNodeOptions

    /* To give the node an unique id */
    protected initialize() { this.uniqueId = GraphNodeBase.idGiver++; }

    /* To basically render the node */
    public abstract render(ctx: CanvasRenderingContext2D): void

    /* Used at serialization/deserialization to know what type of node to instantiate */
    public abstract getType(): NodeType

    /* Used when loading project from file to instantiate the node with 'data' */
    public createFromData(data: Object): void {
        GraphNodeBase.idGiver = 1
        //@ts-ignore
        this.uniqueId = data.uniqueId
        //@ts-ignore
        this.options = data.options

        //@ts-ignore
        GraphNodeBase.idGiver = Math.max(GraphNodeBase.idGiver, data.uniqueId + 1)
    }

    /* Used to upload an animation object */
    public uploadAnimationObject(animation: AnimationOptions): void {
        this.animator = new Animator(this.options, animation)
    }

    /* Used to upload an animation object */
    public update(delta: number): void {
        if (this.animator)
            this.options = this.animator.update(delta) as CircleNodeOptions
    }

    /* Basically nulls out the Animator (shall be used for interrupts) */
    public resetUpdate(): void {
        if (this.animator)
            this.animator = null
    }

    /* Shall be abstracted here */
    public isAnimationDone(): boolean {
        let done = true
        if (this.animator)
            done = this.animator.isAnimationDone()
        if (done)
            this.animator = null
        return done
    }

    /* Abstract here */
    public updateOptions(options: AnyGraphNodeOptions): void {
        for (const [opt, val] of Object.entries(options))
            //@ts-ignore
            this.options[opt] = val
    }

    public static toggleHeadsUpIndexing() { GraphNodeBase.indexing = !GraphNodeBase.indexing }

    public getUniqueId() { return this.uniqueId }

    /* To get the current options on the node */
    public getOptions(): GraphNodeBaseOptions {
        return this.options
    }

    public static testOnlyResetIdGiver() { GraphNodeBase.idGiver = 0 }
}