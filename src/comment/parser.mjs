import { CommentBeginning, CommentEnding } from "../char/tokens.mjs"
import { XMLComment } from "./tokens.mjs"
import {
	PredicateMap,
	StreamParser,
	preserve,
	read,
	TokenSource
} from "@hgargg-0710/parsers.js"

export function CommentParser(input) {
	input.next()
	return [
		read(
			(input) => !CommentEnding.is(input.curr()),
			TokenSource(XMLComment(""))
		)(input).value
	]
}

export const XMLCommentParser = StreamParser(
	PredicateMap(new Map([[CommentBeginning.is, CommentParser]]), preserve)
)
