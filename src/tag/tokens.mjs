import { TokenType } from "@hgargg-0710/parsers.js"

// ! PROOOOOOOOOBBBBLEEEMEE - the 'Comment's are SUPPOSED to be parsed BEFORE the 'entities';

export const [
	XMLName,
	XMLString,
	XMLComment,
	XMLText,
	XMLTag,
	XMLSingleTag,
	XMLClosingTag,
	XMLAttribute
] = ["name", "string", "comment", "text", "tag", "stag", "cltag", "attribute"].map(
	TokenType
)
