// * First-level tokens

import { TokenInstance, TokenType } from "@hgargg-0710/parsers.js"

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
].map(TokenInstance)

export const [XMLSymbol, Quote] = ["symbol", "quote"].map(TokenType)
