import { APISticker, StickerType } from "discord-api-types/v10"
import { Base } from "./Base.ts"

export class Sticker extends Base {
  /**
   * Name of the sticker
   */
  name: string
  /**
   * For standard stickers, ID of the pack the sticker is from
   */
  packId?: string
  /**
   * For guild stickers, the Discord name of a unicode emoji representing the sticker's expression.
   * for standard stickers, a comma-separated list of related expressions.
   */
  tags: string
  /**
   * Type of sticker
   *
   * @See https://discord.com/developers/docs/resources/sticker#sticker-object-sticker-types
   */
  type: StickerType
  /**
   * Description of the sticker
   */
  description: string | null

  constructor(public data: APISticker) {
    super(data.id)

    this.name = data.name

    this.packId = data.pack_id

    this.tags = data.tags

    this.type = data.type

    this.description = data.description
  }
}
