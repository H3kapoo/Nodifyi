import ScrollBooster from "scrollbooster";
import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";


enum CanvasDimensions {
    MIN_WIDTH = 300,
    MIN_HEIGHT = 300,
    MAX_WIDTH = 2000,
    MAX_HEIGHT = 2000
}

/** Handles the tab containing the working canvas */
export default class CanvasTab implements IReloadable {
    private logger = new Logger('TabsLoader')

    private canvasDOM: HTMLCanvasElement
    private canvasContext: CanvasRenderingContext2D

    public initialize() {
        this.canvasDOM = document.getElementById('canvas') as HTMLCanvasElement

        if (!this.canvasDOM) {
            this.logger.log(`Failed to grab canvasDOM with id 'canvas'!`, LoggerLevel.ERR)
            return false
        }

        this.canvasContext = this.canvasDOM.getContext('2d', { alpha: false })
        const canvasHeight = Configuration.get().param('canvasHeight') as number
        const canvasWidth = Configuration.get().param('canvasWidth') as number

        if (!canvasWidth || !canvasHeight) {
            this.logger.log('Failed to fetch width or height of canvas!', LoggerLevel.ERR)
            return false
        }

        if (canvasHeight < CanvasDimensions.MIN_HEIGHT || canvasWidth < CanvasDimensions.MIN_WIDTH)
            this.logger.log('Canvas dimensions are bellow minimal requirements! (300x300)', LoggerLevel.WRN)
        if (canvasHeight > CanvasDimensions.MAX_HEIGHT || canvasWidth > CanvasDimensions.MAX_HEIGHT)
            this.logger.log('Canvas dimensions are above maximum requirements! (2kx2k)', LoggerLevel.WRN)

        this.canvasDOM.width = canvasWidth
        this.canvasDOM.height = canvasHeight

        /* Scrolling with drag inside canvas */
        /* It has been initialized here because its seems like everytime the canvas size changes, ScrollBooster
           freezes and doesn't know what to do if initialized in the index.ts at early startup*/
        new ScrollBooster({
            viewport: document.querySelector('#canvas-container-tab'),
            scrollMode: 'transform',
        })

        return true
    }

    public onConfReload(): void {
        this.logger.log('Canvas tab will reload opts')
        const canvasHeight = Configuration.get().param('canvasHeight') as number
        const canvasWidth = Configuration.get().param('canvasWidth') as number

        if (!canvasWidth || !canvasHeight) {
            this.logger.log('Failed to fetch width or height of canvas!', LoggerLevel.ERR)
        }

        if (canvasHeight < CanvasDimensions.MIN_HEIGHT || canvasWidth < CanvasDimensions.MIN_WIDTH)
            this.logger.log('Canvas dimensions are bellow minimal requirements! (300x300)', LoggerLevel.WRN)
        if (canvasHeight > CanvasDimensions.MAX_HEIGHT || canvasWidth > CanvasDimensions.MAX_HEIGHT)
            this.logger.log('Canvas dimensions are above maximum requirements! (2kx2k)', LoggerLevel.WRN)

        this.canvasDOM.width = canvasWidth
        this.canvasDOM.height = canvasHeight
    }
    public getCanvas() { return this.canvasDOM }
}