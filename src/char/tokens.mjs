// * First-level tokens

import { regex, Token, RegExpMap } from "@hgargg-0710/parsers.js"

const { global, space, or } = regex

// ^ IDEA [for the `parsers.js` library]: create a TokenType function (would create a function (type) => { (value) => ({type, value}); is: (x) => x.type === type})
// * would fit well here...

export const [
	OpBrack,
	ClBrack,
	ClSlash,
	CommentBeginning,
	CommentEnding,
	Ampersand,
	Space,
	EqualitySign
] = [
	"opbrack",
	"clbrack",
	"clslash",
	"commentbeg",
	"commentend",
	"amp",
	"space",
	"eqsign"
].map((type) => () => Token(type, null))

export const [XMLSymbol, Quote] = ["symbol", "quote"].map(
	(type) => (value) => Token(type, value)
)

export const xmlCharTokens = RegExpMap(
	new Map(
		[
			[/</, OpBrack],
			[/>/, ClBrack],
			[/\//, ClSlash],
			[/=/, EqualitySign],
			[/&/, Ampersand],
			[or(/"/, /'/), Quote],
			[/!--/, CommentBeginning],
			[/--/, CommentEnding],
			[space(), Space]
		].map((x) => [global(x[0]), x[1]])
	),
	XMLSymbol
)
