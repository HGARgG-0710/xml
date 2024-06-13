// * The general abstractions related to the XML format processing
// ! refactor this! [the repeating values in similarly-typed maps...];

import { function as _f } from "@hgargg-0710/one"
import { XMLElementParser } from "./element.mjs"
import { XMLTagParser } from "./tag.mjs"
import { XMLCharTokenizer } from "./char.mjs"
const { trivialCompose } = _f

export * as generate from "./generate.mjs"
export * as char from "./char.mjs"
export * as element from "./element.mjs"
export * as tag from "./tag.mjs"
export { default as generate } from "./generate.mjs"

export const parse = trivialCompose(XMLElementParser, XMLTagParser, XMLCharTokenizer)

// ! MAKE into an EXPORT! [supposed to be doing what it says... - 'basic'/'full' check...]
// export const validate = StreamValidator(xmlValidator)
