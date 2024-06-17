import { Ampersand } from "../char.mjs"
import { XMLEntity } from "./tokens.mjs"
import {
	StreamParser,
	TokenSource,
	preserve,
	read,
	Token,
	PredicateMap,
	TypeMap
} from "@hgargg-0710/parsers.js"

export function EntityParser(input) {
	input.next() // &
	return [
		read(
			(input) => Token.value(input.curr()) !== ";",
			TokenSource(XMLEntity(""))
		)(input).value
	]
}

export const XMLEntityParser = StreamParser(
	TypeMap(PredicateMap)(new Map([[Ampersand, EntityParser]]), preserve)
)
