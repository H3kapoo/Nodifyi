import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";
import GraphModel from "../GraphModel/GraphModel";
import { Vec2d } from "../types";
import IRendererListener from "./IRendererListener";
const { ipcRenderer } = require('electron')


/** Class that handles the rendering of the canvas element*/
export default class Renderer implements IReloadable {
    private logger = new Logger('Renderer')

    private currentModel: GraphModel
    private drawContext: CanvasRenderingContext2D
    private drawCanvas: HTMLCanvasElement
    private needsRerendering: boolean
    private lastFrameTimeMs: number = 0
    private bgGridSpacing: Vec2d
    private resolver: Function
    private backgroundDataImage: HTMLImageElement
    private backgroundGridDraw: boolean
    private listeners: IRendererListener[]

    public initialize(graphModel: GraphModel, canvas: HTMLCanvasElement) {
        this.bgGridSpacing = [
            Configuration.get().param('backgroundHsep') as number,
            Configuration.get().param('backgroundVsep') as number]
        this.backgroundGridDraw = Configuration.get().param('backgroundGridDraw') as boolean
        this.needsRerendering = false
        this.listeners = []

        if (!this.bgGridSpacing) {
            this.logger.log('Failed to fetch backgroundGridSpacing of canvas!', LoggerLevel.FATAL)
            return false
        }

        this.currentModel = graphModel
        this.drawCanvas = canvas
        this.drawContext = canvas.getContext('2d')
        this.onInterrupt()
        this.logger.log('Module initialized!')
        return true
    }

    public async render(shouldAwait: boolean = true) {

        if (!this.currentModel) {
            this.logger.log('There is not graph model subscribbed!', LoggerLevel.ERR)
            return false
        }

        if (shouldAwait)
            await this.renderWithAwait()
        else
            this.renderImmediate()
        return true
    }

    private renderImmediate() {
        window.requestAnimationFrame(this.renderModel.bind(this))
        this.resolver = () => { }
    }

    private async renderWithAwait() {
        await new Promise<void>((res, rej) => {
            window.requestAnimationFrame(this.renderModel.bind(this))
            this.resolver = res
        })
    }

    private renderModel(timeStamp: DOMHighResTimeStamp) {

        let deltaTime = timeStamp - this.lastFrameTimeMs
        this.lastFrameTimeMs = timeStamp

        this.needsRerendering = false
        if (deltaTime === 0) return

        if (deltaTime > 200) deltaTime = 16
        this.clearAndRenderBackgroundGrid()

        for (const [id, nodeData] of Object.entries(this.currentModel.getModel())) {
            nodeData.graphNode.update(deltaTime)
            nodeData.graphNode.render(this.drawContext)

            if (!nodeData.graphNode.isAnimationDone())
                this.needsRerendering = true
        }

        for (const [id, connData] of Object.entries(this.currentModel.getConnections())) {
            connData.update(deltaTime)
            connData.render(this.drawContext)

            if (!connData.isAnimationDone())
                this.needsRerendering = true
        }

        this.notifyRender()

        if (this.needsRerendering && deltaTime !== 0)
            window.requestAnimationFrame(this.renderModel.bind(this))
        else
            this.resolver()
    }


    //TODO: Implement this system later
    public onInterrupt() {
        /* Will terminate the currently running animation bit */
        ipcRenderer.on('RENDER_INTERRUPT', () => {
            // needs rerendering = false
            this.needsRerendering = false
            // call resolver
            this.resolver()

            // reset animators on conns/nodes
            for (const [id, nodeData] of Object.entries(this.currentModel.getModel()))
                nodeData.graphNode.resetUpdate()

            for (const [id, connData] of Object.entries(this.currentModel.getConnections()))
                connData.resetUpdate()
        })
    }

    private clearAndRenderBackgroundGrid() {

        const width = this.drawCanvas.width
        const height = this.drawCanvas.height
        this.drawContext.fillStyle = 'white'
        this.drawContext.rect(0, 0, width, height)
        this.drawContext.fill()

        if (!this.backgroundGridDraw) {
            return
        }

        /* Optimization so we don't recalculate static background each frame */
        if (!this.backgroundDataImage) {
            for (let x = this.bgGridSpacing[0]; x < width; x += this.bgGridSpacing[0])
                for (let y = this.bgGridSpacing[1]; y < height; y += this.bgGridSpacing[1]) {
                    const text = x.toString() + ',' + y.toString()
                    this.renderText([x, y], text)
                }

            for (let y = 0; y < height; y += this.bgGridSpacing[1])
                this.renderLine([0, y], [width, y])

            for (let x = 0; x < width; x += this.bgGridSpacing[0])
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

    public isBusyDrawing() { return this.needsRerendering }

    public onConfReload() {
        this.logger.log('Renderer will reload')
        this.backgroundDataImage = null
        this.bgGridSpacing = [
            Configuration.get().param('backgroundHsep') as number,
            Configuration.get().param('backgroundVsep') as number]
        this.backgroundGridDraw = Configuration.get().param('backgroundGridDraw') as boolean
    }

    public subscribeRendererListener(listener: IRendererListener) {
        if (this.listeners.indexOf(listener) !== -1) {
            this.logger.log('Trying to subscribe IRendererListener that is already subscribbed!', LoggerLevel.ERR)
            return false
        }

        this.listeners.push(listener)
        return true
    }

    public unsubscribeRendererListener(listener: IRendererListener) {
        const index = this.listeners.indexOf(listener)
        if (index === -1) {
            this.logger.log('Trying to unsubscribe IRendererListener that is not subscribbed!', LoggerLevel.ERR)
            return false
        }

        this.listeners.splice(index, 1)
        return true
    }

    private notifyRender() {
        this.listeners.forEach(r => r.onRendered(this.drawCanvas))
    }

}
