import { Logger, LoggerLevel } from "../../Logger/Logger"
import IReloadable from "../Configuration/IReloadable"
import { GraphNodeId, GraphNodeSet, ConnectionSet, ConnectionOptions, GraphCombined } from "../types"
import Connection from "./Connection"
import GraphNodeBase from "./GraphNodeBase"
import TerminalTabOutputHelper from "../Tabs/TerminalTabOutputHelper"
import { NodeType } from "./GraphNodeType"
import CircleNode from "./CircleNode"

/** Class handling the insert/remove/update of graph objects */
export default class GraphModel implements IReloadable {
    private logger = new Logger('GraphModel')

    private terminalHelper: TerminalTabOutputHelper
    private model: GraphNodeSet
    private connections: ConnectionSet

    public initialize() {
        this.model = {}
        this.connections = {}
        this.terminalHelper = new TerminalTabOutputHelper()
        this.terminalHelper.setOutputContext(this.logger.getContext())
        this.logger.log('Module initialized!')
        return true
    }

    public addNode(node: GraphNodeBase) {
        this.model[node.getUniqueId()] = { graphNode: node, inIds: new Set(), outIds: new Set() }
        return true
    }

    public findNode(id: GraphNodeId): GraphNodeBase {
        if (this.model[id])
            return this.model[id].graphNode
        this.logger.log(`Node ${id} was not found!`, LoggerLevel.WRN)
        this.terminalHelper.printErr(`Node ${id} was not found!`)
        return null
    }

    public rmNode(id: GraphNodeId) {
        if (!this.model[id]) {
            this.logger.log(`Could not delete invisible node id ${id}!`, LoggerLevel.WRN)
            this.terminalHelper.printErr(`Could not delete invisible node id ${id}!`)
            return false
        }

        // delete all out going connections
        for (const toNode of [...this.model[id].outIds]) {
            if (!this.rmConnection(id, toNode)) {
                this.logger.log(`Failed removing connection between node ${id} and ${toNode}!`, LoggerLevel.ERR)
                this.terminalHelper.printErr(`Failed removing connection between node ${id} and ${toNode}!`)
                return false
            }
        }

        // delete all ingoing connections
        for (const fromNode of [...this.model[id].inIds]) {
            if (!this.rmConnection(fromNode, id)) {
                this.logger.log(`Failed removing connection between node ${fromNode} and ${id}!`, LoggerLevel.ERR)
                this.terminalHelper.printErr(`Failed removing connection between node ${fromNode} and ${id}!`)
                return false
            }
        }

        // delete the graph node itself
        delete this.model[id]
        return true
    }

    public addConnection(fromId: GraphNodeId, toId: GraphNodeId, options: ConnectionOptions): Connection {
        const fromNode = this.model[fromId]
        const toNode = this.model[toId]

        if (fromNode && toNode) {
            const connId = Connection.getConnectionId(fromNode.graphNode, toNode.graphNode)
            if (this.connections[connId]) {
                this.logger.log(`Node ${fromId} already connected to node ${toId}!`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Node ${fromId} already connected to node ${toId}!`)
                return null
            }
            const conn = new Connection(fromNode.graphNode, toNode.graphNode, options)
            this.connections[conn.getConnectionId()] = conn
            fromNode.outIds.add(toId)
            toNode.inIds.add(fromId)
            return conn
        }

        this.logger.log('Could not connect nodes, one of it doesnt exist!', LoggerLevel.WRN)
        this.terminalHelper.printErr('Could not connect nodes, one of it doesnt exist!')
        return null
    }

    public findConnection(fromId: GraphNodeId, toId: GraphNodeId): Connection {
        const fromNode = this.model[fromId]
        const toNode = this.model[toId]

        if (fromNode && toNode) {

            if (!fromNode.outIds.has(toId)) {
                this.logger.log(`Connection not found between nodes ${fromId} and ${toId}!`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Connection not found between nodes ${fromId} and ${toId}!`)
                return null
            }

            const connId = Connection.getConnectionId(fromNode.graphNode, toNode.graphNode)

            if (this.connections[connId])
                return this.connections[connId]
            this.logger.log(`Connection not found between nodes ${fromId} and ${toId} in Set!`, LoggerLevel.ERR)
            this.terminalHelper.printErr(`Connection not found between nodes ${fromId} and ${toId}!`)
        }

        this.logger.log('Could not find base nodes, at least one of it doesnt exist!', LoggerLevel.WRN)
        this.terminalHelper.printErr('Could not find base nodes, at least one of it doesnt exist!')
        return null
    }

    public rmConnection(fromId: GraphNodeId, toId: GraphNodeId) {
        const conn = this.findConnection(fromId, toId)

        if (!conn) {
            this.logger.log(`Connection doesnt exist between node ${fromId} and ${toId}!`, LoggerLevel.WRN)
            this.terminalHelper.printErr(`Connection doesnt exist between node ${fromId} and ${toId}!`)
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

    /* Maybe deprecate this two functions in Renderer.ts and use get combined*/
    public getModel() { return this.model }

    public getConnections() { return this.connections }

    public setCombined(combined: GraphCombined) {
        this.model = { ...combined.nodes }
        this.connections = { ...combined.conns }
    }

    public getJson(): Object {
        const modelToSave = {
            'nodes': {} as any,
            'conns': {} as any
        }
        /* Skip the animations or they will play at load */
        for (const [id, node] of Object.entries(this.model)) {
            modelToSave.nodes[node.graphNode.getUniqueId()] = {
                type: node.graphNode.getType(),
                options: { ...this.exceptAnimations(node.graphNode.getOptions()) },
                inIds: Array.from(node.inIds),
                outIds: Array.from(node.outIds),
            }
        }

        for (const [id, conn] of Object.entries(this.connections)) {
            modelToSave.conns[conn.getConnectionId()] = {
                options: this.exceptAnimations(conn.getOptions()),
                uniqueId: conn.getUniqueId()
            }
        }

        return modelToSave
    }

    public loadJson(jsonObject: Object) {

        this.model = {}
        this.connections = {}

        const model: GraphNodeSet = {}

        // reset idGiver
        GraphNodeBase.idGiver = 1

        //@ts-ignore
        if (!jsonObject.nodes || !jsonObject.conns)
            return

        //@ts-ignore
        for (const [id, data] of Object.entries(jsonObject.nodes)) {
            let node: GraphNodeBase

            //@ts-ignore
            switch (data.type) {
                case NodeType.Circle:
                    node = new CircleNode({})
            }

            if (node) {
                //@ts-ignore
                node.createFromData({ uniqueId: parseInt(id), options: data.options })
                model[parseInt(id)] = {
                    graphNode: node,
                    //@ts-ignore
                    inIds: new Set(data.inIds),
                    //@ts-ignore
                    outIds: new Set(data.outIds)
                }
            }
        }
        this.model = model

        //@ts-ignore
        for (const [id, data] of Object.entries(jsonObject.conns)) {
            const identifier = parseInt(id)
            const startId = Math.trunc(identifier / 1000)
            const endId = identifier % 1000
            //@ts-ignore
            const options = data.options
            this.addConnection(startId, endId, options)
        }
    }

    private exceptAnimations(obj: Object): Object {
        //@ts-ignore
        delete obj.animation
        return obj
    }

    public onConfReload() { }

    public onHardReload() {
        this.loadJson({})
        this.logger.log(`${this.logger.getContext()} hard reloaded successfully!`, LoggerLevel.DBG)
    }
}