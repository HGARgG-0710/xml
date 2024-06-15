// * First-level tokens

import { TokenInstance, TokenType } from "@hgargg-0710/parsers.js"

export const [OpBrack, ClBrack, Ampersand] = ["opbrack", "clbrack", "amp"].map(
	TokenInstance
)

export const [
	XMLSymbol,
	Quote,
	Space,
	CommentBeginning,
	CommentEnding,
	ClSlash,
	QuestionMark,
	EqualitySign
] = [
	"symbol",
	"quote",
	"space",
	"commentbeg",
	"commentend",
	"clslash",
	"qmark",
	"eqsign"
].map(TokenType)
