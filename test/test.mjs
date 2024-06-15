import { parse } from "../src/xml.mjs"
import { readFile, writeFile } from "fs/promises"
writeFile("./out.json", JSON.stringify(parse((await readFile("./in.xml")).toString())))
