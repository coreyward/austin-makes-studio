import client from "part:@sanity/base/client"
import { useDocumentOperation } from "@sanity/react-hooks"
import instagram from "../lib/instagram"

const transloadImage = async url => {
  const response = await global.fetch(url)
  const contentType = response.headers.get("Content-Type")
  const imageData = await response.blob()

  return client.assets.upload("image", imageData, { contentType })
}

const InstagramImporter = ({ id, type, draft, published, onComplete }) => {
  const { patch } = useDocumentOperation(id, type)

  if (type !== "maker") {
    return null
  }

  const instagramHandle = draft?.instagramHandle || published?.instagramHandle

  return {
    label: "Import from Instagram",
    disabled: !instagramHandle,
    onHandle: async () => {
      const user = await instagram.getProfile(instagramHandle)

      const avatar = await transloadImage(user.avatar)

      patch.execute([
        {
          set: {
            name: user.name,
            bio: user.bio,
            website: user.website && user.website.toLowerCase(),
            avatar: { asset: { _type: "reference", _ref: avatar._id } },
          },
        },
      ])

      onComplete()
    },
  }
}

export default InstagramImporter
