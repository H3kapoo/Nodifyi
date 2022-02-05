import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";
import CircleNode from "../GraphModel/CircleNode";
import GraphModel from "../GraphModel/GraphModel";
import { Vec2d } from "../types";


/** Class that handles the rendering of the canvas element*/
export default class Renderer implements IReloadable {
    private logger = new Logger('Renderer')

    private currentModel: GraphModel
    private drawContext: CanvasRenderingContext2D
    private drawCanvas: HTMLCanvasElement
    private isCurrentlyDrawing: boolean
    private needsRerendering: boolean
    private startDelta: number
    private endDelta: number
    private frameNumber: number
    private bgGridSpacing: number
    private resolver: Function
    private backgroundDataImage: HTMLImageElement

    private bufferSkipFrames: number
    private bufferStateImage: boolean
    private bufferedStateImagesData: string[]

    public initialize(graphModel: GraphModel) {
        this.bgGridSpacing = Configuration.get().param('backgroundGridSpacing') as number
        this.needsRerendering = false
        this.bufferStateImage = false
        this.frameNumber = 0
        this.bufferSkipFrames = 10
        this.bufferedStateImagesData = []

        if (!this.bgGridSpacing) {
            this.logger.log('Failed to fetch backgroundGridSpacing of canvas!', LoggerLevel.ERR)
            this.logger.log('Module initialized!')
            return false
        }

        this.currentModel = graphModel
        this.logger.log('Module initialized!')
        return true
    }

    public async render(shouldAwait: boolean = true) {

        if (!this.currentModel) {
            this.logger.log('There is not graph model subscribbed!', LoggerLevel.ERR)
            return false
        }

        if (shouldAwait)
            await this.awaitableRenderModelProxy()
        else
            this.noAwaitRenderModelProxy()
        return true
    }

    private noAwaitRenderModelProxy() {
        window.requestAnimationFrame(this.renderModel.bind(this))
        this.resolver = () => { }
    }

    private async awaitableRenderModelProxy() {
        await new Promise<void>((res, rej) => {
            window.requestAnimationFrame(this.renderModel.bind(this))
            this.resolver = res
            this.isCurrentlyDrawing = true
        })
        this.isCurrentlyDrawing = false
    }

    private renderModel(timeStamp: DOMHighResTimeStamp) {
        if (!this.startDelta)
            this.startDelta = timeStamp
        this.endDelta = timeStamp
        let deltaTime = this.endDelta - this.startDelta
        this.needsRerendering = false

        if (deltaTime > 200) deltaTime = 16

        if (deltaTime !== 0) {
            this.clearAndRenderBackgroundGrid()

            for (const [id, connData] of Object.entries(this.currentModel.getConnections())) {
                connData.update(deltaTime)
                connData.render(this.drawContext)

                if (!connData.isAnimationDone())
                    this.needsRerendering = true
            }

            for (const [id, nodeData] of Object.entries(this.currentModel.getModel())) {
                nodeData.graphNode.update(deltaTime)
                nodeData.graphNode.render(this.drawContext)

                if (!nodeData.graphNode.isAnimationDone())
                    this.needsRerendering = true
            }

            /* If buffering is on, save the rendered state every bufferSkipFrames frames */
            if (this.bufferStateImage && (this.frameNumber % this.bufferSkipFrames === 0))
                this.bufferedStateImagesData.push(this.drawCanvas.toDataURL('image/png'))

            this.startDelta = this.endDelta
        }
        else
            this.needsRerendering = true

        if (this.needsRerendering && deltaTime !== 0)
            window.requestAnimationFrame(this.renderModel.bind(this))
        else
            this.resolver()
        console.log("a");

        this.frameNumber++
    }

    public getCurrentStateImageData(): string {
        return this.drawCanvas.toDataURL('image/png')
    }

    public beginBufferStateImageData() {
        this.bufferStateImage = true
    }

    public endBufferStateImageData() {
        this.bufferStateImage = false
    }

    public getBufferedStateImageData() { return this.bufferedStateImagesData }

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

    public onConfReload() {
        this.logger.log('Renderer will reload')
        this.backgroundDataImage = null
    }

    public subscribeCanvas(canvas: HTMLCanvasElement) {
        this.drawCanvas = canvas
        this.drawContext = canvas.getContext('2d')
    }

    public isBusyDrawing() { return this.isCurrentlyDrawing }
}
