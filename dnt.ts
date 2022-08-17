import { build } from "https://deno.land/x/dnt@0.29.1/mod.ts"
import { emptyDir } from "https://deno.land/x/dnt@0.29.1/mod.ts"

async function getPackageJSON(_package: string) {
  try {
    const json = JSON.parse(await Deno.readTextFile(`./packages/${_package}/package.json`))
    return json
  } catch {
    return null
  }
}

for await (const dir of Deno.readDir("./packages")) {
  
  if (dir.isDirectory) {
    const packagePath = `./packages/${dir.name}`
    await emptyDir(packagePath)

    build({
      entryPoints: [packagePath],
      outDir: `./node/packages/${dir.name}`,
      importMap: "../../import_map.json",
      declaration: true,
      packageManager: "yarn",
      shims: {
        // see JS docs for overview and more options
        deno: true,
        undici: true,
      },
      package: await getPackageJSON(dir.name),
      compilerOptions: {
        skipLibCheck: true,
          target: "Latest",
          lib: [
            "esnext"
        ]
      },
      typeCheck: false
  })
  }
}
