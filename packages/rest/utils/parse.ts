export function parse (res: Response) {
  let result

  if (res.status === 204) {
    result = Promise.resolve(null)
  } else if (res.headers.get("content-type")?.startsWith("application/json")) {
    result = res.json()
  } else {
    result = res.arrayBuffer().then(arr => new Uint8Array(arr))
  }

  return result
}
