// * First-level tokens

import { regex } from "@hgargg-0710/parsers.js"

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

export const XMLSymbol = (value) => Token("symbol", value)

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
