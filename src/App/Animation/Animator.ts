import { AnimationOptions, AnyObjectOptions } from "../types";
import { transitioners, Transitioners, Easers } from "./Transitioners";

export default class Animator {

    private animationDone: boolean
    private animationOptions: AnimationOptions
    private initialOptions: AnyObjectOptions
    private returnableOptions: AnyObjectOptions
    private currentDuration: number
    private totalDuration: number
    private easingFunc: Easers
    private t: number

    constructor(initialOptions: AnyObjectOptions, animationOptions: AnimationOptions) {
        this.animationOptions = animationOptions
        this.initialOptions = { ...initialOptions }
        this.returnableOptions = { ...initialOptions }
        this.easingFunc = animationOptions.easing || Easers.linear
        this.totalDuration = this.animationOptions.duration
        this.animationDone = false
        this.currentDuration = 0
        this.t = 0

        /* Assign default value in case of <=0 */
        if (!this.totalDuration || this.totalDuration < 0)
            this.totalDuration = 0.01

        /* Delete anim conf option, can't be transitioned */
        delete this.animationOptions.duration
        delete this.animationOptions.easing
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
        // getting here assumes that animationOptions only contains options
        // that have a transitioner defined
        for (const [animOpt, animArg] of Object.entries(this.animationOptions)) {
            const startVal = this.initialOptions[animOpt]
            const endVal = this.animationOptions[animOpt]
            this.returnableOptions[animOpt] =
                transitioners[animOpt as Transitioners](startVal, endVal, this.t, this.easingFunc)
        }
        return this.returnableOptions
    }

    public isAnimationDone() { return this.animationDone }
}
