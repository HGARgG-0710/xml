export const XMLTag = (name, attrs, closing = false, comment = false) =>
	Token("tag", { name, attrs, closing, comment })

export const [XMLName, XMLString, XMLComment, XMLText] = [
	"name",
	"string",
	"comment",
	"text"
].map((type) => (value) => Token(type, value))
export const XMLAttribute = (name, value) => Token("attribute", { name, value })
