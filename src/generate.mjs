import {
	TreeStream,
	StringSource,
	PredicateMap,
	SourceGenerator,
	childIndex
} from "@hgargg-0710/parsers.js"
import { _XMLElement } from "./element.mjs"
import { XMLProlog, XMLText } from "./tag.mjs"
import { XMLEntity } from "./entity/tokens.mjs"

import { function as _f, object, map } from "@hgargg-0710/one"
import { XMLComment } from "./comment/tokens.mjs"
import { XMLSubstring } from "./tag/string/tokens.mjs"

const { kv: okv, structCheck } = object
const { toObject } = map
const { trivialCompose, or, cache } = _f

const [preSeparated, postSeparated] = [
	[(sep) => [(x) => x, (x) => StringSource(sep).concat(x)], [" ", "\n"]],
	[(sep) => [(x) => x, (x) => x.concat(StringSource(sep))], ["\n"]]
].map((x) => toObject(cache(...x)))

const headGenerate = (attrs, input, generator) => {
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

const bodyGenerate = (value, input, generator) =>
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
			XMLProlog.is,
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

function XMLAttrsTransform(xmlTree) {
	if (xmlTree instanceof Array) return xmlTree.map(XMLAttrsTransform)
	if (valueCheck(xmlTree) && attrsCheck(xmlTree.value)) {
		xmlTree.value.attrs = XMLTreeShape(
			okv(xmlTree.value.attrs).map((x, i) =>
				i
					? XMLTreeShape(x.map((x) => XMLTreeShape(x.map(XMLTreeShape))))
					: XMLTreeShape(x)
			)
		)
		if (valueCheck(xmlTree.value) && xmlTree.value.value instanceof Array)
			xmlTree.value.value = XMLTreeShape(XMLAttrsTransform(xmlTree.value.value))
	}
	return XMLTreeShape(xmlTree)
}

function XMLTreeShape(element) {
	element.children = _XMLElement.is(element)
		? function () {
				return [this.value.attrs[1], this.value.value]
		  }
		: XMLProlog.is(element)
		? function () {
				return this.value.attrs[1]
		  }
		: function () {
				return this
		  }
	element.index = childIndex
	return element
}

export const XMLTree = trivialCompose(XMLTreeShape, XMLAttrsTransform)
export const XMLStream = trivialCompose(TreeStream, XMLTree)
export default (AST) => XMLGenerator(XMLStream(AST), StringSource()).value
