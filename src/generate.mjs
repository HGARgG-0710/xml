import {
	TreeStream,
	StringSource,
	PredicateMap,
	SourceGenerator
} from "@hgargg-0710/parsers.js"
import { _XMLElement } from "./element.mjs"
import { XMLPrologTag, XMLText } from "./tag.mjs"
import { XMLEntity } from "./entity/tokens.mjs"

import { function as _f, object, array } from "@hgargg-0710/one"
import { XMLComment } from "./comment/tokens.mjs"
import { XMLSubstring } from "./tag/string/tokens.mjs"

const { trivialCompose, or } = _f
const { kv: okv, structCheck } = object
const { propPreserve } = array

// ? Refactor? ['prologs' and tag's "heads" are 'the same'] (NOTE: how about COMPLETELY reversing EVERY layer of parsing? Would be an epic thing to implement for the v0.2...);
export const xmlGenerator = PredicateMap(
	new Map([
		[
			_XMLElement.is,
			function (input, generator) {
				const { name, attrs, value } = input.next().value
				const [attrNames, vals] = attrs
				return StringSource(
					`<${name} ${
						attrNames.reduce(
							(last, curr, i) =>
								input.next() &&
								(attrNames.length - 1 !== i
									? (x) => x.concat(StringSource(" "))
									: (x) => x)(
									last.concat(
										StringSource(
											`${curr}="${
												Array(vals[i].length)
													.fill(0)
													.reduce(
														(last) =>
															input.next() &&
															last.concat(generator(input)),
														StringSource()
													).value
											}"`
										)
									)
								),
							StringSource()
						).value
					}${
						input.next() && value.length
							? `>${
									Array(value.length)
										.fill(0)
										.reduce(
											(last) =>
												input.next() &&
												last.concat(generator(input)),
											StringSource()
										).value
							  }</${name}>`
							: `/>`
					}`
				)
			}
		],
		[
			XMLPrologTag.is,
			function (input, generator) {
				const { name, attrs } = input.curr().value
				const [attrNames, vals] = attrs
				return StringSource(
					`<?${name} ${
						attrNames.reduce(
							(last, curr, i) =>
								input.next() &&
								// TODO: CACHE! [the function...];
								(attrNames.length - 1 !== i
									? (x) => x.concat(StringSource(" "))
									: (x) => x)(
									last.concat(
										StringSource(
											`${curr}="${
												Array(vals[i].length)
													.fill(input)
													.reduce(
														(last, _curr, j) =>
															input.next() &&
															last.concat(generator(input)),
														StringSource()
													).value
											}"`
										)
									)
								),
							StringSource()
						).value
					}?>`
				)
			}
		],
		[XMLEntity.is, (input) => StringSource(`&${input.curr().value};`)],
		[XMLComment.is, (input) => StringSource(`<!--${input.curr().value}-->`)],
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
		xmlTree.value.attrs = _tree(
			okv(xmlTree.value.attrs).map((x, i) =>
				i ? _tree(x.map((x) => _tree(x.map(_tree)))) : _tree(x)
			)
		)
		if (valueCheck(xmlTree.value) && xmlTree.value.value instanceof Array)
			xmlTree.value.value = _tree(XMLAttrsTransform(xmlTree.value.value))
	}
	return xmlTree
}

function _tree(element) {
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

const preserveMap = (f) => propPreserve((x) => x.map(f))
const XMLpreserveMap = preserveMap(XMLTree)

export function XMLTree(xmlTree) {
	return xmlTree instanceof Array
		? _tree(xmlTree.map(XMLTree))
		: _XMLElement.is(xmlTree)
		? ((x) => {
				x.value.value = XMLpreserveMap(x.value.value)
				return _tree(x)
		  })(xmlTree)
		: _tree(xmlTree)
}

export const XMLStream = trivialCompose(TreeStream, XMLTree, XMLAttrsTransform)

export default (AST) => XMLGenerator(XMLStream(AST), StringSource()).value
