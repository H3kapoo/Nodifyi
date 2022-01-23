import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import CircleNode from "../GraphModel/CircleNode";
import GraphModel from "../GraphModel/GraphModel";
import IAppStartup from "../IAppStartup";
import { GraphNodeSet } from "../types";
import * as utils from './RendererUtils'


/** Class that handles the rendering of the canvas element*/
export default class Renderer implements IAppStartup {
    private logger = new Logger('Renderer')

    private currentModel: GraphModel
    private drawContext: CanvasRenderingContext2D
    private drawCanvas: HTMLCanvasElement
    private isCurrentlyDrawing: boolean
    private bgGridSpacing: number
    private backgroundDataImage: HTMLImageElement

    public initialize() {
        this.bgGridSpacing = Configuration.get().param('backgroundGridSpacing') as number

        if (!this.bgGridSpacing) {
            this.logger.log('Failed to fetch backgroundGridSpacing of canvas!', LoggerLevel.ERR)
            return false
        }
        return true
    }


    public render() {
        if (!this.currentModel) {
            this.logger.log('There is not graph model subscribbed!', LoggerLevel.ERR)
            return false
        }

        if (!this.drawCanvas) {
            this.logger.log('There is not canvas subscribbed!', LoggerLevel.ERR)
            return false
        }

        this.clearAndRenderBackgroundGrid()
        this.renderModel()
        return true
    }

    private renderModel() {
        const n1 = new CircleNode({
            position: [300, 400],
            color: 'black',
            radius: 30
        })
        const n2 = new CircleNode({
            position: [600, 400],
            color: 'black',
            radius: 30
        })
        this.currentModel.addNode(n1)
        this.currentModel.addNode(n2)
        this.currentModel.addConnection(n1.getUniqueId(), n2.getUniqueId(), {
            color: 'black',
            elevation: 100
        })

        for (const [id, nodeData] of Object.entries(this.currentModel.getModel())) {
            nodeData.graphNode.toggleHeadsUpIndexing()
            nodeData.graphNode.render(this.drawContext)
        }
        for (const [id, connData] of Object.entries(this.currentModel.getConnections())) {
            connData.render(this.drawContext)
        }
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
                    utils.renderText(this.drawContext, [x, y], text)
                }

            for (let y = 0; y < height; y += this.bgGridSpacing)
                utils.renderLine(this.drawContext, [0, y], [width, y])

            for (let x = 0; x < width; x += this.bgGridSpacing)
                utils.renderLine(this.drawContext, [x, 0], [x, height])

            this.backgroundDataImage = new Image
            this.backgroundDataImage.src = this.drawCanvas.toDataURL('image/jpeg')
        }
        this.drawContext.drawImage(this.backgroundDataImage, 0, 0)
    }

    public subscribeGraphModel(currentModel: GraphModel) { this.currentModel = currentModel }

    public subscribeCanvas(canvas: HTMLCanvasElement) { this.drawCanvas = canvas; this.drawContext = canvas.getContext('2d') }

    public getModuleName(): string { return this.logger.getContext() }
}
