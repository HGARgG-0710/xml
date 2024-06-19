import { XMLElement } from "./tokens.mjs"
import {
	InputStream,
	PredicateMap,
	StreamParser,
	TableParser,
	Token,
	limit,
	miss,
	preserve,
	transform
} from "@hgargg-0710/parsers.js"

import { function as f } from "@hgargg-0710/one"
import { XMLClosingTag, XMLSingleTag, XMLTag } from "../tag/tokens.mjs"

const { or, trivialCompose } = f

export function ElementParser(input) {
	const { name, attrs } = input.curr().value
	if (XMLSingleTag.is(input.curr())) return [XMLElement(name, attrs)]
	input.next()
	return [XMLElement(name, attrs, limitEnd(input, name))]
}

export const xmlParser = PredicateMap(
	new Map([
		[or(...[XMLTag, XMLSingleTag].map((x) => x.is)), ElementParser],
		[XMLClosingTag.is, miss]
	]),
	preserve
)

// ? Add these two to the 'parsers.js'? [this is a VERY frequent task whenever parsing recursive expressions...]; 
// % hypothetical signature [note THIS IS WITHOUT THE 'elementHandler'! JUST the 'limit']: 1. inflation (inflation predicate); 2. deflation (deflation predicate)
const elementHandler = trivialCompose(transform(TableParser(xmlParser)), InputStream)

const limitEnd = (input, name) => {
	let depth = 1
	const depthInflate = (x) => x && (depth += x)
	const depthDeflate = (x) => !x || (depth -= x)
	return elementHandler(
		limit(
			(input) =>
				depthInflate(
					XMLTag.is(input.curr()) && Token.value(input.curr()).name === name
				) ||
				depthDeflate(
					XMLClosingTag.is(input.curr()) &&
						Token.value(input.curr()).name === name
				)
		)(input)
	)
}

export const XMLElementParser = StreamParser(xmlParser)
