import * as colors from "https://deno.land/std@0.152.0/fmt/colors.ts";
import { build, emptyDir } from "https://deno.land/x/dnt@0.29.1/mod.ts";
import { SpecifierMappings } from "https://deno.land/x/dnt@0.29.1/transform.ts";

async function getMainFile(_package: string) {
  try {
    await Deno.readFile(`../packages/${_package}/mod.ts`)
    return "mod.ts"
  } catch {
    return "mod.js"
  }
}

async function getPackageJSON(_package: string) {
  try {
    const json = JSON.parse(await Deno.readTextFile(`../packages/${_package}/package.json`))
    return json
  } catch {
    return null
  }
}

for await (const dir of Deno.readDir("../packages")) {

  if (dir.isDirectory) {
    const packagePath = `/packages/${dir.name}`
    const packageJSON = await getPackageJSON(dir.name)
    const main = await getMainFile(dir.name)
    await emptyDir("../node" + packagePath)
    Deno.copyFileSync(`../packages/${dir.name}/LICENSE`, `../node${packagePath}/LICENSE`);
    Deno.copyFileSync(`../packages/${dir.name}/README.md`, `../node${packagePath}/README.md`);

    console.log("[dnt]", colors.italic(colors.blue(`${packagePath} => ${"/node" + packagePath}`)))

    // Check if has valid package json
    if (packageJSON === null || packageJSON.name === undefined) {
      throw new Error("Invalid package.json found")
    }

    const mappings = {} as SpecifierMappings

    if (packageJSON.dependencies?.["discord-api-types"]) {
      mappings["https://deno.land/x/discord_api_types@0.37.0/v10.ts"] = {
        name: "discord-api-types",
        subPath: "/v10",
        version: "^0.37.2"
      }
    }

    await build({
      entryPoints: ["../" + packagePath + "/" + main],
      outDir: `../node/packages/${dir.name}`,
      importMap: "../import_map.json",
      declaration: true,
      packageManager: "yarn",
      shims: {
        deno: true,
        undici: true,
        webSocket: true,
        blob: true,
        timers: true,
      },
      mappings,
      package: packageJSON,
      compilerOptions: {
        skipLibCheck: true,
          target: "Latest",
          lib: [
            "esnext"
        ],
      },
      typeCheck: false
  })
  }
}

console.log("[dnt]", colors.green("All packages builded"))
