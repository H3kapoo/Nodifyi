import { Logger, LoggerLevel } from "../../Logger/Logger"
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, rename, rmSync } from "fs"
import IRendererListener from "../Renderer/IRendererListener"
import Configuration from "../Configuration/Configuration"
const { ipcRenderer } = require('electron')
const { dialog, getCurrentWindow } = require('@electron/remote')
//@ts-ignore
const ffmpeg = require("fluent-ffmpeg");


/* Class handling the capture and exporting of gifs */
export default class GIFExporter implements IRendererListener {
    private logger = new Logger('GIFExporter')
    private isCapturingEnabled: boolean
    private frameSkip: number
    private gifDelay: number
    private frameCount: number
    private bufferData: string[]

    constructor() {
        ipcRenderer.on('TOGGLE_CAPUTRE_GIF', () => this.handleCapture())
    }

    public initialize() {
        this.isCapturingEnabled = false
        this.bufferData = []
        this.gifDelay = Configuration.get().param('gif_delay') as number
        this.frameSkip = Configuration.get().param('frame_skip') as number
        this.frameCount = 0
        document.getElementById('canvas-container-tab').style.border = 'none'

        if (!this.gifDelay) {
            this.logger.log('Empty gifDelay parameter in configuration!', LoggerLevel.FATAL)
            return false
        }

        if (!this.frameSkip) {
            this.logger.log('Empty frameSkip parameter in configuration!', LoggerLevel.FATAL)
            return false
        }

        return true
    }

    onRendered(canvas: HTMLCanvasElement) {
        if (this.isCapturingEnabled && (this.frameCount % this.frameSkip === 0))
            this.bufferData.push(canvas.toDataURL('image/png'))
        this.frameCount++
    }

    //TODO: Fix reloading when capturing is on
    private async handleCapture() {
        /* toggle capturing state */
        this.isCapturingEnabled = !this.isCapturingEnabled
        console.log('ce', this.isCapturingEnabled);

        if (this.isCapturingEnabled) {
            const response = dialog.showMessageBoxSync(getCurrentWindow(), {
                title: 'GIF Capture',
                message: "GIF capturing will be enabled. Any command from now on will be recorded!",
                buttons: ["Ok", "Cancel"],
            })

            if (response === 1) // CANCEL
            {
                this.logger.log('Abort Gif capture..', LoggerLevel.DBG)
                this.isCapturingEnabled = false
                return
            }

            this.logger.log('GIF capture ON', LoggerLevel.DBG)
            document.getElementById('canvas-container-tab').style.border = 'rgb(255, 61, 61) 5px solid'
        } else {
            this.logger.log('GIF capture OFF. Processing..', LoggerLevel.DBG)
            if (!this.bufferData.length) {
                this.logger.log('No data collected. Gracefully exiting.', LoggerLevel.DBG)
                document.getElementById('canvas-container-tab').style.border = 'none'
                return
            }
            ipcRenderer.send('GIF_PROCESSING_OPEN', {})
            await this.process()
            document.getElementById('canvas-container-tab').style.border = 'none'
            this.frameCount = 0
        }
    }

    private async process() {
        const tempFolderPath = this.createTempFolder('temp')
        this.writeBufferToTempFolder(tempFolderPath)
        await this.processGif(tempFolderPath, 'test', 1000 / this.gifDelay)
        ipcRenderer.send('GIF_PROCESSING_CLOSE', {})
        this.showSaveDialog(tempFolderPath)
        this.bufferData = []
    }

    private createTempFolder(tempFolderName: string): string {
        const tempFolder = join(__dirname, tempFolderName)

        if (!existsSync(tempFolder))
            mkdirSync(tempFolder)
        else {
            rmSync(tempFolder, { recursive: true })
            mkdirSync(tempFolder)
        }
        return tempFolder
    }

    private writeBufferToTempFolder(tempFolderPath: string) {
        const buff = []
        for (let str of this.bufferData)
            buff.push(str.replace(/^data:image\/png;base64,/, ""))

        for (const [index, data] of buff.entries())
            writeFileSync(join(tempFolderPath, `test${index}.png`), data, 'base64')
    }

    private async processGif(tempFolderPath: string, imagesPrefix: string, fps: number) {
        return new Promise<void>((res, rej) => {
            ffmpeg(`${tempFolderPath}/${imagesPrefix}%d.png`)
                .inputOptions('-f image2').on('end', (stdout: any, stderr: any) => {
                    this.toProcessWindow('Processing image stream.. (1/3)')
                    ffmpeg(join(tempFolderPath, `mygif.mkv`)).inputOptions('-y')
                        .outputOptions('-vf palettegen')
                        .on('end', (stdout: any, stderr: any) => {
                            this.toProcessWindow('Generating pallete.. (2/3)')
                            ffmpeg(join(tempFolderPath, `mygif.mkv`))
                                .withOptions([
                                    `-i ${join(tempFolderPath, 'pallete.png')}`,
                                    `-filter_complex paletteuse`
                                ]).inputOptions(`-r ${fps}`)
                                .on('end', (stdout: any, stderr: any) => {
                                    this.toProcessWindow('Writing GIF.. (3/3)')
                                    res()
                                }).output(join(tempFolderPath, 'output.gif')).run()
                        }).output(join(tempFolderPath, 'pallete.png')).run()
                }).output(join(tempFolderPath, 'mygif.mkv')).run()
        })
    }

    private showSaveDialog(tempFolder: string) {
        dialog.showSaveDialog(getCurrentWindow(), {
            title: 'Save GIF'
        }).then((result: any) => {
            let pathToSave = result.filePath.replace('.gif', '') + '.gif'
            if (pathToSave === '.gif') {
                this.logger.log('GIF saving aborted, will clean temp..', LoggerLevel.DBG)
                rmSync(tempFolder, { recursive: true })
                return
            }
            rename(join(tempFolder, `output.gif`), pathToSave, (e) => console.log(e))
            rmSync(tempFolder, { recursive: true })
        }).catch((err: any) => { console.log(err) })
    }

    private toProcessWindow(msg: string) {
        this.logger.log(msg, LoggerLevel.DBG);
        ipcRenderer.send('GIF_PROCESSING_MESSAGE', { message: msg })
    }
}
