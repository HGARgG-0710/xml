// * The main library file

import { function as _f } from "@hgargg-0710/one"
import { XMLElementParser } from "./element.mjs"
import { XMLClosingTag, XMLTagParser, XMLText } from "./tag.mjs"
import { XMLCharTokenizer } from "./char.mjs"
import { XMLEntityParser } from "./entity/parser.mjs"
import { InputStream } from "@hgargg-0710/parsers.js"
import { XMLCommentParser } from "./comment/parser.mjs"

const { trivialCompose } = _f

export * as entity from "./entity.mjs"
export * as comment from "./comment.mjs"
export * as generator from "./generate.mjs"
export * as char from "./char.mjs"
export * as element from "./element.mjs"
export * as tag from "./tag.mjs"

export { default as generate } from "./generate.mjs"

export const parse = trivialCompose(
	XMLElementParser,
	InputStream,
	(output) =>
		output.map((x, i, arr) =>
			XMLText.is(x) && XMLClosingTag.is(arr[i + 1]) ? XMLText(x.value.trim()) : x
		),
	XMLTagParser,
	InputStream,
	XMLEntityParser,
	InputStream,
	XMLCommentParser,
	InputStream,
	XMLCharTokenizer
)
