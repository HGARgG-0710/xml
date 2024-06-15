import { XMLElement } from "./tokens.mjs"
import {
	InputStream,
	PredicateMap,
	StreamParser,
	TableParser,
	Token,
	limit,
	preserve,
	transform
} from "@hgargg-0710/parsers.js"

import { function as f } from "@hgargg-0710/one"
import { XMLClosingTag, XMLSingleTag, XMLTag } from "../tag/tokens.mjs"

const { or, trivialCompose } = f

export const xmlParser = PredicateMap(
	new Map([
		[
			or(...[XMLTag, XMLSingleTag].map((x) => x.is)),
			function (input) {
				const { name, attrs } = input.curr().value
				if (XMLSingleTag.is(input.curr())) return [XMLElement(name, attrs)]
				input.next()
				return [XMLElement(name, attrs, limitEnd(input, name))]
			}
		],
		[XMLClosingTag.is, () => []]
	]),
	preserve
)

export const elementHandler = trivialCompose(
	transform(TableParser(xmlParser)),
	InputStream
)

const limitEnd = (input, name) =>
	elementHandler(
		limit(
			(input) =>
				!XMLClosingTag.is(input.curr()) || Token.value(input.curr()).name !== name
		)(input)
	)

export const XMLElementParser = StreamParser(xmlParser)
