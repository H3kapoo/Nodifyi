import { Logger, LoggerLevel } from "../../Logger/Logger"
import IReloadable from "../Configuration/IReloadable"
import { GraphNodeId, GraphNodeSet, ConnectionSet } from "../types"
import Connection from "./Connection"
import GraphNode from "./GraphNode"


/** Class handling the insert/remove/update of graph objects */
export default class GraphModel implements IReloadable {
    private logger = new Logger('GraphModel')

    private model: GraphNodeSet
    private connections: ConnectionSet

    constructor() {
        this.initialize()
        this.logger.log('Initialized')
    }

    private initialize(): void {
        this.model = {}
        this.connections = {}
    }

    public addNode(node: GraphNode) {
        this.model[node.getUniqueId()] = { graphNode: node, inIds: new Set(), outIds: new Set() }
        return true
    }

    public findNode(id: GraphNodeId): GraphNode {
        if (this.model[id])
            return this.model[id].graphNode
        this.logger.log(`Node ${id} was not found!`, LoggerLevel.WRN)
        return null
    }

    public rmNode(id: GraphNodeId) {
        if (!this.model[id]) {
            this.logger.log(`Could not delete invisible node id ${id}!`, LoggerLevel.WRN)
            return false
        }

        // delete all out going connections
        for (const toNode of [...this.model[id].outIds]) {
            if (!this.rmConnection(id, toNode)) {
                this.logger.log(`Failed removing connection between node ${id} and ${toNode}!`, LoggerLevel.ERR)
                return false
            }
        }

        // delete all ingoing connections
        for (const fromNode of [...this.model[id].inIds]) {
            if (!this.rmConnection(fromNode, id)) {
                this.logger.log(`Failed removing connection between node ${fromNode} and ${id}!`, LoggerLevel.ERR)
                return false
            }
        }

        // delete the graph node itself
        delete this.model[id]
        return true
    }

    public addConnection(fromId: GraphNodeId, toId: GraphNodeId) {
        const fromNode = this.model[fromId]
        const toNode = this.model[toId]

        if (fromNode && toNode) {
            const conn = new Connection(fromNode.graphNode, toNode.graphNode)
            this.connections[conn.getConnectionId()] = conn
            fromNode.outIds.add(toId)
            toNode.inIds.add(fromId)
            return true
        }

        this.logger.log('Could not connect nodes, one of it doesnt exist!', LoggerLevel.WRN)
        return false
    }

    public findConnection(fromId: GraphNodeId, toId: GraphNodeId): Connection {
        const fromNode = this.model[fromId]
        const toNode = this.model[toId]

        if (fromNode && toNode) {

            if (!fromNode.outIds.has(toId)) {
                this.logger.log(`Connection not found between nodes ${fromId} and ${toId}!`, LoggerLevel.WRN)
                return null
            }

            const connId = Connection.getConnectionId(fromNode.graphNode, toNode.graphNode)

            if (this.connections[connId])
                return this.connections[connId]
            this.logger.log(`Connection not found between nodes ${fromId} and ${toId} in Set!`, LoggerLevel.ERR)
        }

        this.logger.log('Could not find base nodes, at least one of it doesnt exist!', LoggerLevel.WRN)
        return null
    }

    public rmConnection(fromId: GraphNodeId, toId: GraphNodeId) {
        const conn = this.findConnection(fromId, toId)

        if (!conn) {
            this.logger.log(`Connection doesnt exist between node ${fromId} and ${toId}!`, LoggerLevel.WRN)
            return false
        }

        // remove connection from->to from graphSet
        this.model[fromId].outIds.delete(toId)
        // remove connection to<-from from graphSet
        this.model[toId].inIds.delete(fromId)
        // remove connection from connectionSet
        delete this.connections[conn.getConnectionId()]

        return true
    }

    onConfReload(): void {
    }


    public getModel() { return this.model }

    public getConnections() { return this.connections }

}