import Connection from "./GraphModel/Connection";

type GraphNodeId = number

type CommandLogic = Function

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

interface CommandSchema {
    name: string,
    mandatory: string[]
    [option: string]: string
}

interface CommandsStruct {
    [key: string]: {
        schema: CommandSchema,
        logic: CommandLogic
    }
}
