import {
	TreeStream,
	StringSource,
	PredicateMap,
	SourceGenerator
} from "@hgargg-0710/parsers.js"
import { _XMLElement } from "./element.mjs"
import { XMLPrologTag, XMLText } from "./tag.mjs"
import { XMLEntity } from "./entity/tokens.mjs"

import { function as _f, object, map } from "@hgargg-0710/one"
import { XMLComment } from "./comment/tokens.mjs"
import { XMLSubstring } from "./tag/string/tokens.mjs"

const { trivialCompose, or } = _f
const { dekv, kv: okv, structCheck } = object
const { kv: mkv } = map

// TODO: MAKE AN ALIAS IN 'one.js'!!! [used in another place in the 'xml'...]
const preSeparated = dekv(
	mkv(
		new Map(
			[" ", "\n"].map((sep) => [
				sep,
				[(x) => x, (x) => StringSource(sep).concat(x)]
			])
		)
	)
)
const postSeparated = dekv(
	mkv(
		new Map(
			["\n"].map((sep) => [sep, [(x) => x, (x) => x.concat(StringSource(sep))]])
		)
	)
)

export const headGenerate = (attrs, input, generator) => {
	const [attrNames, vals] = attrs
	return `${
		attrNames.reduce(
			(last, curr, i) =>
				input.next() &&
				last.concat(
					preSeparated[" "][1](
						StringSource(
							`${curr}="${
								Array(vals[i].length)
									.fill(0)
									.reduce(
										(last) =>
											input.next() && last.concat(generator(input)),
										StringSource()
									).value
							}"`
						)
					)
				),
			StringSource()
		).value
	}`
}

export const bodyGenerate = (value, input, generator) =>
	Array(value.length)
		.fill(0)
		.reduce(
			(last, _, i) =>
				input.next() &&
				postSeparated["\n"][+(i === value.length - 1)](
					last.concat(
						preSeparated["\n"][+(!i && !_XMLElement.is(input.curr()))](
							generator(input)
						)
					)
				),
			StringSource()
		).value

export const xmlGenerator = PredicateMap(
	new Map([
		[
			_XMLElement.is,
			function (input, generator) {
				const { name, attrs, value } = input.next().value
				return preSeparated["\n"][1](
					StringSource(
						`<${name}${headGenerate(attrs, input, generator)}${
							input.next() && value.length
								? `>${bodyGenerate(value, input, generator)}</${name}>`
								: `/>`
						}`
					)
				)
			}
		],
		[
			XMLPrologTag.is,
			function (input, generator) {
				const { name, attrs } = input.curr().value
				return StringSource(`<?${name}${headGenerate(attrs, input, generator)}?>`)
			}
		],
		[XMLEntity.is, (input) => StringSource(`&${input.curr().value};`)],
		[
			XMLComment.is,
			(input) => preSeparated["\n"][1](StringSource(`<!--${input.curr().value}-->`))
		],
		[
			or(...[XMLText, XMLSubstring].map((x) => x.is)),
			(input) => StringSource(input.curr().value)
		]
	])
)

export const XMLGenerator = SourceGenerator(xmlGenerator)

const [valueCheck, attrsCheck] = ["value", "attrs"].map((x) => structCheck([x]))

export function XMLAttrsTransform(xmlTree) {
	if (xmlTree instanceof Array) return xmlTree.map(XMLAttrsTransform)
	if (valueCheck(xmlTree) && attrsCheck(xmlTree.value)) {
		xmlTree.value.attrs = XMLTree(
			okv(xmlTree.value.attrs).map((x, i) =>
				i ? XMLTree(x.map((x) => XMLTree(x.map(XMLTree)))) : XMLTree(x)
			)
		)
		if (valueCheck(xmlTree.value) && xmlTree.value.value instanceof Array)
			xmlTree.value.value = XMLTree(XMLAttrsTransform(xmlTree.value.value))
	}
	return XMLTree(xmlTree)
}

export function XMLTree(element) {
	element.children = _XMLElement.is(element)
		? function () {
				return [this.value.attrs[1], this.value.value]
		  }
		: XMLPrologTag.is(element)
		? function () {
				return this.value.attrs[1]
		  }
		: function () {
				return this
		  }
	//   TODO: REFACTOR from 'parsers.js'!!!
	element.index = function (multind) {
		return multind.reduce((prev, curr) => prev.children()[curr], this)
	}
	return element
}

export const XMLStream = trivialCompose(TreeStream, XMLTree, XMLAttrsTransform)
export default (AST) => XMLGenerator(XMLStream(AST), StringSource()).value
