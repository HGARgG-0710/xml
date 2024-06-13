import { BasicMap, StreamParser, TokenMap } from "@hgargg-0710/parsers.js"

export const entityMap = TokenMap(BasicMap)(
	new Map([
		[
			"amp",
			function (input) {
				input.next() // &
				return [
					read(
						(input) => Token.value(input.curr()) !== ";",
						TokenSource(XMLEntity(""))
					)(input).value
				]
			}
		]
	])
)

export const XMLEntityParser = StreamParser(entityMap)
