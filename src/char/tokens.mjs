// * First-level tokens

import { TokenType } from "@hgargg-0710/parsers.js"

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
	CommentEnding,
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
	"commentend",
	"eqsign",
	"amp"
].map(TokenType)
