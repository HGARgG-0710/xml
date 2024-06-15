import {
	OpBrack,
	ClBrack,
	ClSlash,
	EqualitySign,
	Ampersand,
	Quote,
	CommentBeginning,
	CommentEnding,
	Space,
	QuestionMark,
	XMLSymbol
} from "./tokens.mjs"

import {
	PatternTokenizer,
	StringPattern,
	Token,
	RegExpMap,
	regex
} from "@hgargg-0710/parsers.js"

const { global, space, or } = regex

import { object, function as _function } from "@hgargg-0710/one"
const { structCheck } = object
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
			[/\?/, QuestionMark],
			[space(), Space],
			[/./, XMLSymbol]
		].map((x) => [global(x[0]), x[1]])
	)
)

export const charTokenizer = PatternTokenizer(xmlCharTokens, structCheck(["type"]))
export const XMLCharTokenizer = trivialCompose(
	(x) => x.map((x) => (x.value ? { ...x, value: x.value.value } : x)),
	Token.value,
	charTokenizer,
	StringPattern
)
