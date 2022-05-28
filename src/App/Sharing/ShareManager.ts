import { Logger, LoggerLevel } from "../../Logger/Logger";
import Configuration from "../Configuration/Configuration";
import IReloadable from "../Configuration/IReloadable";
import GraphModel from "../GraphModel/GraphModel";
const { dialog, getCurrentWindow } = require('@electron/remote')
import { createTransport } from 'nodemailer'
const { ipcRenderer } = require('electron')
import fs from 'fs'


export default class ShareManager implements IReloadable {
    private logger = new Logger('ShareManager')

    private canvas: HTMLCanvasElement
    private graphModel: GraphModel
    private emailTargets: string[]
    private emailSenderEmail: string
    private emailSenderPass: string
    private emailFromString: string
    private emailSubjectString: string
    private shallIncludeImg: boolean
    private shallIncludeProjFile: boolean

    public initialize(graphModel: GraphModel, canvas: HTMLCanvasElement) {
        this.graphModel = graphModel
        this.canvas = canvas
        this.onConfReload()

        ipcRenderer.on('SEND_MAIL', () => this.sendMail())
        Configuration.get().subscribeReloadable(this)
        this.logger.log('Module initialized!')
        return true
    }

    private sendMail() {
        const transport = createTransport({
            service: 'gmail',
            auth: {
                user: this.emailSenderEmail,
                pass: this.emailSenderPass
            }
        })

        if (!this.emailTargets || this.emailTargets.length === 0) {
            this.logger.log('No target emails to send to!')
            this.showDialogMsg('No target emails to send to!')
            return
        }

        let attachments = []
        if (this.shallIncludeImg) {
            const imgData = this.canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "")
            attachments.push({
                filename: 'generatedImage.png',
                content: imgData,
                encoding: 'base64'
            })
        }

        if (this.shallIncludeProjFile) {
            const projDatas = JSON.stringify(this.graphModel.getJson())
            attachments.push({
                filename: 'generatedProjData.nod',
                content: projDatas,
                contentType: 'text/plain'
            })
        }

        const mailOptions = {
            from: this.emailFromString,
            to: this.emailTargets,
            subject: this.emailSubjectString,
            attachments: attachments
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

        // verify it is a valid email
        const regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)

        const validEmails = splitEmails.filter(e => this.isEmailValid(e))

        if (splitEmails.length !== validEmails.length)
            this.logger.log(`'Some fetched emails failed the email regex!`, LoggerLevel.WRN)

        return validEmails.length !== 0 ? validEmails : null
    }

    private isEmailValid(email: string) {
        const regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        if (!regex.test(email))
            return false
        return true
    }

    private showDialogMsg(msg: string) {
        dialog.showMessageBoxSync(getCurrentWindow(), {
            title: 'Share Dialog',
            message: msg,
            buttons: ["OK"],
        })
    }

    public onConfReload(): void {
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

        if (!this.isEmailValid(this.emailSenderEmail))
            this.logger.log("'emailSenderEmail' is not a valid email", LoggerLevel.WRN)
        if (this.emailSenderPass === "not_set")
            this.logger.log("'emailSenderPass' is not set", LoggerLevel.WRN)

        this.emailFromString = Configuration.get().param('shareFrom') as string
        this.emailSubjectString = Configuration.get().param('shareSubject') as string

        if (this.emailFromString === "not_set") {
            this.logger.log("'emailFromString' is not set. Using defaults", LoggerLevel.WRN)
            this.emailFromString = 'NodifyApp'
        }

        if (this.emailSubjectString === "not_set") {
            this.logger.log("'emailSubjectString' is not set. Using defaults", LoggerLevel.WRN)
            this.emailSubjectString = 'NodifyApp - Subject Default'
        }
        this.shallIncludeImg = Configuration.get().param('shareImgCached') as boolean
        this.shallIncludeProjFile = Configuration.get().param('shareProjCached') as boolean
    }

    public onHardReload(): void { }
}