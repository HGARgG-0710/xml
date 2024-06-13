import { XMLElement } from "./tokens.mjs"
import {
	BasicMap,
	StreamParser,
	TableParser,
	Token,
	TokenMap,
	delimited
} from "@hgargg-0710/parsers.js"

// ! AGAIN, the 'no-delim' delimited! [parsers.js v0.2];
const limitEnd = (input, name) =>
	delimited(
		(input) =>
			Token.type(input.curr()) !== "tag" ||
			!Token.value(input.curr()).closing ||
			Token.value(input.curr()) !== name,
		() => false
	)(input, elementHandler)

export const xmlParser = TokenMap(BasicMap)(
	new Map([
		[
			"tag",
			function (input) {
				const tag = input.curr().value
				const { name, closing } = tag
				if (closing) return XMLElement(name, {}, [])
				const { attrs } = input.next().value
				return XMLElement(name, attrs, limitEnd(input, name))
			}
		]
	]),
	function (input) {
		return [input.curr()]
	}
)

export const elementHandler = TableParser(xmlParser)

export const XMLElementParser = StreamParser(xmlParser)
