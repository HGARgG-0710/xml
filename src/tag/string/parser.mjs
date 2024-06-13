import {
	BasicMap,
	StreamParser,
	TableParser,
	Token,
	TokenMap,
	read
} from "@hgargg-0710/parsers.js"
import { XMLSubstring } from "./tokens.mjs"
import { TokenSource } from "../tag/types.mjs"

export const xmlStringParser = TokenMap(BasicMap)(
	new Map(
		[
			[
				"entity",
				function (input) {
					return [input.curr()]
				}
			]
		],
		function (input) {
			return [
				read(
					(input) => Token.type(input.curr()) !== "entity",
					TokenSource(XMLSubstring(""))
				)(input).value,
				...(Token.type(input.curr()) === "entity"
					? xmlStringTableParser(input)
					: [])
			]
		}
	)
)

export const xmlStringTableParser = TableParser(xmlStringParser)
export const XMLStringParser = StreamParser(xmlStringParser)
