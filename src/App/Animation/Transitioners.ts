import { Color, Vec2d } from "../types";

export enum Transitioners {
    position = 'position',
    color = 'color',
    elevation = 'elevation'
}

export enum Easers {
    linear = 'linear',
    easeIn = 'easeIn',
    easeOut = 'easeOut',
    easeInOut = 'easeInOut',
    easeInElastic = 'easeInElastic',
    easeOutElastic = 'easeOutElastic'
}

/* Note: transitioners look similar but doing it like this increases customizability */
export const transitioners: { [key in Transitioners]?: Function } = {
    [Transitioners.position]:
        function (startPos: Vec2d, endPos: Vec2d, t: number, easer: Easers = Easers.linear): Vec2d {
            t = easerFunctions[easer](t)
            return [startPos[0] + (endPos[0] - startPos[0]) * t,
            startPos[1] + (endPos[1] - startPos[1]) * t]
        },
    [Transitioners.elevation]:
        function (startPos: number, endPos: number, t: number, easer: Easers = Easers.linear): number {
            t = easerFunctions[easer](t)
            return startPos + (endPos - startPos) * t
        },
    [Transitioners.color]:
        function (startColor: Color, endColor: Color, t: number, easer: Easers = Easers.linear): Color {
            t = easerFunctions[easer](t)
            startColor = startColor.replace('#', '')
            endColor = endColor.replace('#', '')

            const color1c = [parseInt(startColor.substring(0, 2), 16),
            parseInt(startColor.substring(2, 4), 16),
            parseInt(startColor.substring(4, 6), 16),
            parseInt(startColor.substring(6, 8), 16)]

            const color2c = [parseInt(endColor.substring(0, 2), 16),
            parseInt(endColor.substring(2, 4), 16),
            parseInt(endColor.substring(4, 6), 16),
            parseInt(endColor.substring(6, 8), 16)]

            let result = color1c.slice()
            let res: string[] = []

            for (let i = 0; i < 4; i++) {
                result[i] = Math.round(result[i] + t * (color2c[i] - color1c[i]))
                res[i] = result[i].toString(16)
                if (res[i].length === 1)
                    res[i] = '0' + res[i]
            }
            return `#${res[0]}${res[1]}${res[2]}${res[3]}`
        }
}

const easerFunctions: { [key in Easers]?: Function } = {
    [Easers.linear]: function (t: number): number {
        return t
    },
    [Easers.easeIn]: function (t: number): number {
        return t * t * t
    },
    [Easers.easeOut]: function (t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    },
    [Easers.easeInOut]: function (t: number): number {
        return 1 - Math.pow(1 - t, 3)
    },
    [Easers.easeInElastic]: function (t: number): number {
        const c4 = (2 * Math.PI) / 3
        return t === 0
            ? 0
            : t === 1
                ? 1
                : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
    },
    [Easers.easeOutElastic]: function (t: number): number {
        const c4 = (2 * Math.PI) / 3

        return t === 0
            ? 0
            : t === 1
                ? 1
                : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
    }
}