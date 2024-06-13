import { Token } from "@hgargg-0710/parsers.js"
export const XMLElement = (name, attrs, value) => Token("element", { name, attrs, value })