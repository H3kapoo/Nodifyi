import { Logger } from "../../Logger/Logger"
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, rename, rmSync } from "fs"
import IRendererListener from "../Renderer/IRendererListener"
const { ipcRenderer } = require('electron')
const { dialog } = require('@electron/remote')
//@ts-ignore
const ffmpeg = require("fluent-ffmpeg");


/* Class handling the capture and exporting of gifs */
export default class GIFExporter implements IRendererListener {
    private logger = new Logger('GIFExporter')
    private isCapturingEnabled: boolean
    private skipFrames: number
    private frameCount: number
    private bufferData: string[]

    public initialize() {
        this.isCapturingEnabled = false
        this.bufferData = []
        this.skipFrames = 1
        this.frameCount = 0
        ipcRenderer.on('TOGGLE_CAPUTRE_GIF', () => this.handleCapture())
        return true
    }

    onRendered(canvas: HTMLCanvasElement) {
        if (this.isCapturingEnabled && (this.frameCount % this.skipFrames === 0))
            this.bufferData.push(canvas.toDataURL('image/png'))
        this.frameCount++
    }

    private async handleCapture() {

        /* toggle capturing state */
        this.isCapturingEnabled = !this.isCapturingEnabled

        if (this.isCapturingEnabled) {
            console.log("Capture ON")
            // invoke capture will be started window
        }
        else {
            console.log("Capture OFF, Processing..")
            // invoke gonna process window
        }

        if (!this.isCapturingEnabled)
            await this.process()
    }

    private async process() {
        const tempFolderPath = this.createTempFolder('temp')
        this.writeBufferToTempFolder(tempFolderPath)
        await this.processGif(tempFolderPath, 'test', 5)
        this.showSaveDialog(tempFolderPath)
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
                .inputOptions('-f image2')
                .on('end', function (stdout: any, stderr: any) {
                    console.log('Transcoding succeeded !')
                    ffmpeg(join(tempFolderPath, `mygif.mkv`))
                        .inputOptions('-y')
                        .outputOptions('-vf palettegen')
                        .on('end', function (stdout: any, stderr: any) {
                            console.log('Transcoding succeeded 2!')
                            ffmpeg(join(tempFolderPath, `mygif.mkv`))
                                .withOptions([
                                    `-i ${join(tempFolderPath, 'pallete.png')}`,
                                    `-filter_complex paletteuse`
                                ])
                                .inputOptions(`-r ${fps}`)
                                .on('end', function (stdout: any, stderr: any) {
                                    console.log('Transcoding succeeded 3!')
                                    res()
                                })
                                .output(join(tempFolderPath, 'output.gif')).run()
                        })
                        .output(join(tempFolderPath, 'pallete.png')).run()
                })
                .output(join(tempFolderPath, 'mygif.mkv')).run()
        })
    }

    private showSaveDialog(tempFolder: string) {
        dialog.showSaveDialog({}).then((result: any) => {
            let pathToSave = result.filePath.replace('.gif', '') + '.gif'
            rename(join(tempFolder, `output.gif`), pathToSave, (e) => {
                console.log(e)
            })
            rmSync(tempFolder, { recursive: true })
            console.log(pathToSave);
        }).catch((err: any) => { console.log(err) })
    }
}
