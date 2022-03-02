import { Easers } from "../../Animation/Transitioners"

export const parsers = {
    /* example: a */
    String(argument: string) {
        if (typeof argument !== 'string')
            throw Error(`'${argument}' must be a string!`)
    },
    /* example: 1 */
    AbsNumber(argument: number) {
        if (typeof argument === 'number') {
            if (Array.isArray(argument))
                throw Error(`'${argument}' cannot be an array!`)
        }
        else
            throw Error(`'${argument}' is not a number!`)
        if (argument < 0)
            throw Error(`'${argument}' cannot be negative!`)
    },
    /* example: 1,2 */
    AbsNumber2(argument: number[]) {
        if (!Array.isArray(argument))
            throw Error(`'${argument}' should be an array!`)
        if (argument.length !== 2)
            throw Error(`${argument} must be a pair of two numbers!`)
        if (typeof argument[0] !== 'number' || typeof argument[1] !== 'number')
            throw Error(`'${argument}' should be an array of two numbers!`)
        if (argument[0] < 0 || argument[1] < 0)
            throw Error(`'${argument}' cannot conatin negative numbers!`)
    },
    /* example: -1 */
    Number(argument: number) {
        if (typeof argument === 'number') {
            if (Array.isArray(argument))
                throw Error(`'${argument}' cannot be an array!`)
        }
        else
            throw Error(`'${argument}' is not a number!`)
    },
    /* example: 1,-2 */
    Number2(argument: number[]) {
        if (!Array.isArray(argument))
            throw Error(`'${argument}' should be an array!`)
        if (argument.length !== 2)
            throw Error(`${argument} must be a pair of two numbers!`)
        if (typeof argument[0] !== 'number' || typeof argument[1] !== 'number')
            throw Error(`'${argument}' should be an array of two numbers!`)
    },
    Object(argument: Object) {
        if (typeof argument !== 'object')
            throw Error(`${argument} is not an object!`)
    },
    Boolean(argument: boolean) {
        if (typeof argument !== 'boolean')
            throw Error(`${argument} is not a bool!`)
    },
    /* example: #abcfffaa */
    Color(argument: string) {
        if (typeof argument !== 'string')
            throw Error(`'${argument}' must be hexadecimal!`)

        if (argument[0] !== '#')
            throw Error(`'${argument}' must start with a '#'!`)
        if (argument.length !== 9)
            throw Error(`'${argument}' after # sign must be of length 8!`)

        if (!(/#[0-9A-Fa-f]{8}/g.test(argument)))
            throw Error(`'${argument}' must be hexadecimal!`)
    },
    /* example: #abcfff */
    ColorNoAlpha(argument: string) {
        if (typeof argument !== 'string')
            throw Error(`'${argument}' must be hexadecimal!`)

        if (argument[0] !== '#')
            throw Error(`'${argument}' must start with a '#'!`)
        if (argument.length !== 7)
            throw Error(`'${argument}' after # sign must be of length 6!`)

        if (!(/#[0-9A-Fa-f]{6}/g.test(argument)))
            throw Error(`'${argument}' must be hexadecimal!`)
    },
    /* example: #EaseIn EaseOut etc */
    Easing(argument: string) {
        if (typeof argument !== 'string')
            throw Error(`'${argument}' must be a string!`)
        argument = argument.trim()

        //@ts-ignore
        if (!Object.values(Easers).includes(argument))
            throw Error(`'${argument}' is not a valid easing function name!`)
    },
}
