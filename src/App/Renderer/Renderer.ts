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
    private bgGridSpacing: number
    private backgroundDataImage: HTMLImageElement
    private bufferStateImage: boolean
    private bufferedStateImagesData: string[]
    private resolver: Function

    public initialize(graphModel: GraphModel) {
        this.bgGridSpacing = Configuration.get().param('backgroundGridSpacing') as number
        this.needsRerendering = false
        this.bufferStateImage = false
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

    public beginBufferStateImageData() { this.bufferStateImage = true }

    public endBufferStateImageData() { this.bufferStateImage = false }

    public getBufferedStateImageData() { return this.bufferedStateImagesData }

    public async render(shouldAwait: boolean = true) {

        if (!this.currentModel) {
            this.logger.log('There is not graph model subscribbed!', LoggerLevel.ERR)
            return false
        }

        if (shouldAwait)
            await this.renderModelProxy()
        else
            this.fastRenderModelProxy()
        return true
    }

    private fastRenderModelProxy() {
        window.requestAnimationFrame(this.renderModel.bind(this))
        this.resolver = () => { }
    }

    private async renderModelProxy() {
        await new Promise<void>((res, rej) => {
            window.requestAnimationFrame(this.renderModel.bind(this))
            this.resolver = res
            this.isCurrentlyDrawing = true
        })
        this.isCurrentlyDrawing = false
    }

    private renderModel(timeStamp: DOMHighResTimeStamp) {
        this.clearAndRenderBackgroundGrid()

        if (!this.startDelta)
            this.startDelta = timeStamp

        this.endDelta = timeStamp

        let deltaTime = this.endDelta - this.startDelta

        /* A little hack because at first run, timeStamp seems to skyrocket to 1000+*/
        if (deltaTime > 30) deltaTime = 16

        this.needsRerendering = false

        for (const [id, connData] of Object.entries(this.currentModel.getConnections())) {
            connData.update(deltaTime)
            connData.render(this.drawContext)

            /* Check to see if any conn still needs a render pass because of anim 
               If there are no objects, resolve promise & exit, rerender otherwise
            */

            if (!connData.isAnimationDone())
                this.needsRerendering = true
        }

        for (const [id, nodeData] of Object.entries(this.currentModel.getModel())) {

            nodeData.graphNode.update(deltaTime)
            nodeData.graphNode.render(this.drawContext)

            /* Check to see if any node still needs a render pass because of anim 
               If there are no objects, resolve promise & exit, rerender otherwise
            */

            if (!nodeData.graphNode.isAnimationDone())
                this.needsRerendering = true
        }

        this.startDelta = this.endDelta

        /* If buffering is on, save the rendered state */
        if (this.bufferStateImage)
            this.bufferedStateImagesData.push(this.drawCanvas.toDataURL('image/png'))

        if (this.needsRerendering)
            window.requestAnimationFrame(this.renderModel.bind(this))
        else
            this.resolver()
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
