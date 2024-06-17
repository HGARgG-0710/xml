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

// ! REFACTOR THE '() => []' from 'parses.js'!
const entityGate = TableParser(
	PredicateMap(new Map([[XMLEntity.is, preserve]]), () => [])
)

export function StringParser(input) {
	return [
		read((input) => !XMLEntity.is(input.curr()), TokenSource(XMLSubstring("")))(input)
			.value,
		...entityGate(input)
	]
}

export const xmlStringParser = PredicateMap(
	new Map([[XMLEntity.is, preserve]]),
	StringParser
)

export const XMLStringParser = StreamParser(xmlStringParser)
