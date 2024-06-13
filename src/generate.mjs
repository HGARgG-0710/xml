import { TreeStream, StringSource } from "@hgargg-0710/parsers.js"

export const XMLGenerate = (AST) => generate(TreeStream(XMLTree(AST)), StringSource())
