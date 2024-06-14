import {
	BasicMap,
	StreamParser,
	TableParser,
	TokenMap,
	preserve,
	read,
	TokenSource
} from "@hgargg-0710/parsers.js"
import { XMLSubstring } from "./tokens.mjs"
import { XMLEntity } from "./../../entity/tokens.mjs"

export const xmlStringParser = TokenMap(BasicMap)(
	new Map([["entity", preserve]], function (input) {
		return [
			read(
				(input) => !XMLEntity.is(input.curr()),
				TokenSource(XMLSubstring(""))
			)(input).value,
			...(XMLEntity.is(input.curr()) ? xmlStringTableParser(input) : [])
		]
	})
)

export const xmlStringTableParser = TableParser(xmlStringParser)
export const XMLStringParser = StreamParser(xmlStringParser)
