import { XMLComment, XMLName, XMLText, XMLTag, XMLAttribute } from "./tokens.mjs"

import { array, map, object } from "@hgargg-0710/one"
const { firstOut } = array
const { kv: mkv } = map
const { dekv: odekv } = object

import {
	ClBrack,
	ClSlash,
	CommentBeginning,
	CommentEnding,
	EqualitySign,
	Quote,
	Space,
	XMLSymbol
} from "../char/tokens.mjs"

import {
	BasicMap,
	StreamParser,
	TokenMap,
	Token,
	skip,
	read,
	delimited,
	TableParser,
	skip,
	InputStream,
	setPredicate,
	TokenSource,
	limit,
	preserve
} from "@hgargg-0710/parsers.js"
import { XMLStringParser } from "./string/parser.mjs"

import { function as f } from "@hgargg-0710/one"

const { trivialCompose } = f

// ! REFACTOR ALL OF THESE THINGS SOMEWHERE! [namely, the type-checks... - THE v0.2 of parsers.js ought to do that!];
// ^ The 'from-library' definitions also (a separete module? 'refactor.mjs?')
export const clBrackLimitStream = trivialCompose(
	InputStream,
	limit((input) => !ClBrack.is(input.curr()))
)
export const skipSpace = (input) => skip(input)((input) => !Space.is(input.curr()))

const parserCache = [
	[false, false],
	[true, false],
	[false, true]
].map(([closing, comment]) =>
	trivialCompose(tagExtract, comment ? CommentParser : TagParser(closing))
)

const isText = (x) => [XMLSymbol, Space].some((y) => y.is(x))

// ! ADD TO 'parsers.js' v0.2! (generalize, like with TokenMap)
// * const ValueMap = BasicMap.extend(Token.value)

export const tagParser = TokenMap(BasicMap)(
	new Map(
		[
			[
				"symbol",
				function (input) {
					return [
						read(
							(input) => isText(input.curr()),
							TokenSource(XMLText(""))
						)(input).value
					]
				}
			],
			[
				"space",
				function (input) {
					skipSpace(input)
					return []
				}
			],
			[
				"opbrack",
				function (input) {
					input.next() // <
					skipSpace(input)

					const [closing, comment] = [ClSlash, CommentBeginning].map((x) =>
						x.is(input.curr())
					)
					if (closing || comment) input.next()

					const { name, attrs } = parserCache[closing | (comment << 1)](
						clBrackLimitStream(input)
					)
					return [XMLTag(name, attrs, closing, comment)]
				}
			]
		],
		preserve
	)
)

const tagName = (input) =>
	read((input) => XMLSymbol.is(input.curr()), TokenSource(XMLName("")))(input)

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
	TokenMap(BasicMap)(
		new Map([
			"symbol",
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
					XMLAttribute(
						attrName,
						XMLStringParser(limitQuotes[input.next().value](input))
					)
				]
			}
		])
	)
)

const tagDelim = (input) =>
	delimited(
		(input) => ClBrack.is(input.curr()),
		(input) => Space.is(input.curr())
	)(input, delimHandler)

export function tagExtract(parsedTag) {
	const name = first(parsedTag)
	if (name.closing) return name.name
	const attrs = firstOut(parsedTag).reduce(
		(prev, curr) => ({ ...prev, [curr.value.name]: curr.value.value }),
		{}
	)
	return { name, attrs }
}

export const CommentParser = StreamParser(
	TokenMap(BasicMap)(new Map()),
	function (input) {
		const _skip = skip(input)
		const comment = read(
			(input) => !CommentEnding.is(input.curr()),
			TokenSource(XMLComment(""))
		)(input).value
		input.next() // --
		_skip((input) => !ClBrack.is(input.curr()))
		return [comment]
	}
)

export function TagParser(closing) {
	return StreamParser(
		TokenMap(BasicMap)(new Map(), function (input) {
			const _skip = skip(input)
			_skip((input) => !XMLSymbol.is(input.curr()))
			const name = XMLName(tagName(input))
			if (!closing) return [name, ...tagDelim(input)]

			_skip((input) => !ClBrack.is(input.curr()))
			return [
				{
					closing,
					name
				}
			]
		})
	)
}

export const XMLTagParser = StreamParser(tagParser)
