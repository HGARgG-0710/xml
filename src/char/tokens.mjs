// * First-level tokens

import { TokenInstance, TokenType } from "@hgargg-0710/parsers.js"

export const CommentEnding = TokenInstance("commentend")

export const [
	QOpBrack,
	QClBrack,
	OpSlBrack,
	ClSlBrack,
	OpBrack,
	ClBrack,
	XMLSymbol,
	Quote,
	Space,
	CommentBeginning,
	EqualitySign,
	Ampersand
] = [
	"qopbrack",
	"qclbrack",
	"opslbrack",
	"clslbrack",
	"opbrack",
	"clbrack",
	"symbol",
	"quote",
	"space",
	"commentbeg",
	"eqsign",
	"amp"
].map(TokenType)
