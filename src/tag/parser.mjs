import {
	ClBrack,
	ClSlash,
	CommentBeginning,
	CommentEnding,
	EqualitySign,
	OpBrack,
	QuestionMark,
	Quote,
	Space,
	XMLSymbol
} from "../char/tokens.mjs"

import {
	XMLComment,
	XMLName,
	XMLText,
	XMLTag,
	XMLAttribute,
	XMLClosingTag,
	XMLSingleTag
} from "./tokens.mjs"

import {
	BasicMap,
	StreamParser,
	TokenMap,
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

// ! REFACTOR ALL OF THESE THINGS SOMEWHERE! [namely, the type-checks... - THE v0.2 of parsers.js ought to do that!];
// ^ The 'from-library' definitions also (a separete module? 'refactor.mjs?')
export const clBrackLimitStream = trivialCompose(
	InputStream,
	limit((input) => !ClBrack.is(input.curr()))
)
export const skipSpace = (input) => skip(input)((input) => Space.is(input.curr()))

export const CommentParser = StreamParser(
	TokenMap(BasicMap)(new Map(), function (input) {
		const _skip = skip(input)
		const comment = read(
			(input) => !CommentEnding.is(input.curr()),
			TokenSource(XMLComment(""))
		)(input).value
		input.next() // --
		_skip((input) => !ClBrack.is(input.curr()))
		return [comment]
	})
)

// TODO: ADD THIS MULT-BOOLEAN STRUCTURE TO v0.2 or parsers.js! [__Very__ useful - boolean-array-indexation];
const parserCache = [
	[false, false, false],
	[true, false, false],
	[false, true, false],
	[false, false, true]
].map(([closing, comment, prolog]) =>
	comment
		? CommentParser
		: trivialCompose((x) => [x], tagExtract, TagParser(closing, prolog))
)

const textTypesArr = [
	Quote,
	QuestionMark,
	XMLSymbol,
	ClSlash,
	CommentBeginning,
	CommentEnding,
	EqualitySign
]
const postTextTypesArr = textTypesArr.concat([Space])
const isText = (x) => postTextTypesArr.some((y) => y.is(x))

export const tagParser = PredicateMap(
	new Map(
		[
			[XMLEntity.is, preserve],
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
			],
			[
				OpBrack.is,
				function (input) {
					input.next() // <
					skipSpace(input)

					const [closing, comment, prolog] = [
						ClSlash,
						CommentBeginning,
						QuestionMark
					].map((x) => x.is(input.curr()))

					if (closing || comment || prolog) input.next()

					return parserCache[
						Math.max(...[closing, comment, prolog].map((x, i) => x * (1 + i)))
					](clBrackLimitStream(input))
				}
			]
		],
		preserve
	)
)

export const tagName = (input) =>
	read((input) => XMLSymbol.is(input.curr()), TokenSource(XMLName("")))(input).value
		.value

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

export const delimHandler = [ClSlash, QuestionMark].map((EndToken, isProlog) =>
	TableParser(
		PredicateMap(
			new Map([
				[
					EndToken.is,
					function (input) {
						return isProlog ? [] : [{ single: true }]
					}
				],
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
)

const tagDelim = [0, 1].map(
	(x) => (input) =>
		delimited(
			(input) => !ClBrack.is(input.curr()),
			(input) => Space.is(input.curr())
		)(input, delimHandler[x])
)

export function tagExtract(parsedTag) {
	const name = first(parsedTag)
	if (name.closing) return XMLClosingTag({ name: name.name })
	let isSingle = false
	const attrs = firstOut(parsedTag).reduce(
		(prev, curr) =>
			!(isSingle = isSingle || curr.single)
				? { ...prev, [curr.value.name.value]: curr.value.value }
				: prev,
		{}
	)
	return (isSingle ? XMLSingleTag : XMLTag)({ name, attrs })
}

export function TagParser(closing, prolog) {
	return StreamParser(
		TokenMap(BasicMap)(new Map(), function (input) {
			const _skip = skip(input)
			_skip((input) => !XMLSymbol.is(input.curr()))
			const name = tagName(input)
			if (!closing) return [name, ...tagDelim[+prolog](input)]
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
