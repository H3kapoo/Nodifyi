import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";
import GraphModel from "../GraphModel/GraphModel";
const { dialog, getCurrentWindow } = require('@electron/remote')
import { createTransport } from 'nodemailer'
const { ipcRenderer } = require('electron')
import fs from 'fs'


export default class ShareManager {
    private logger = new Logger('ShareManager')

    private canvas: HTMLCanvasElement
    private graphModel: GraphModel
    private emailTargets: string[]
    private emailSenderEmail: string
    private emailSenderPass: string

    public initialize(graphModel: GraphModel, canvas: HTMLCanvasElement) {
        this.graphModel = graphModel
        this.canvas = canvas

        const pathToEmailList = Configuration.get().param('emailTargetsPath') as string
        if (pathToEmailList === "not_set")
            this.logger.log("'pathToEmailList' is not set. Won't try to load email list", LoggerLevel.WRN)
        else
            this.emailTargets = this.loadTargets(pathToEmailList)

        this.emailSenderEmail = Configuration.get().param('emailSenderEmail') as string
        this.emailSenderPass = Configuration.get().param('emailSenderPass') as string

        if (!this.emailTargets)
            this.logger.log("'emailTargets' is empty or null", LoggerLevel.WRN)
        if (this.emailSenderEmail === "not_set")
            this.logger.log("'emailSenderEmail' is not set", LoggerLevel.WRN)
        if (this.emailSenderPass === "not_set")
            this.logger.log("'emailSenderPass' is not set", LoggerLevel.WRN)

        ipcRenderer.on('SEND_MAIL', () => this.sendMail())
        this.logger.log('Module initialized!')

        return true
    }

    private sendMail() {
        const transport = createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ''
            }
        })

        const mailOptions = {
            from: 'Ceva from test',
            to: '',
            subject: 'ceva subject',
            text: 'ceva text',
            attachments: [
                {
                    filename: 'poza.png',
                    path: '/home/hekapoo/Documents/_Licence/nodify2/zzz.png'
                }]
        }

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                this.showDialogMsg('Could not send email:\n' + error)
            }
            else
                this.showDialogMsg('Email send successfully!')
        })

        this.showDialogMsg('Will try to send email!')
    }

    private loadTargets(path: string): string[] {
        let splitEmails: string[] = []
        try {
            const rawData = fs.readFileSync(path).toString()
            splitEmails = rawData.split('\n').filter(e => e.length !== 0)
        } catch (err) {
            this.logger.log(`Could not read email list at ${path} !`, LoggerLevel.ERR)
            return null
        }

        // verify its an email
        const regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)

        const validEmails = splitEmails.filter(e => {
            if (!regex.test(e))
                return false
            return true
        })

        if (splitEmails.length !== validEmails.length)
            this.logger.log(`'Some fetched emails failed the email regex!`, LoggerLevel.WRN)

        return validEmails.length !== 0 ? validEmails : null
    }

    private showDialogMsg(msg: string) {
        dialog.showMessageBoxSync(getCurrentWindow(), {
            title: 'Share Dialog',
            message: msg,
            buttons: ["OK"],
        })
    }
}