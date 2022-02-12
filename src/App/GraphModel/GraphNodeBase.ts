import { AnimationOptions, AnyGraphNodeOptions, CircleNodeOptions, GraphNodeBaseOptions } from "../types"
import { NodeType } from "./GraphNodeType";


export default abstract class GraphNodeBase {
    static idGiver = 1
    protected uniqueId: number
    private indexing: boolean

    /* To give the node an unique id */
    protected initialize() { this.uniqueId = GraphNodeBase.idGiver++; this.indexing = false }

    /* To basically render the node */
    public abstract render(ctx: CanvasRenderingContext2D): void

    /* To get the current options on the node */
    public abstract getOptions(): GraphNodeBaseOptions

    /* Used when loading project from file to instantiate the node with 'data' TODO: Abstract it here */
    public abstract createFromData(data: Object): void

    /* Used at serialization/deserialization to know what type of node to instantiate */
    public abstract getType(): NodeType

    /* Used to upload an animation object, TODO: shall be abstracted to here instead */
    public abstract uploadAnimationObject(animation: AnimationOptions): void

    /* Used to upload an animation object, TODO: shall be abstracted to here instead */
    public abstract update(delta: number): void

    /* Basically nulls out the Animator (shall be used for interrupts) */
    public abstract resetUpdate(): void

    /* Shall be abstracted here */
    public abstract isAnimationDone(): boolean

    /* Abstract here */
    public abstract updateOptions(options: AnyGraphNodeOptions): void

    public toggleHeadsUpIndexing() { this.indexing = !this.indexing }

    public getIndexingState() { return this.indexing }

    public getUniqueId() { return this.uniqueId }

    /** TESTS ONLY , maybe deprecated, who needs tests:)) */
    public static testOnlyResetIdGiver() { GraphNodeBase.idGiver = 0 }
}