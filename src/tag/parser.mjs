import {
	XMLComment,
	XMLName,
	XMLText,
	XMLTag,
	XMLEntity,
	XMLAttribute,
	XMLString
} from "./tokens.mjs"

import { array } from "@hgargg-0710/one"
const { firstOut } = array

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
	InputStream
} from "@hgargg-0710/parsers.js"
import { TokenSource } from "./types.mjs"
import { trivialCompose } from "@hgargg-0710/one/src/functions.mjs"

// ! ADD TO THE 'parsers.js' v0.2! [useful for making sub-streams... - GENERALIZE, make a separate function (optimization + simplified interface), not just an alias of 'delimited'...];
// * NOTE: this doesn't 'accumulate' like the 'read', instead limiting...;
const clBrackLimitStream = (input) =>
	delimited(
		(input) => Token.type(input.curr()) !== "clbrack",
		() => false
	)(input, (input) => [input.curr()])

// ! REFACTOR ALL OF THESE THINGS SOMEWHERE! [namely, the type-checks... - THE v0.2 of parsers.js ought to do that!];
export const skipSpace = (input) =>
	skip(input)((input, i, j) => Token.type(input.curr()) === "space")

const parserCache = [
	[false, false],
	[true, false],
	[false, true]
].map(([closing, comment]) =>
	trivialCompose(tagExtract, comment ? CommentParser : TagParser(closing))
)

// ! ADD TO 'parsers.js' v0.2! (generalize, like with TokenMap)
// * const ValueMap = BasicMap.extend(Token.value)

// ? Refactor these expressions of 'Token.type'? [repeat QUITE a lot within the parser...];
// ! REPLACE ALL '.includes' with '.has' of a 'Set'!
export const tagParser = TokenMap(BasicMap)(
	new Map([
		[
			"symbol",
			function (input) {
				return [
					read(
						(input) => ["symbol", "space"].includes(Token.type(input.curr())),
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

				const [closing, comment] = ["clslash", "commentbeg"].map(
					(x) => Token.type(input.curr()) === x
				)
				if (closing || comment) input.next()

				const { name, attrs } = parserCache[closing | (comment << 1)](
					InputStream(clBrackLimitStream(input))
				)
				return [XMLTag(name, attrs, closing, comment)]
			}
		],
		[
			"amp",
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
	])
)

const tagName = (input) =>
	read(
		(input) => Token.type(input.curr()) === "symbol",
		TokenSource(XMLName(""))
	)(input)

const delimHandler = TableParser(
	TokenMap(BasicMap)(
		new Map([
			"symbol",
			function (input) {
				const _skip = skip(input)
				const attrName = read(
					(input) => Token.type(input.curr()) === "symbol",
					TokenSource(XMLName(""))
				)(input).value

				_skip((input) => Token.type(input.curr()) !== "eqsign")
				input.next()

				_skip((input) => Token.type(input.curr()) !== "quote")
				const quote = input.next().value

				return [
					XMLAttribute(
						attrName,
						read(
							(input) =>
								Token.type(input.curr()) !== "quote" ||
								Token.value(input.curr()) !== quote,
							TokenSource(XMLString(""))
						)(input).value
					)
				]
			}
		])
	)
)

const tagDelim = (input) =>
	delimited(
		(input) => Token.type(input.curr()) === "clbrack",
		(input) => Token.type(input.curr()) === "space"
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
			(input) => Token.type(input.curr()) !== "commentend",
			TokenSource(XMLComment(""))
		)(input).value
		input.next() // --
		_skip((input) => Token.type(input.curr()) !== "clbrack")
		return [comment]
	}
)

export function TagParser(closing) {
	return StreamParser(
		TokenMap(BasicMap)(new Map(), function (input) {
			const _skip = skip(input)
			_skip((input) => Token.type(input.curr()) !== "symbol")
			const name = XMLName(tagName(input))
			if (!closing) return [name, ...tagDelim(input)]
			_skip((input) => Token.type(input.curr()) !== "clbrack")
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
