import { Logger, LoggerLevel } from "../../../Logger/Logger";
import { ValidConnOptions, ValidCircleNodeOptions } from "../Validation/ValidOptions";
import { NodeType } from "../../GraphModel/GraphNodeType"
import { ValidOptionsTypes } from "../Validation/ValidOptionsTypes";
import { AnyObjectOptions } from "../../types";
import { parsers } from "./ValidOptionsParser";
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper";

export default class InputValidator {
    logger = new Logger('InternalValidator')
    terminalHelper = new TerminalTabOutputHelper()

    constructor() {
        this.terminalHelper.setOutputContext(this.logger.getContext())
    }

    public validateNodeOptions(options: AnyObjectOptions, nodeType: NodeType): boolean {
        const validity = this.getValidity().nodes[nodeType]

        // for required
        for (const required of validity.required) {
            const optName: string = required[0]
            const optType: string = required[1]

            if (!options[optName]) {
                this.logger.log(`Required internal value '${optName}' not present on node!`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Required internal value '${optName}' not present on node!`)
                return false
            }

            try {
                //@ts-ignore
                parsers[optType](options[optName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // for the rest
        for (const other of validity.other) {
            const optName: string = other[0]
            const optType: string = other[1]

            if (!options[optName])
                continue

            try {
                //@ts-ignore
                parsers[optType](options[optName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // validate anim
        if (options.animation) {
            const validityCombined = validity.required.concat(validity.other)

            // for required
            for (const opt of validityCombined) {
                const optName: string = opt[0]
                const optType: string = opt[1]

                if (!options.animation[optName])
                    continue

                try {
                    //@ts-ignore
                    parsers[optType](options.animation[optName])
                }
                catch (ex) {
                    //@ts-ignore
                    this.logger.log(ex.message, LoggerLevel.WRN)
                    //@ts-ignore
                    this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                    return false
                }
            }
        }
        return true
    }

    public validateConnOptions(options: AnyObjectOptions): boolean {
        const validity = this.getValidity().conns['connection']

        // for required
        for (const required of validity.required) {
            const optName: string = required[0]
            const optType: string = required[1]

            if (!options[optName]) {
                this.logger.log(`Required internal value '${optName}' not present on connection!`, LoggerLevel.WRN)
                this.terminalHelper.printErr(`Required internal value '${optName}' not present on connection!`)
                return false
            }

            try {
                //@ts-ignore
                parsers[optType](options[optName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // for the rest
        for (const other of validity.other) {
            const optName: string = other[0]
            const optType: string = other[1]

            if (!options[optName])
                continue

            try {
                //@ts-ignore
                parsers[optType](options[optName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // validate anim
        if (options.animation) {
            const validityCombined = validity.required.concat(validity.other)

            // for required
            for (const opt of validityCombined) {
                const optName: string = opt[0]
                const optType: string = opt[1]

                if (!options.animation[optName])
                    continue

                try {
                    //@ts-ignore
                    parsers[optType](options.animation[optName])
                }
                catch (ex) {
                    //@ts-ignore
                    this.logger.log(ex.message, LoggerLevel.WRN)
                    //@ts-ignore
                    this.terminalHelper.printErr(`'${optName}' -> ` + ex.message + ' Check command logic!')
                    return false
                }
            }
        }
        return true
    }

    private getValidity() {
        type ObjectOption = [
            ValidConnOptions | ValidCircleNodeOptions, ValidOptionsTypes]

        interface allValidityObject {
            nodes: { [key: string]: validityObject },
            conns: { [key: string]: validityObject }
        }

        interface validityObject {
            required: ObjectOption[],
            other: ObjectOption[]
        }

        const allValidityObject: allValidityObject = {
            nodes: {},
            conns: {}
        }

        allValidityObject.nodes[NodeType.Circle] = {
            required: [
                [ValidCircleNodeOptions.position, ValidOptionsTypes.AbsNumber2]],
            other: [
                [ValidCircleNodeOptions.color, ValidOptionsTypes.String],
                [ValidCircleNodeOptions.duration, ValidOptionsTypes.AbsNumber],
                [ValidCircleNodeOptions.animation, ValidOptionsTypes.Object]
            ]
        }

        allValidityObject.conns['connection'] = {
            required: [],
            other: [
                [ValidCircleNodeOptions.color, ValidOptionsTypes.String],
                [ValidCircleNodeOptions.duration, ValidOptionsTypes.AbsNumber]
            ]
        }

        return allValidityObject
    }
}