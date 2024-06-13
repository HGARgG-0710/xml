// * First-level tokens

import { Token } from "@hgargg-0710/parsers.js"

// ^ IDEA [for the `parsers.js` library, v0.2]: create a TokenType function (would create a function (type) => { (value) => ({type, value}); is: (x) => x.type === type})
// ^ IDEA [for the `parsers.js` library, v0.2]: create a 'TokenInstance' function, result of which is also a function with '.is', but result of which ONLY contains the given type (frees one from using the 'null' for 'value');
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
