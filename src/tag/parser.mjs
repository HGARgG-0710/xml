import {
	ClBrack,
	ClSlBrack,
	EqualitySign,
	OpBrack,
	OpSlBrack,
	QClBrack,
	QOpBrack,
	Quote,
	Space,
	XMLSymbol
} from "../char/tokens.mjs"

import {
	XMLName,
	XMLText,
	XMLTag,
	XMLAttribute,
	XMLClosingTag,
	XMLSingleTag,
	XMLProlog
} from "./tokens.mjs"

import {
	StreamParser,
	Token,
	read,
	delimited,
	TableParser,
	skip,
	InputStream,
	TokenSource,
	limit,
	preserve,
	PredicateMap,
	TypeMap
} from "@hgargg-0710/parsers.js"
import { XMLStringParser } from "./string/parser.mjs"
import { XMLEntity } from "../entity/tokens.mjs"

import { array, map, function as f } from "@hgargg-0710/one"
const { first, firstOut } = array
const { toObject } = map
const { trivialCompose, or, cache } = f

const clBrackLimitStream = limit(
	(input) => !ClSlBrack.is(input.curr()) && !ClBrack.is(input.curr())
)
const prologBrackLimit = limit((input) => !QClBrack.is(input.curr()))
const skipSpace = (input) => skip(input)((input) => Space.is(input.curr()))

const tagName = (input) => {
	skip(input)((input) => !XMLSymbol.is(input.curr()))
	return read((input) => XMLSymbol.is(input.curr()), TokenSource(XMLName("")))(input)
		.value.value
}

const textTypesArr = [Quote, XMLSymbol, EqualitySign]
const postTextTypesArr = textTypesArr.concat([Space])
const isText = (x) => postTextTypesArr.some((y) => y.is(x))

const tagDelim = [ClBrack, ClSlBrack, QClBrack].map(
	(EndToken) => (input) =>
		delimited(
			(input) => !EndToken.is(input.curr()),
			(input) => Space.is(input.curr())
		)(input, delimHandler)
)

export const [TagArrayParser, SingleTagArrayParser, PrologArrayParser] = [0, 1, 2].map(
	(ending) => (input) => [tagName(input), ...tagDelim[ending](input)]
)

export function ClosingTagArrayParser(input) {
	const name = tagName(input)
	skip(input)((input) => !ClBrack.is(input.curr()))
	return [name]
}

export function tagExtract(parsedTag) {
	const name = first(parsedTag)
	const attrs = firstOut(parsedTag).reduce(
		(prev, curr) => ({ ...prev, [curr.value.name.value]: curr.value.value }),
		{}
	)
	return {
		name,
		attrs
	}
}

const OpenTag = [false, true].map((isSingle) =>
	trivialCompose(
		isSingle ? XMLSingleTag : XMLTag,
		tagExtract,
		isSingle ? SingleTagArrayParser : TagArrayParser,
		InputStream
	)
)

export const ClosingTagParser = trivialCompose(
	(x) => [x],
	XMLClosingTag,
	({ name }) => ({ name }),
	tagExtract,
	ClosingTagArrayParser
)

export function TextParser(input, parser) {
	let last = null
	return [
		read((input) => isText((last = input.curr())), TokenSource(XMLText("")))(input)
			.value,
		...(last ? parser(input) : [])
	]
}

export function SpaceParser(input, parser) {
	skipSpace(input)
	return parser(input)
}

export function TagParser(input) {
	const sub = clBrackLimitStream(input)
	return [OpenTag[+ClSlBrack.is(input.curr())](sub)]
}

export const PrologParser = trivialCompose(
	(x) => [x],
	XMLProlog,
	tagExtract,
	PrologArrayParser,
	InputStream,
	prologBrackLimit
)

export const tagParser = PredicateMap(
	new Map([
		[
			XMLEntity.is,
			function (input, parser) {
				const entity = input.next()
				return [entity].concat(
					Space.is(input.curr()) ? TextParser(input, parser) : parser(input)
				)
			}
		],
		[OpSlBrack.is, ClosingTagParser],
		[OpBrack.is, TagParser],
		[QOpBrack.is, PrologParser],
		[or(...textTypesArr.map((x) => x.is)), TextParser],
		[Space.is, SpaceParser]
	]),
	preserve
)

const limitQuotes = toObject(
	cache(
		(quote) =>
			limit(
				(input) => !Quote.is(input.curr()) || Token.value(input.curr()) !== quote
			),
		["'", '"']
	)
)

const delimHandler = TableParser(
	TypeMap(PredicateMap)(
		new Map([
			[
				XMLSymbol,
				function (input) {
					const _skip = skip(input)

					const attrName = read(
						(input) => XMLSymbol.is(input.curr()),
						TokenSource(XMLName(""))
					)(input).value

					_skip((input) => !EqualitySign.is(input.curr()))
					input.next()
					_skip((input) => !Quote.is(input.curr()))
					return [
						XMLAttribute({
							name: attrName,
							value: XMLStringParser(
								InputStream(limitQuotes[input.next().value](input))
							)
						})
					]
				}
			]
		])
	)
)

export const XMLTagParser = StreamParser(tagParser)
