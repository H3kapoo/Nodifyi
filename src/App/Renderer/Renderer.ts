import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import CircleNode from "../GraphModel/CircleNode";
import GraphModel from "../GraphModel/GraphModel";
import { Vec2d } from "../types";


/** Class that handles the rendering of the canvas element*/
export default class Renderer {
    private logger = new Logger('Renderer')

    private currentModel: GraphModel
    private drawContext: CanvasRenderingContext2D
    private drawCanvas: HTMLCanvasElement
    private isCurrentlyDrawing: boolean
    private needsRerendering: boolean
    private startDelta: number
    private endDelta: number
    private bgGridSpacing: number
    private backgroundDataImage: HTMLImageElement
    private resolver: Function

    public initialize(graphModel: GraphModel) {
        this.bgGridSpacing = Configuration.get().param('backgroundGridSpacing') as number
        this.needsRerendering = false

        if (!this.bgGridSpacing) {
            this.logger.log('Failed to fetch backgroundGridSpacing of canvas!', LoggerLevel.ERR)
            this.logger.log('Module initialized!')
            return false
        }

        this.currentModel = graphModel

        this.logger.log('Module initialized!')
        return true
    }

    public async render() {

        if (!this.currentModel) {
            this.logger.log('There is not graph model subscribbed!', LoggerLevel.ERR)
            return false
        }

        if (!this.drawCanvas) {
            this.logger.log('There is not canvas subscribbed!', LoggerLevel.ERR)
            return false
        }

        await this.renderModelProxy()
        return true
    }

    private async renderModelProxy() {
        await new Promise<void>((res, rej) => {
            window.requestAnimationFrame(this.renderModel.bind(this))
            this.resolver = res
        })
    }

    private renderModel(timeStamp: DOMHighResTimeStamp) {
        this.clearAndRenderBackgroundGrid()

        if (!this.startDelta)
            this.startDelta = timeStamp

        this.endDelta = timeStamp

        let deltaTime = this.endDelta - this.startDelta
        if (deltaTime > 30) deltaTime = 16

        for (const [id, nodeData] of Object.entries(this.currentModel.getModel())) {
            // nodeData.graphNode.toggleHeadsUpIndexing()
            // here we should update the state of the node if it has some animation on it

            /*DGB ONLY */
            // this needs to be refactored, ineficient
            if (!nodeData.graphNode.isAnimationDone())
                this.needsRerendering = true
            else {
                this.needsRerendering = false
                this.resolver()
            }

            nodeData.graphNode.update(deltaTime)
            nodeData.graphNode.render(this.drawContext)
        }

        for (const [id, connData] of Object.entries(this.currentModel.getConnections())) {
            // here we should update the state of the connection if it has some animation on it
            // connData.update(deltaTime)
            connData.render(this.drawContext)
        }

        this.startDelta = this.endDelta

        if (this.needsRerendering)
            window.requestAnimationFrame(this.renderModel.bind(this))
    }

    private clearAndRenderBackgroundGrid() {
        const width = this.drawCanvas.width
        const height = this.drawCanvas.height
        this.drawContext.fillStyle = 'white'
        this.drawContext.rect(0, 0, width, height)
        this.drawContext.fill()

        /* Optimization so we don't recalculate static background each frame */
        if (!this.backgroundDataImage) {
            for (let x = this.bgGridSpacing; x < width; x += this.bgGridSpacing)
                for (let y = this.bgGridSpacing; y < height; y += this.bgGridSpacing) {
                    const text = x.toString() + ',' + y.toString()
                    this.renderText([x, y], text)
                }

            for (let y = 0; y < height; y += this.bgGridSpacing)
                this.renderLine([0, y], [width, y])

            for (let x = 0; x < width; x += this.bgGridSpacing)
                this.renderLine([x, 0], [x, height])

            this.backgroundDataImage = new Image
            this.backgroundDataImage.src = this.drawCanvas.toDataURL('image/jpeg')
        }
        this.drawContext.drawImage(this.backgroundDataImage, 0, 0)
    }

    private renderText(position: Vec2d, text: string): void {
        this.drawContext.font = '0.60em Courier New'
        this.drawContext.strokeStyle = "#00000011"
        this.drawContext.fillStyle = "#00000066"
        this.drawContext.textAlign = "center"
        this.drawContext.textBaseline = "middle"
        this.drawContext.lineWidth = 2 // hardcoded
        this.drawContext.fillText(text, position[0], position[1])
        this.drawContext.strokeText(text, position[0], position[1])
    }

    private renderLine(startPos: Vec2d, endPos: Vec2d) {
        this.drawContext.strokeStyle = '#00000011'
        this.drawContext.lineWidth = 1
        this.drawContext.beginPath()
        this.drawContext.moveTo(startPos[0], startPos[1])
        this.drawContext.lineTo(endPos[0], endPos[1])
        this.drawContext.stroke()
    }

    public subscribeCanvas(canvas: HTMLCanvasElement) {
        this.drawCanvas = canvas
        this.drawContext = canvas.getContext('2d')
    }
}
