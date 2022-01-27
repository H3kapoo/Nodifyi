import { AnimationOptions, AnyObjectOptions, GraphNodeBaseOptions } from "../types";

export default class Animator {

    private animationDone: boolean
    private animationOptions: AnimationOptions
    private initialOptions: AnyObjectOptions
    private returnableOptions: AnyObjectOptions
    private currentDuration: number
    private totalDuration: number
    private t: number

    constructor(initialOptions: AnyObjectOptions, animationOptions: AnimationOptions) {
        this.animationOptions = animationOptions
        this.initialOptions = { ...initialOptions }
        this.returnableOptions = { ...initialOptions }
        this.totalDuration = this.animationOptions.duration ?? 0.1
        this.animationDone = false
        this.currentDuration = 0
        this.t = 0
    }

    public update(delta: number) {
        this.currentDuration += delta
        this.t = this.currentDuration / this.totalDuration

        if (this.t >= 1) {
            this.t = 1
            this.animationDone = true
            return this.transition()
        }
        return this.transition()
    }

    private transition(): AnyObjectOptions {

        for (const [animOpt, animArg] of Object.entries(this.animationOptions)) {
            if (animOpt === 'position') {
                const initialPos = this.initialOptions.position
                const finalPos = this.animationOptions.position
                const npx = (1 - this.t) * initialPos[0] + this.t * finalPos[0]
                const npy = (1 - this.t) * initialPos[1] + this.t * finalPos[1]
                this.returnableOptions.position = [npx, npy]
            }
            if (animOpt === 'color') {
                const initialPos = this.initialOptions.color
                const finalPos = this.animationOptions.color
                this.returnableOptions.color = this.interpolateColor(initialPos, finalPos, this.t)
            }
            if (animOpt === 'elevation') {
                const initialPos = this.initialOptions.elevation
                const finalPos = this.animationOptions.elevation
                const elev = (1 - this.t) * initialPos + this.t * finalPos
                this.returnableOptions.elevation = elev
            }
        }
        return this.returnableOptions
    }

    //TODO: Those should be extracted somewhere else
    private interpolateColor(color1: string, color2: string, factor: number) {
        color1 = color1.replace('#', '')
        color2 = color2.replace('#', '')

        const color1c = [parseInt(color1.substring(0, 2), 16),
        parseInt(color1.substring(2, 4), 16),
        parseInt(color1.substring(4, 6), 16),
        parseInt(color1.substring(6, 8), 16)]

        const color2c = [parseInt(color2.substring(0, 2), 16),
        parseInt(color2.substring(2, 4), 16),
        parseInt(color2.substring(4, 6), 16),
        parseInt(color2.substring(6, 8), 16)]

        let result = color1c.slice()
        let res: string[] = []

        for (let i = 0; i < 4; i++) {
            result[i] = Math.round(result[i] + factor * (color2c[i] - color1c[i]))
            res[i] = result[i].toString(16)
            if (res[i].length === 1)
                res[i] = '0' + res[i]
        }
        return `#${res[0]}${res[1]}${res[2]}${res[3]}`
    }

    public isAnimationDone() { return this.animationDone }
}
