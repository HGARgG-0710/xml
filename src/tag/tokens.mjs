import { Token, TokenType } from "@hgargg-0710/parsers.js"

export const _XMLTag = TokenType("tag")

export const XMLTag = (name, attrs, closing = false, comment = false) =>
	_XMLTag({ name, attrs, closing, comment })

export const [XMLName, XMLString, XMLComment, XMLText] = [
	"name",
	"string",
	"comment",
	"text"
].map(TokenType)
export const _XMLAttribute = Token("attribute")
export const XMLAttribute = (name, value) => _XMLAttribute({ name, value })
