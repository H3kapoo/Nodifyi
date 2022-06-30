export const parsers = {
    /* example: a */
    String(argument: string): string {
        return argument
    },
    /* example: a,b */
    String2(argument: string): string[] {
        if (this.Stringv(argument).length === 2)
            return this.Stringv(argument)
        throw Error(`Argument type must be a string pair in: '${argument}' !`)
    },
    /* example: a,b,c,... */
    Stringv(argument: string): string[] {
        const splitted: string[] = argument.split(',')
        let result: string[] = []

        this.checkForTrailingComma(argument)

        splitted.forEach(el => result.push(el))
        return result
    },
    /* example: a|b,c,f|d,e|... */
    Stringvs(argument: string): string[][] {
        const splitted: string[] = argument.split('|')
        let result: string[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.Stringv(splitted[i]))
        return result
    },
    /* example: a,b|b,c|d,e|... */
    String2vs(argument: string): string[][] {
        const splitted: string[] = argument.split('|')
        let result: string[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.String2(splitted[i]))
        return result
    },
    /* example: 1 */
    AbsNumber(argument: string): number {
        if (this.AbsNumberv(argument).length === 1)
            return this.AbsNumberv(argument)[0]
        throw Error(`AbsNumber argument type doesn't accept multiple number values in: '${argument}' !`)
    },
    /* example: 1,2 */
    AbsNumber2(argument: string): number[] {
        if (this.AbsNumberv(argument).length === 2)
            return this.AbsNumberv(argument)
        throw Error(`Argument type must be a absolute number pair in: '${argument}' !`)
    },
    /* example: 1,2,3,... */
    AbsNumberv(argument: string): number[] {
        const splitted: string[] = argument.split(',')
        let result: number[] = []

        this.checkForTrailingComma(argument)

        splitted.forEach(el => {
            if (isNaN(Number(el)))
                throw Error(`Argument '${el}' is not a number in argument '${argument}' !`)
            if (Number(el) < 0)
                throw Error(`Argument '${el}' is not an absolute number in argument '${argument}' !`)
            result.push(Number(el))
        })
        return result
    },
    /* example: 1|2,3,5|3,2|... */
    AbsNumbervs(argument: string): number[][] {
        const splitted: string[] = argument.split('|')
        let result: number[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.AbsNumberv(splitted[i]))
        return result
    },
    /* example: 1,2|3,4|4,5|... */
    AbsNumber2vs(argument: string): number[][] {
        const splitted: string[] = argument.split('|')
        let result: number[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.AbsNumber2(splitted[i]))
        return result
    },
    /* example: -1 */
    Number(argument: string): number {
        if (this.Numberv(argument).length === 1)
            return this.Numberv(argument)[0]
        throw Error(`Number argument type doesn't accept multiple number values in: '${argument}' !`)
    },
    /* example: 1,-2 */
    Number2(argument: string): number[] {
        if (this.Numberv(argument).length === 2)
            return this.Numberv(argument)
        throw Error(`Argument type must be a number pair in: '${argument}' !`)
    },
    /* example: -1,2,3,... */
    Numberv(argument: string): number[] {
        const splitted: string[] = argument.split(',')
        let result: number[] = []

        this.checkForTrailingComma(argument)

        splitted.forEach(el => {
            if (isNaN(Number(el)))
                throw Error(`Argument '${el}' is not a number in argument '${argument}' !`)
            result.push(Number(el))
        })
        return result
    },
    /* example: 1|2,-3,5|-3,-2|... */
    Numbervs(argument: string): number[][] {
        const splitted: string[] = argument.split('|')
        let result: number[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.Numberv(splitted[i]))
        return result
    },
    /* example: 1,-2|3,-4|4,5|... */
    Number2vs(argument: string): number[][] {
        const splitted: string[] = argument.split('|')
        let result: number[][] = []

        for (let i = 0; i < splitted.length; i++)
            result.push(this.Number2(splitted[i]))
        return result
    },
    Boolean(argument: string): boolean {
        if (argument.trim() === 'true')
            return true
        if (argument.trim() === 'false')
            return false
        throw Error(`'${argument}' -> is not a boolean!`)
    },

    checkForTrailingComma(argument: string) {
        if (argument.length === 0)
            throw Error('Argument length is 0 for one of the options and that is invalid! ')

        if (argument[0] === ',' || argument[argument.length - 1] === ',')
            throw Error(`Trailing comma sign found and is invalid at argument: '${argument}' !`)
    }
}
