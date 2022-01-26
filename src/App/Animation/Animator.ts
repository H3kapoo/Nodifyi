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
        this.totalDuration = this.animationOptions.duration
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
        }
        return this.returnableOptions
    }

    public isAnimationDone() {

        return this.animationDone
    }
}