import {
	StreamParser,
	TableParser,
	preserve,
	read,
	TokenSource,
	PredicateMap
} from "@hgargg-0710/parsers.js"
import { XMLSubstring } from "./tokens.mjs"
import { XMLEntity } from "./../../entity/tokens.mjs"

export const xmlStringParser = PredicateMap(
	new Map([[XMLEntity.is, preserve]]),
	function (input) {
		return [
			read(
				(input) => !XMLEntity.is(input.curr()),
				TokenSource(XMLSubstring(""))
			)(input).value,
			...(XMLEntity.is(input.curr()) ? xmlStringTableParser(input) : [])
		]
	}
)

export const xmlStringTableParser = TableParser(xmlStringParser)
export const XMLStringParser = StreamParser(xmlStringParser)
