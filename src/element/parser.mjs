import { XMLElement } from "./tokens.mjs"
import {
	BasicMap,
	InputStream,
	StreamParser,
	TableParser,
	Token,
	TokenMap,
	limit,
	preserve,
	transform
} from "@hgargg-0710/parsers.js"

import { function as f } from "@hgargg-0710/one"
import { _XMLTag } from "../tag/tokens.mjs"
const { trivialCompose } = f

export const elementHandler = trivialCompose(
	transform(TableParser(xmlParser)),
	InputStream
)

const limitEnd = (input, name) =>
	elementHandler(
		limit(
			(input) =>
				!_XMLTag.is(input.curr()) ||
				!Token.value(input.curr()).closing ||
				Token.value(input.curr()) !== name
		)(input)
	)

export const xmlParser = TokenMap(BasicMap)(
	new Map([
		[
			"tag",
			function (input) {
				const tag = input.curr().value
				const { name, closing } = tag
				if (closing) return [XMLElement(name, {}, [])]
				const { attrs } = input.next().value
				return [XMLElement(name, attrs, limitEnd(input, name))]
			}
		]
	]),
	preserve
)

export const XMLElementParser = StreamParser(xmlParser)
