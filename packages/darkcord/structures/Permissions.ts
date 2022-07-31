export class Permissions {
  allow: bigint
  deny: bigint
  constructor (allow: number, deny = 0
  ) {
    this.allow = BigInt(allow)
    this.deny = BigInt(deny)
  }
  /**
     * Check if this permission allows a specific permission
     * @param permissions The permissions bits to verify
     */
  has (permissions: bigint) {
    return (this.allow & permissions) === permissions
  }
}
