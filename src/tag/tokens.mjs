import { TokenType } from "@hgargg-0710/parsers.js"

export const [
	XMLName,
	XMLText,
	XMLProlog,
	XMLTag,
	XMLSingleTag,
	XMLClosingTag,
	XMLAttribute
] = [
	"name",
	"text",
	"prolog",
	"tag",
	"stag",
	"cltag",
	"attribute"
].map(TokenType)
