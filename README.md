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
function parse(xml: string): (XMLProlog | XMLElement)[]
```

Parses a given XML text and returns it as an AST.

```ts
function generate(XMLAST: (XMLProlog | XMLElement)[]): string
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
function XMLTree(XMLAST: (XMLElement | XMLProlog)[]): Tree
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

<!-- ! COMPLETE! -->

##### Submodules

The module contains the only submodule of `string`, which contains the parsing

###### `string`

#### `element`

### Usage

For usage examples and precise structure of final `parse` and `generate` functions, see `test` directory.
