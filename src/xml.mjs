// * The main library file

import { function as _f } from "@hgargg-0710/one"
import { XMLElementParser } from "./element.mjs"
import { XMLTagParser } from "./tag.mjs"
import { XMLCharTokenizer } from "./char.mjs"
import { XMLEntityParser } from "./entity/parser.mjs"
import { InputStream } from "@hgargg-0710/parsers.js"

const { trivialCompose } = _f

export * as generator from "./generate.mjs"
export * as char from "./char.mjs"
export * as element from "./element.mjs"
export * as tag from "./tag.mjs"
export { default as generate } from "./generate.mjs"

export const parse = trivialCompose(
	// XMLElementParser,
	// InputStream,
	XMLTagParser,
	InputStream,
	XMLEntityParser,
	InputStream,
	XMLCharTokenizer
)
