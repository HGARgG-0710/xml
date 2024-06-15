import { TreeStream, StringSource } from "@hgargg-0710/parsers.js"

// TODO: DEFINE the 'generate'!

export const XMLGenerate = (AST) => generate(TreeStream(XMLTree(AST)), StringSource())
// ! DEFINE THE DEFAULT [the 'generate' function...];
export default () => {}
