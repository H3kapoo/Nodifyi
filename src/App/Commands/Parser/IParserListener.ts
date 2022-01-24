import { ParsedInput } from "../../types";

export default interface IParserListener {
    onInputParsed(parsedInput: ParsedInput[]): void
}