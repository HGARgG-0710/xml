// * The general abstractions related to the XML format processing
// ! refactor this! [the repeating values in similarly-typed maps...];

// ! PROBLEM - this DOES NOT allow for 'prolog' usage! (the <?xml>) tag
// ! PROBLEM - a design issue - the thing is SUPPOSED TO BE WORKING INSTEAD with an additiona layer!
// * In short, the whole structure of the parser ought to look something like:
// 		% 1. Characters
// 		% 2. 'opbrack', 'clbrack', ...
// 		% 3. 'tag', 'text', 'entity'
// 		% [UNDONE YET] 4. `element`
// ! For this - RESTRUCTURE THE PARSER [as it is: A. incomplete; B. buggy; C. un-refactored]

import { CommentParser, EqualitySign } from "./tag.mjs"

import {
	BasicMap,
	InputStream,
	PatternTokenizer,
	PatternValidator,
	RegExpMap,
	SourceGenerator,
	StreamParser,
	StreamValidator,
	StringSource,
	TableParser,
	Token,
	TokenMap,
	regex,
	skip
} from "@hgargg-0710/parsers.js"
import { TagParser, tagExtract } from "./tag.mjs"

const { anything, global, space } = regex

export const [
	OpBrack,
	ClBrack,
	CLSlash,
	Quote,
	CommentBeginning,
	CommentEnding,
	Ampersand,
	Space
] = [
	["opbrack", "<"],
	["clbrack", ">"],
	["clslash", "/"],
	["quote", '"'],
	["commentbeg", "!--"],
	["commentend", "--"],
	["amp", "&"],
	["space", ""]
].map((pair) => () => Token(...pair))
export const [Text, XMLSymbol, Entity] = ["text", "symbol", "entity"].map(
	(type) => (value) => Token(type, value)
)
export const Tag = (name, attrs, closing = false, comment = false) =>
	Token("tag", { name, attrs, closing, comment })

export const xmlTokens = RegExpMap(
	new Map(
		[
			[/</, OpBrack],
			[/>/, ClBrack],
			[/\//, CLSlash],
			[/=/, EqualitySign],
			[/"/, Quote],
			[/!--/, CommentBeginning],
			[/--/, CommentEnding],
			[space(), Space],
			[anything(), XMLSymbol]
		].map((x) => [global(x[0]), x[1]])
	)
)

const tagRead = read((input) => Token.type(input.curr()) === "clbrack", "")

export const tagParser = [
	[false, false],
	[true, false],
	[false, true]
].map(([closing, comment]) =>
	(
		(f) => (x) =>
			tagExtract(f(x))
	)(comment ? CommentParser : TagParser(closing))
)

export const skipSpace = (input) =>
	skip(input)((input, i, j) => Token.type(input.curr()) === "space")

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
		["quote", function () {}],
		["symbol", function () {}]
	])
)

export const xmlTokenValidator = RegExpMap(
	new Map(
		[
			[/</, function () {}],
			[/>/, function () {}],
			[/\//, function () {}],
			[/=/, function () {}],
			[/"/, function () {}],
			[/!--/, function () {}],
			[/--/, function () {}],
			[anything(), function () {}]
		].map((x) => [global(x[0]), x[1]])
	)
)

export const xmlValidator = TokenMap(BasicMap)(
	new Map([
		["opbrack", function () {}],
		["amp", function () {}],
		["quote", function () {}],
		["symbol", function () {}]
	])
)

export const xmlGenerator = TokenMap()

// * A tree for 'TreeStream' iteration by 'XMLGenerator'
// ^ Transforms the 'AST' returned by parser to the '.children-.index' form
export function XMLTree() {}

export const tokenize = PatternTokenizer(xmlTokens)
export const generate = SourceGenerator(xmlGenerator)
export const parse = StreamParser(xmlParser)
export const tokenValidate = PatternValidator(xmlValidator)
export const validate = StreamValidator(xmlValidator)

export const tableParser = TableParser(xmlParser)

export const XMLGenerate = (AST) => generate(TreeStream(XMLTree(AST)), StringSource())

export default function XMLParse(xml) {
	return parse(InputStream(tokenize(InputStream(xml))))
}
