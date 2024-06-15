import { Ampersand } from "../char.mjs"
import { XMLEntity } from "./tokens.mjs"
import {
	StreamParser,
	TokenSource,
	preserve,
	read,
	Token,
	PredicateMap
} from "@hgargg-0710/parsers.js"

export const entityMap = PredicateMap(
	new Map([
		[
			Ampersand.is,
			function (input) {
				input.next() // &
				return [
					read(
						(input) => Token.value(input.curr()) !== ";",
						TokenSource(XMLEntity(""))
					)(input).value
				]
			}
		]
	]),
	preserve
)

export const XMLEntityParser = StreamParser(entityMap)
