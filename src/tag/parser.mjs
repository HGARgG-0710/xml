// ! REFACTOR!

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
	skip
} from "@hgargg-0710/parsers.js"

export const skipSpace = (input) =>
	skip(input)((input, i, j) => Token.type(input.curr()) === "space")

// ! REFACTOR ALL OF THESE THINGS SOMEWHERE!
const tagRead = read((input) => Token.type(input.curr()) === "clbrack", "")

// ? Refactor these expressions of 'Token.type'? [repeat QUITE a lot within the parser...];
export const xmlParser = TokenMap(BasicMap)(
	new Map([
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
					(x) => Token.type(input.next()) === x
				)

				const { name, attrs } = tagParser[closing | (comment << 1)](
					tagRead(input, (input) => [input.curr()])
				)

				return [Tag(name, attrs, closing, comment)]
			}
		],
		[
			"amp",
			function (input) {
				input.next() // &
				return [Entity(input.curr().value)]
			}
		],
		[
			"symbol",
			function (input) {
				const text = read((input) => Token.type(input.curr()) === "symbol")(input)
				return [Text(text)]
			}
		]
	])
)


const tagName = read((input) => Token.type(input.curr()) === "symbol")

// TODO: THIS DOESN'T WORK ! [need a different interface for this thing...];
const delimHandler = TableParser(
	TokenMap(BasicMap)(
		new Map([
			"symbol",
			function (input) {
				const _skip = skip(input)
				const attrName = XMLName(
					read((input) => Token.type(input.curr()) === "symbol", "")(input)
				)
				_skip((input) => Token.type(input.curr()) !== "eqsign")
				input.next()
				_skip((input) => Token.type(input.curr()) !== "quote")
				input.next()
				return [
					XMLAttribute(
						attrName,
						XMLString(
							read((input) => Token.type(input.curr()) !== "quote")(input)
						)
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
	TokenMap(BasicMap)(new Map([])),
	function (input) {
		const _skip = skip(input)
		const comment = read((input) => Token.type(input.curr()) !== "commentend")(input)
		input.next()
		_skip((input) => Token.type(input.curr()) !== "clbrack")
		return [XMLComment(comment)]
	}
)

// TODO: SPLIT INTO DIFFERENT FUNCTIONS! [instead of making one and THEN caching...];
export function TagParser(closing) {
	return StreamParser(
		TokenMap(BasicMap)(
			new Map([
				[
					"symbol",
					function (input) {
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
					}
				]
			])
		)
	)
}
