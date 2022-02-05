import { Logger } from "../../Logger/Logger"
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, rename, rmdirSync } from "fs"
import Renderer from "../Renderer/Renderer"
const { ipcRenderer } = require('electron')
const { dialog } = require('@electron/remote')
//@ts-ignore
const ffmpeg = require("fluent-ffmpeg");


/* Class handling the capture and exporting of gifs */
export default class GIFExporter {
    private logger = new Logger('GIFExporter')
    private renderer: Renderer
    private isCapturing: boolean

    public initialize(renderer: Renderer) {
        this.logger.log('Module initialized!')
        this.isCapturing = false
        this.renderer = renderer
        ipcRenderer.on('TOGGLE_CAPUTRE_GIF', () => this.handleCapture())
        return true
    }

    private async handleCapture() {
        /* toggle capturing state */
        this.isCapturing = !this.isCapturing

        if (this.isCapturing) {
            this.logger.log('Capturing ON')
            this.renderer.beginBufferStateImageData()
        }
        else {
            this.logger.log('Capturing OFF. Processing..')
            this.renderer.endBufferStateImageData()
            await this.processFFMPEG()
        }
    }

    private async processFFMPEG() {
        const tempFolder = join(__dirname, 'temp')

        if (!existsSync(tempFolder))
            mkdirSync(tempFolder)
        else {
            rmdirSync(tempFolder, { recursive: true })
            mkdirSync(tempFolder)
        }

        const buff = []
        for (let str of this.renderer.getBufferedStateImageData())
            buff.push(str.replace(/^data:image\/png;base64,/, ""))
        buff.push(this.renderer.getCurrentStateImageData().replace(/^data:image\/png;base64,/, ""))


        let i = 0
        for (let data of buff) {
            const p = join(tempFolder, `test${i++}.png`)
            writeFileSync(p, data, 'base64')
        }

        ffmpeg(`${tempFolder}/test%d.png`)
            .inputOptions('-f image2')
            .on('end', function (stdout: any, stderr: any) {
                console.log('Transcoding succeeded !')
                ffmpeg(`mygif.mkv`)
                    .inputOptions('-y')
                    .outputOptions('-vf palettegen')
                    .on('end', function (stdout: any, stderr: any) {
                        console.log('Transcoding succeeded 2!')

                        ffmpeg(`mygif.mkv`)
                            .withOptions([
                                `-i pallete.png`,
                                `-filter_complex paletteuse`
                            ])
                            .inputOptions('-r 5')
                            .on('end', function (stdout: any, stderr: any) {
                                console.log('Transcoding succeeded 3!')
                            })
                            .output('mygif.gif').run()
                    })
                    .output('pallete.png').run()
            })
            .output('mygif.mkv').run()
    }

    private showSaveDialog(tempFolder: string) {
        dialog.showSaveDialog({}).then((result: any) => {
            let pathToSave = result.filePath.replace('.gif', '') + '.gif'
            rename(join(tempFolder, `output.gif`), pathToSave, (e) => {
                console.log(e)
            })
            rmdirSync(tempFolder, { recursive: true })
            console.log(pathToSave);

        }).catch((err: any) => { console.log(err) })
    }
}
