import { AnimationOptions, AnyGraphNodeOptions, CircleNodeOptions, GraphNodeBaseOptions } from "../types"
import { NodeType } from "./GraphNodeType";


export default abstract class GraphNodeBase {
    static idGiver = 1
    protected uniqueId: number
    private indexing: boolean

    protected initialize() { this.uniqueId = GraphNodeBase.idGiver++; this.indexing = false }

    public abstract render(ctx: CanvasRenderingContext2D): void

    public abstract getOptions(): GraphNodeBaseOptions

    public abstract createFromData(data: Object): void

    public abstract getType(): NodeType

    public abstract uploadAnimationObject(animation: AnimationOptions): void

    public abstract update(delta: number): void

    public abstract isAnimationDone(): boolean

    public abstract updateOptions(options: AnyGraphNodeOptions): void

    public toggleHeadsUpIndexing() { this.indexing = !this.indexing }

    public getIndexingState() { return this.indexing }

    public getUniqueId() { return this.uniqueId }

    /** TESTS ONLY */
    public static testOnlyResetIdGiver() { GraphNodeBase.idGiver = 0 }
}