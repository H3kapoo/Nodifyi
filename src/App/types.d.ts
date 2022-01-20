import Connection from "./GraphModel/Connection";

type GraphNodeId = number

interface StringKeyObject {
    [key: string]: any
}

interface ConnectionSet {
    [key: number]: Connection
}

interface GraphNodeSet {
    [key: number]: {
        graphNode: GraphNode,
        inIds: Set<number>,
        outIds: Set<number>
    }
}
