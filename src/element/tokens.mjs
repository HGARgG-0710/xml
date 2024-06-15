import { TokenType } from "@hgargg-0710/parsers.js"

export const _XMLElement = TokenType("element")
export const XMLElement = (name, attrs, value = []) => _XMLElement({ name, attrs, value })
