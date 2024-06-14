import { function as _function } from "@hgargg-0710/one"
import {
	PatternTokenizer,
	StringPattern,
	Token,
	RegExpMap,
	regex
} from "@hgargg-0710/parsers.js"

const { global, space, or } = regex

import {
	OpBrack,
	ClBrack,
	ClSlash,
	EqualitySign,
	Ampersand,
	Quote,
	CommentBeginning,
	CommentEnding,
	Space
} from "./tokens.mjs"
import { structCheck } from "@hgargg-0710/one/src/objects.mjs"

const { trivialCompose } = _function

export const xmlCharTokens = RegExpMap(
	new Map(
		[
			[/</, OpBrack],
			[/>/, ClBrack],
			[/\//, ClSlash],
			[/=/, EqualitySign],
			[/&/, Ampersand],
			[or(/"/, /'/), Quote],
			[/!--/, CommentBeginning],
			[/--/, CommentEnding],
			[space(), Space]
		].map((x) => [global(x[0]), x[1]])
	),
	XMLSymbol
)

export const charTokenizer = PatternTokenizer(xmlCharTokens, structCheck(["type"]))
export const XMLCharTokenizer = trivialCompose(Token.value, charTokenizer, StringPattern)
