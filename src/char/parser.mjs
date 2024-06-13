import { function as _function } from "@hgargg-0710/one"
import { PatternTokenizer, StringPattern } from "@hgargg-0710/parsers.js"
import { xmlCharTokens } from "./tokens.mjs"

const { trivialCompose } = _function

export const XMLCharTokenizer = PatternTokenizer(xmlCharTokens)
export default trivialCompose(XMLCharTokenizer, StringPattern)
