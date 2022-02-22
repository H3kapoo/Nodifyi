import Connection from "./GraphModel/Connection";
import GraphNodeBase from "./GraphModel/GraphNodeBase";

type ArgTypeParseResult = string | number | string[] | string[][] | number[] | number[][] | null

type Color = String

interface APIObject {
    [key: string]: Function
}

interface CommandOptions {
    [name: string]: ArgTypeParseResult
}

interface ParsedInput {
    commandName: string,
    options: CommandOptions,
}

interface AnimationOptions {
    [key: string]: any
}

interface AnyConnectionOptions {
    [key: string]: any
}
interface AnyObjectOptions {
    [key: string]: any
}

interface AnyGraphNodeOptions {
    [key: string]: any
}

interface ConnectionOptions {
    color?: string,
    elevation?: number
}

interface GraphNodeBaseOptions {
    position?: Vec2d,
    color?: string,
    radius?: number
}

interface CircleNodeOptions {
    position?: Vec2d,
    color?: string,
    radius?: number
}

type Vec2d = [number, number]

type Vec3d = [number, number, number]

interface ConnectionPoints {
    start: Vec2d,
    end: Vec2d,
    control: Vec2d,
}

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
        graphNode: GraphNodeBase,
        inIds: Set<number>,
        outIds: Set<number>
    }
}

interface GraphCombined {
    nodes: GraphNodeSet,
    conns: ConnectionSet
}

interface CommandSchema {
    name: string,
    mandatory: string[],
    option?: string
}

interface CommandsStruct {
    [key: string]: {
        schema: CommandSchema,
        logic: CommandLogic
    }
}
