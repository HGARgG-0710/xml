import {
	StreamParser,
	TableParser,
	preserve,
	read,
	TokenSource,
	PredicateMap,
	miss,
	TypeMap
} from "@hgargg-0710/parsers.js"
import { XMLSubstring } from "./tokens.mjs"
import { XMLEntity } from "./../../entity/tokens.mjs"

const entityGate = TableParser(
	TypeMap(PredicateMap)(new Map([[XMLEntity, preserve]]), miss)
)

export function StringParser(input) {
	return [
		read((input) => !XMLEntity.is(input.curr()), TokenSource(XMLSubstring("")))(input)
			.value,
		...entityGate(input)
	]
}

export const xmlStringParser = TypeMap(PredicateMap)(
	new Map([[XMLEntity, preserve]]),
	StringParser
)

export const XMLStringParser = StreamParser(xmlStringParser)
