export default abstract class GraphNode {
    static idGiver = 1
    private uniqueId: number

    protected initialize(): void { this.uniqueId = GraphNode.idGiver++ }

    public abstract render(): void

    public getUniqueId() {
        return this.uniqueId
    }

    /** TESTS ONLY */
    public static testOnlyResetIdGiver() { GraphNode.idGiver = 0 }
}