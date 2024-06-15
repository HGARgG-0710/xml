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
	XMLPrologTag
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
	PredicateMap
} from "@hgargg-0710/parsers.js"
import { XMLStringParser } from "./string/parser.mjs"

import { array, map, object, function as f } from "@hgargg-0710/one"
import { XMLEntity } from "../entity/tokens.mjs"
const { first, firstOut } = array
const { kv: mkv } = map
const { dekv: odekv } = object

const { trivialCompose, or } = f

// ! REFACTOR [put the stuff relating to the low-level of parsing somewhere else...];
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

export const [TagParser, SingleTagParser, PrologParser] = [0, 1, 2].map(
	(ending) => (input) => [tagName(input), ...tagDelim[ending](input)]
)

export function ClosingTagParser(input) {
	const name = tagName(input)
	skip(input)((input) => !ClBrack.is(input.curr()))
	return [name]
}

export const tagExtract = [XMLClosingTag, XMLTag, XMLSingleTag, XMLPrologTag].map(
	(TagType, i) =>
		function (parsedTag) {
			const name = first(parsedTag)
			const attrs = firstOut(parsedTag).reduce(
				(prev, curr) => ({ ...prev, [curr.value.name.value]: curr.value.value }),
				{}
			)
			return [
				TagType(
					i
						? {
								name,
								attrs
						  }
						: { name }
				)
			]
		}
)

// ! REFACTOR [give names to each parser...];
export const tagParser = PredicateMap(
	new Map([
		[XMLEntity.is, preserve],
		[OpSlBrack.is, trivialCompose(tagExtract[0], ClosingTagParser)],
		[
			OpBrack.is,
			function (input) {
				const sub = clBrackLimitStream(input)
				const single = ClSlBrack.is(input.curr())
				return tagExtract[1 + single](
					(single ? SingleTagParser : TagParser)(InputStream(sub))
				)
			}
		],
		[
			QOpBrack.is,
			trivialCompose(tagExtract[3], PrologParser, InputStream, prologBrackLimit)
		],
		[
			or(...textTypesArr.map((x) => x.is)),
			function (input, parser) {
				let last = null
				return [
					read(
						(input) => isText((last = input.curr())),
						TokenSource(XMLText(""))
					)(input).value,
					...(last ? parser(input) : [])
				]
			}
		],
		[
			Space.is,
			function (input, parser) {
				skipSpace(input)
				return parser(input)
			}
		]
	]),
	preserve
)

export const limitQuotes = odekv(
	mkv(
		new Map(
			["'", '"'].map((quote) => [
				quote,
				limit(
					(input) =>
						!Quote.is(input.curr()) || Token.value(input.curr()) !== quote
				)
			])
		)
	)
)

const delimHandler = TableParser(
	PredicateMap(
		new Map([
			[
				XMLSymbol.is,
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
