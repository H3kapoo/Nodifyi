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
    }
}
