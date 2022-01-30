import { Logger } from "../../Logger/Logger"
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, rename, rmdirSync } from "fs"
import Renderer from "../Renderer/Renderer"
const { ipcRenderer } = require('electron')
const spawn = require('child_process').spawn
const { dialog, BrowserWindow, getCurrentWindow } = require('@electron/remote')

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
        console.log(tempFolder)
        // creates 'temp' folder if it doesn't exist
        if (!existsSync(tempFolder))
            mkdirSync(tempFolder)
        else {
            rmdirSync(tempFolder, { recursive: true })
            mkdirSync(tempFolder)
        }

        const buff = []
        for (let str of this.renderer.getBufferedStateImageData())
            buff.push(str.replace(/^data:image\/png;base64,/, ""))

        // convert states from renderer to PNG images
        let i = 0
        for (let data of buff)
            writeFileSync(join(tempFolder, `test${i++}.png`), data, 'base64')


        //TODO: Refactor
        this.runCommand('ffmpeg', `-f image2 -i test%d.png video.mkv`, () => {
            this.runCommand('ffmpeg', '-y -i video.mkv -vf palettegen palette.png', () => {
                this.runCommand('ffmpeg', '-i video.mkv -i palette.png -filter_complex paletteuse -r 10 output.gif', () => {
                    this.showSaveDialog(tempFolder)
                })
            })
        })
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

    private runCommand(cmd: any, args: any, onFinish: any) {
        try {
            const proc = spawn(cmd, args.split(' '), {
                cwd: join(__dirname, 'temp'),
            })
            proc.stderr.setEncoding("utf8")
            proc.stderr.on('data', (err: any) => console.log(err))
            proc.on('close', onFinish)
        } catch (ex) {
            console.log(ex);

        }

    }
}