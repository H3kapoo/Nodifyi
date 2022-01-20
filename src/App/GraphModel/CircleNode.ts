import GraphNode from "./GraphNode";
import { NodeType } from "./GraphNodeType";

export default class CircleNode extends GraphNode {

    constructor() {
        super()
        this.initialize()
    }

    public render(): void {
        throw new Error("Method not implemented.");
    }

    public getType() { return NodeType.Circle }

}