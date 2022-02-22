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

    public validateNodeOptions(options: AnyObjectOptions, nodeType: NodeType = NodeType.Circle): boolean {
        const validity = this.generalValidity.nodes[nodeType]

        // check required opts
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

    public validateConnOptions(options: AnyObjectOptions): boolean {
        const validity = this.generalValidity.conns['standardConn']

        // check required opts
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
    public getValidity(): jointValidity {
        const validity: jointValidity = {
            nodes: {
                [NodeType.Circle]: {
                    required: {
                        position: ValidOptionsTypes.AbsNumber2,
                    },
                    other: {
                        color: ValidOptionsTypes.String,
                        indexing: ValidOptionsTypes.Boolean,
                    },
                    animable: {
                        position: ValidOptionsTypes.AbsNumber2,
                        color: ValidOptionsTypes.String,
                        duration: ValidOptionsTypes.AbsNumber
                    }
                }
                // can add validity for another node type..
            },
            conns: {
                'standardConn': {
                    required: {},
                    other: {
                        elevation: ValidOptionsTypes.AbsNumber,
                        color: ValidOptionsTypes.String,
                        text: ValidOptionsTypes.String
                    },
                    animable: {
                        duration: ValidOptionsTypes.AbsNumber,
                        elevation: ValidOptionsTypes.Number,
                        color: ValidOptionsTypes.String,
                    }
                }
            }
        }
        return validity
    }

}