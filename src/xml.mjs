// * The general abstractions related to the XML format processing
// ! refactor this! [the repeating values in similarly-typed maps...];

// ! PROBLEM - this DOES NOT allow for 'prolog' usage! (the <?xml>) tag
// ! PROBLEM - a design issue - the thing is SUPPOSED TO BE WORKING INSTEAD with an additiona layer!
// * In short, the whole structure of the parser ought to look something like:
// 		% 1. Characters
// 		% 2. 'opbrack', 'clbrack', ...
// 		% 3. 'tag', 'text', 'entity'
// 		% [UNDONE YET] 4. `root`, `element`, 'prolog'
// ! For this - RESTRUCTURE THE PARSER [as it is: A. incomplete; B. buggy; C. un-refactored]

// ! DO not use this as a 'default' export, instead use as value for 'parse'
// export default function XMLParse(xml) {
// 	return parse(InputStream(tokenize(InputStream(xml))))
// }

export * as generate from "./generate.mjs"
export * as char from "./char.mjs"
export * as element from "./element.mjs"
export * as tag from "./tag.mjs"
export { default as generate } from "./generate.mjs"

// ! MAKE THESE EXPORTS! [supposed to be doing what they say...]
// export const tokenize = PatternTokenizer(xmlTokens)
// export const generate = SourceGenerator(xmlGenerator)
// export const parse = StreamParser(xmlParser)
// export const tokenValidate = PatternValidator(xmlValidator)
// export const validate = StreamValidator(xmlValidator)

// export const tableParser = TableParser(xmlParser)
