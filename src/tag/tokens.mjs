import { TokenType } from "@hgargg-0710/parsers.js"

export const [
	XMLName,
	XMLString,
	XMLText,
	XMLPrologTag,
	XMLTag,
	XMLSingleTag,
	XMLClosingTag,
	XMLAttribute
] = [
	"name",
	"string",
	"text",
	"prolog",
	"tag",
	"stag",
	"cltag",
	"attribute"
].map(TokenType)
