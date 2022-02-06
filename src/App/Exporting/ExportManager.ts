import { Logger, LoggerLevel } from "../../Logger/Logger";
import IReloadable from "../Configuration/IReloadable";
import Renderer from "../Renderer/Renderer";
import GIFExporter from "./GIFExporter";
import ImageExporter from "./ImageExporter";


export default class ExportManager implements IReloadable {
    private logger = new Logger('ExportManager')

    private gifExporter: GIFExporter
    private imageExporter: ImageExporter
    private renderer: Renderer
    private canvas: HTMLCanvasElement

    public initialize(renderer: Renderer, canvas: HTMLCanvasElement) {
        this.gifExporter = new GIFExporter()
        this.imageExporter = new ImageExporter()
        this.renderer = renderer
        this.canvas = canvas

        if (!this.gifExporter.initialize()) {
            this.logger.log('GIFExporter NOT initialized!', LoggerLevel.FATAL)
            return false
        }

        if (!this.imageExporter.initialize(this.canvas)) {
            this.logger.log('ImageExporter NOT initialized!', LoggerLevel.FATAL)
            return false
        }

        this.renderer.subscribeRendererListener(this.gifExporter)
        this.logger.log('Module initialized!')
        return true
    }

    onConfReload(): void {
        if (!this.gifExporter.initialize()) {
            this.logger.log('GIFExporter NOT initialized!', LoggerLevel.FATAL)
            return
        }

        if (!this.imageExporter.initialize(this.canvas)) {
            this.logger.log('ImageExporter NOT initialized!', LoggerLevel.FATAL)
            return
        }
        this.logger.log('Reloaded!')
    }
}