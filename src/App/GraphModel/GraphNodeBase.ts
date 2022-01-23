import { GraphNodeBaseOptions } from "../types"

export default abstract class GraphNodeBase {
    static idGiver = 1
    private uniqueId: number
    private indexing: boolean
    protected initialize(): void { this.uniqueId = GraphNodeBase.idGiver++; this.indexing = false }

    public abstract render(ctx: CanvasRenderingContext2D): void

    public abstract getOptions(): GraphNodeBaseOptions

    public toggleHeadsUpIndexing() { this.indexing = !this.indexing }

    public getIndexingState() { return this.indexing }

    public getUniqueId() { return this.uniqueId }

    /** TESTS ONLY */
    public static testOnlyResetIdGiver() { GraphNodeBase.idGiver = 0 }
}