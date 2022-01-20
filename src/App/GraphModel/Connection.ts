import GraphNode from "./GraphNode"

export default class Connection {
    static idGiver = 1
    private uniqueId: number

    private fromNode: GraphNode
    private toNode: GraphNode

    constructor(fromNode: GraphNode, toNode: GraphNode) {
        this.initialize(fromNode, toNode)
    }

    private initialize(fromNode: GraphNode, toNode: GraphNode) {
        this.fromNode = fromNode
        this.toNode = toNode
        this.uniqueId = Connection.idGiver++
    }

    public getUniqueId() { return this.uniqueId }

    public getFromNode() { return this.fromNode }

    public getToNode() { return this.toNode }

    public getConnectionId() {
        return Connection.getConnectionId(this.fromNode, this.toNode)
    }

    static getConnectionId(fromNode: GraphNode, toNode: GraphNode) {
        return fromNode.getUniqueId() * 1000 + toNode.getUniqueId()
    }
}