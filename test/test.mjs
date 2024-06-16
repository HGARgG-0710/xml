import { generate, parse } from "../src/xml.mjs"
import { readFile, writeFile } from "fs/promises"
const parsed = parse((await readFile("./in.xml")).toString())
writeFile("./out.json", JSON.stringify(parsed))
writeFile("./out.xml", generate(parsed))
