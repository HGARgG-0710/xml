export const XMLTag = (name, attrs, closing = false, comment = false) =>
	Token("tag", { name, attrs, closing, comment })

export const [XMLText, XMLEntity] = ["text", "entity"].map(
	(type) => (value) => Token(type, value)
)

export const [XMLName, XMLString, XMLComment] = ["name", "string", "comment"].map(
	(x) => (value) => Token(x, value)
)
export const XMLAttribute = (name, value) => Token("attribute", { name, value })
