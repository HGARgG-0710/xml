# xml

'xml' is a JavaScript library allowing for parsing, generation and tree-construction of XML.

## Installation

```
npm install @hgargg-0710/xml
```

## Documentation

The following is the outline of the package's exports.

NOTE: much of terminology and types is from [`parsers.js`](https://github.com/HGARgG-0710/parsers.js), as this
library is based on it.

### Exports (list)

The top-level exports are the following:

1. `generator` (module)
2. `char` (module)
3. `element` (module)
4. `tag` (module)
5. `comment` (module)
6. `entity` (module)
7. `generate` (function)
8. `parse` (function)

### Functions

```ts
function parse(xml: string): (XMLProlog | _XMLElement)[]
```

Parses a given XML text and returns it as an AST.

```ts
function generate(XMLAST: (XMLProlog | _XMLElement)[]): string
```

Takes the XML AST (result of `parser`) and converts it to corresponding XML text.

NOTE: this is also the default export of the `generator` module.

<br>

### Modules

Following are the modules of package.
They provide means of parsing intermediate representations of XML,
as well as their corresponding construction.

#### `generator`

Various intermediate abstractions related to XML-generation.

```ts
const xmlGenerator: PredicateMap
```

The `IndexMap` that defines the `XMLGenerator` `SourceGenerator`,
used as the primary component in the definition of `generate` function.

```ts
const XMLGenerator: SourceGenerator
```

A `SourceGenerator`, which takes a `XMLStream` and `Source` as input, and produces the `Source`,
containing the generated code as the contents of its `.value` property.

```ts
const XMLStream: Stream
```

A `TreeStream` function intended as input for `XMLGenerator`.

```ts
function XMLTree(XMLAST: (_XMLElement | XMLProlog)[]): Tree
```

Converts the XML AST (result of `parser`) into a `Tree`-interface (so as to be `TreeStream`-convertible).
Is a component of `XMLStream`.

<br>

#### `char`

This file contains abstractions related to the lowest level of parsing (character level, initial tokenization).

##### Tokens

```ts
const QOpBrack: TokenType
```

A `TokenType`, corresponding to the sequence `<?` inside an XML file.

```ts
const QClBrack: TokenType
```

A `TokenType`, corresponding to the sequence `?>` inside an XML file.

```ts
const OpSlBrack: TokenType
```

Corresponds to `</` in XML file.

```ts
const ClSlBrack: TokenType
```

Corresponds to `/>` in XML file.

```ts
const CommentBeginning: TokenType
```

Corresponds `<!--` in XML file.

```ts
const CommentEnding: TokenType
```

Corresponds to `-->` in XML file.

```ts
const OpBrack: TokenType
```

Corresponds to `<` in XML file (tokenized after all the other tokens including `<`).

```ts
const ClBrack: TokenType
```

Corresponds to `>` in XML file (tokenized after all the other tokens including `>`).

```ts
const EqualitySign: TokenType
```

Corresponds to `=` in XML file.

```ts
const Ampersand: TokenType
```

Corresponds to `&` in XML file.

```ts
const Quote: TokenType
```

Corresponds to one of `'` or `"` in an XML file.

```ts
const Space: TokenType
```

Corresponds to a `/s/` regular expression in textual representation of an XML file.

```ts
const XMLSymbol: TokenType
```

Corresponds to an arbitrary solitary symbol in an XML file (note: only when a symbol cannot be categorized otherwise)

##### Parsing

```ts
const xmlCharTokens: RegExpMap
```

An `IndexMap` used for defining `XMLCharTokenizer`, which
is a component of the `parser` function.

```ts
const charTokenizer: PatternTokenizer
```

A `PatternTokenizer` based off `xmlCharTokens`.

```ts
function XMLCharTokenizer(xml: string): Token[]
```

Takes in a `string` of XML returns an array of `Tokens` from the `char` module.

<br>

#### `comment`

This module contains abstractions related to the second XML parsing layer.
The only thing it does is take separate comments from non-comment content.

##### Tokens

```ts
const XMLComment: TokenType
```

Represents an XML comment.

##### Parsing

```ts
function CommentParser(input: Stream): [XMLComment]
```

A function used for parsing XML comments. The `XMLCommentParser` `StreamParser` is based on it.

```ts
const XMLCommentParser: StreamParser
```

A parser, that takes out all comments from the given `Stream` of `Token`s (uses `CommentBeginning` and `CommentEnding`).

The tokens between all the `CommentBeginning` and `CommentEnding` are replaced with a single `XMLComment` token.

<br>

#### `entity`

This is the third layer of parsing, which combines all the tokens between `Ampersand` and `XMLSymbol(';')`.

##### Tokens

```ts
const XMLEntity: TokenType
```

Represents an XML entity (ex: `&amp;` is the ampersand).

##### Parsing

```ts
function EntityParser(input: Stream): [XMLEntity]
```

A function used for parsing XML entities. On it the `XMLEntityParser` is based.

```ts
const XMLEntityParser: StreamParser
```

A `StreamParser`, expecting a `Stream` of tokens, that replaces all the
tokens between `Ampersand` and `XMLSymbol(';')` with an `XMLEntity`.

Entities survive all the other parsing stages and do not get evaluated further.

NOTE: This stage comes after the comments, because ampersands within them are not considered to be entities, but ordinary character sequences.

<br>

#### `tag`

This is the fourth parsing step, and it produces tokens
used for XML tag-representation.

##### Tokens

```ts
const XMLName: TokenType
```

An internal `TokenType` - it will not appear in the final AST,
but it is used for intermediate construction of Tag-tokens.

Used for the Tag's name.

```ts
const XMLText: TokenType
```

A sequence of non-entity and non-tag symbols that is a child of some element.
Survives all the parsing steps, represents text data.

```ts
const XMLProlog: TokenType
```

A "prolog" token (the `<?xml ...?>`, or some other name).
Survives the other parsing layers.

Its `value` is of shape `{ name: string, attrs: {[attrName: string]: [attrVal: (XMLSubstring | XMLEntity)[]]} }`.

```ts
const XMLTag: TokenType
```

An basic opening tag token (ex: `<A ...>`). Does not survive the later parsing procedures.

```ts
const XMLSingleTag: TokenType
```

A single XML tag (ex: `<A .../>`).
Does not survive the later parsing process.

```ts
const XMLClosingTag: TokenType
```

The XML tag representing closing tags (ex: `</A>`).
Does not survive further parsing.

```ts
const XMLAttribute: TokenType
```

An internal `TokenType`, used for representing attributes (does not appear in final AST).

##### Parsing

```ts
function TagArrayParser(input: Stream): [string, ...XMLAttribute[]]
```

Parses the next opening tag `<X attr1="..." ...>`, and returns it as
an array with the first element being the name and the rest being the attributes.

Alters `input`

```ts
function SingleTagArrayParser(input: Stream): [string, ...XMLAttribute[]]
```

Same as `TagArrayParser`, but for a single tag: `<X attr1="..." ... />`

```ts
function PrologArrayParser(input: Stream): [string, ...XMLAttribute[]]
```

Same as `TagArrayParser`, but for a prolog tag: `<?xml attr1="..." ... ?>`

```ts
function ClosingTagArrayParser(input: Stream): [string]
```

Same as `TagArrayParser`, but for a closing tag: `</X>`.

As they carry no attributes, the only element of the returned array is the name of the element.

```ts
function tagExtract(tagArray: [string, ...XMLAttribute[]]): {
	name: string
	attrs: { [k: string]: [v: (XMLSubstring | XMLEntity)[]] }
}
```

Converts the `[string, ...XMLAttribute[]]` into the final `attrs` form.
It survives all the other parsing layers.

```ts
function ClosingTagParser(input: Stream): [XMLClosingParser]
```

Conducts the parsing of a closing tag from beginning to end. Alters `input`.

```ts
function TextParser(input: Stream, parser: (input: Stream): any[]): [XMLText, ...any[]]
```

Parses `XMLText` from beginning to end, and also the next token from `input` (if present).

```ts
function SpaceParser(input: Stream, parser: (input: Stream): any[]): any[]
```

Skips all the `Space`s, returning the result of parsing of the next token.

```ts
function TagParser(input: Stream, parser: (input: Stream): any[]): [XMLTag | XMLSingleTag]
```

Parses either one of `XMLSingleTag` or `XMLTag` from beginning to end.
Alters `input`.

```ts
function PrologParser(input: Stream, parser: (input: Stream): any[]): [XMLProlog]
```

Parses an `XMLProlog` from beginning to end. Alters `input`.

```ts
const tagParser: PredicateMap
```

A `PredicateMap`, on which the `XMLTagParser` is based.

```ts
const XMLTagParser: StreamParser
```

A `StreamParser` that transforms the previous layer of parsing into one containing tags.

##### Submodules

The module contains the only submodule of `string`, which handles the parsing
of the strings used for attribute values.

###### `string`

###### Tokens

```ts
const XMLSubstring: TokenType
```

A `TokenType` representing an entity-free section of a given XML string `"..."`

###### Parsing

```ts
function StringParser(input: Stream): [XMLSubstring, XMLEntity?]
```

Parses the next `XMLSubstring` fragment, together with (possibly),
the next entity.

Alters `input`.

```ts
const xmlStringParser: PredicateMap
```

A `PredicateMap`, on which the `XMLStringParser` is based.

```ts
const XMLStringParser: StreamParser
```

A `StreamParser`, which, given a `Stream` that only includes `XMLEntity` and
any other token type with `.value` property, returns an `(XMLSubstring | XMLEntity)[]`.

<br>

#### `element`

This is the fifth and final layer of parsing of an XML document.
It converts tags into elements and structures their contents into a tree.

##### Tokens

```ts
const _XMLElement: TokenType
```

A `TokenType` representing final-level XML elements.

```ts
function XMLElement(
	name: string,
	attrs: { [attrName: string]: [attrVal: (XMLSubstring | XMLEntity)[]] },
	value: (_XMLElement | XMLText | XMLComment | XMLEntity)[]
): _XMLElement
```

A function that passes the three given values as an object to `_XMLElement` (`{ name, attrs, value }`).

##### Parsing

```ts
function ElementParser(input: Stream): [_XMLElement]
```

Converts the current tag from the `input` `Stream` into an `_XMLElement`.
Alters `input`.

```ts
const xmlParser: PredicateMap
```

A `PredicateMap`, on which the `XMLElementParser` is based.

```ts
const XMLElementParser: StreamParser
```

A `StreamParser` representing the last parsing layer of XML, takes in the `Stream` of the previous parsing layer.

### Usage

For usage examples and precise structure of final `parse` and `generate` functions, see `test` directory.
