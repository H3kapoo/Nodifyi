import { Logger, LoggerLevel } from "../../../Logger/Logger";
import { ValidConnOptions, ValidNodeOptions, ValidAnimableConfOptions } from "../Validation/ValidOptions";
import { NodeType } from "../../GraphModel/GraphNodeType"
import { ValidOptionsTypes } from "../Validation/ValidOptionsTypes";
import { AnyObjectOptions } from "../../types";
import { parsers } from "./ValidOptionsParser";
import TerminalTabOutputHelper from "../../Tabs/TerminalTabOutputHelper";
import { Transitioners } from "../../Animation/Transitioners";

interface nodeROAObject {
    required: { [key in ValidNodeOptions]?: ValidOptionsTypes }
    other: { [key in ValidNodeOptions]?: ValidOptionsTypes }
    animable: { [key in Transitioners | ValidAnimableConfOptions]?: ValidOptionsTypes }
}

interface connROAObject {
    required: { [key in ValidConnOptions]?: ValidOptionsTypes }
    other: { [key in ValidConnOptions]?: ValidOptionsTypes }
    animable: { [key in Transitioners | ValidAnimableConfOptions]?: ValidOptionsTypes }
}

interface jointValidity {
    nodes: { [key in NodeType]?: nodeROAObject },
    conns: { 'standardConn': connROAObject }
}


export default class InputValidator {
    private logger = new Logger('InternalValidator')
    private terminalHelper = new TerminalTabOutputHelper()
    private generalValidity: jointValidity

    constructor() {
        this.terminalHelper.setOutputContext(this.logger.getContext())
        this.generalValidity = this.getValidity()
    }

    public validateNodeOptions(options: AnyObjectOptions, nodeType: NodeType, isCreating: boolean = true): boolean {
        const validity = this.generalValidity.nodes[nodeType]

        // check required opts
        // we shall check this options only at creation
        if (isCreating) {
            for (const [reqOptName, reqOptType] of Object.entries(validity.required)) {
                if (!options[reqOptName]) {
                    this.logger.log(`Required internal value '${reqOptName}' not present on node!`, LoggerLevel.WRN)
                    this.terminalHelper.printErr(`Required internal value '${reqOptName}' not present on node!`)
                    return false
                }

                try {
                    //@ts-ignore
                    parsers[reqOptType](options[reqOptName])
                }
                catch (ex) {
                    //@ts-ignore
                    this.logger.log(ex.message, LoggerLevel.WRN)
                    //@ts-ignore
                    this.terminalHelper.printErr(`'${reqOptName}' -> ` + ex.message + ' Check command logic!')
                    return false
                }
            }
        }
        // check non requried opts
        for (const [reqOptName, reqOptType] of Object.entries(validity.other)) {
            if (!options[reqOptName])
                continue
            try {
                //@ts-ignore
                parsers[reqOptType](options[reqOptName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${reqOptName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // check animations also
        if (options.animation) {
            for (const [optName, optType] of Object.entries(validity.animable)) {
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

    public validateConnOptions(options: AnyObjectOptions, isCreating: boolean = true): boolean {
        const validity = this.generalValidity.conns['standardConn']

        // check required opts
        if (isCreating) {
            for (const [reqOptName, reqOptType] of Object.entries(validity.required)) {
                if (!options[reqOptName]) {
                    this.logger.log(`Required internal value '${reqOptName}' not present on connection!`, LoggerLevel.WRN)
                    this.terminalHelper.printErr(`Required internal value '${reqOptName}' not present on connection!`)
                    return false
                }

                try {
                    //@ts-ignore
                    parsers[reqOptType](options[reqOptName])
                }
                catch (ex) {
                    //@ts-ignore
                    this.logger.log(ex.message, LoggerLevel.WRN)
                    //@ts-ignore
                    this.terminalHelper.printErr(`'${reqOptName}' -> ` + ex.message + ' Check command logic!')
                    return false
                }
            }
        }
        // check non requried opts
        for (const [reqOptName, reqOptType] of Object.entries(validity.other)) {
            if (!options[reqOptName])
                continue
            try {
                //@ts-ignore
                parsers[reqOptType](options[reqOptName])
            }
            catch (ex) {
                //@ts-ignore
                this.logger.log(ex.message, LoggerLevel.WRN)
                //@ts-ignore
                this.terminalHelper.printErr(`'${reqOptName}' -> ` + ex.message + ' Check command logic!')
                return false
            }
        }

        // check animations also
        if (options.animation) {
            for (const [optName, optType] of Object.entries(validity.animable)) {
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

    // Valid opts for nodes/conns are defined here!
    public getValidity(): jointValidity {
        const validity: jointValidity = {
            nodes: {
                [NodeType.Circle]: {
                    required: {
                        position: ValidOptionsTypes.Number2,
                    },
                    other: {
                        color: ValidOptionsTypes.Color,
                        text: ValidOptionsTypes.String,
                        startConn: ValidOptionsTypes.Boolean,
                        startConnAngle: ValidOptionsTypes.Number,
                        startConnLength: ValidOptionsTypes.AbsNumber,
                        selfConnect: ValidOptionsTypes.Boolean,
                        selfArrow: ValidOptionsTypes.Boolean,
                        selfText: ValidOptionsTypes.String,
                        selfAngle: ValidOptionsTypes.Number,
                        selfElevation: ValidOptionsTypes.AbsNumber,
                        selfApertureAngle: ValidOptionsTypes.Number,
                        selfTextElevation: ValidOptionsTypes.Number,
                        selfFixedTextRotation: ValidOptionsTypes.Boolean
                    },
                    animable: {
                        position: ValidOptionsTypes.Number2,
                        color: ValidOptionsTypes.Color,
                        duration: ValidOptionsTypes.AbsNumber,
                        easing: ValidOptionsTypes.Easing
                    }
                }
                // can add validity for another node type..
            },
            conns: {
                'standardConn': {
                    required: {},
                    other: {
                        elevation: ValidOptionsTypes.AbsNumber,
                        color: ValidOptionsTypes.Color,
                        directed: ValidOptionsTypes.Boolean,
                        text: ValidOptionsTypes.String,
                        fixedTextRotation: ValidOptionsTypes.Boolean,
                        textColor: ValidOptionsTypes.ColorNoAlpha,
                        textElevation: ValidOptionsTypes.Number
                    },
                    animable: {
                        duration: ValidOptionsTypes.AbsNumber,
                        elevation: ValidOptionsTypes.Number,
                        color: ValidOptionsTypes.Color,
                        easing: ValidOptionsTypes.Easing
                    }
                }
            }
        }
        return validity
    }
}