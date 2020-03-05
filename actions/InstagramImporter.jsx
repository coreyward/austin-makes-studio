import React, { useState } from "react"
import PropTypes from "prop-types"
import client from "part:@sanity/base/client"
import ProgressBar from "part:@sanity/components/progress/bar"
import TextField from "part:@sanity/components/textfields/default"
import Button from "part:@sanity/components/buttons/default"
import { useDocumentOperation } from "@sanity/react-hooks"
import instagram from "../lib/instagram"

const getImageData = async url => {
  const response = await global.fetch(url)
  const contentType = response.headers.get("Content-Type")
  return response.blob().then(imageData => ({ contentType, imageData }))
}

const uploadImage = ({ imageData, contentType }) =>
  client.assets.upload("image", imageData, { contentType })

const InstagramImporter = ({ id, type, onComplete }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  if (type !== "maker") return null

  return {
    label: "Import from Instagram",
    onHandle: () => {
      setDialogOpen(true)
    },
    dialog: dialogOpen && {
      type: "modal",
      title: "Import from Instagram!",
      onClose: onComplete,
      content: <ImportDialog id={id} type={type} onComplete={onComplete} />,
    },
  }
}

export default InstagramImporter

const ImportDialog = ({ id, type, onComplete }) => {
  const { patch } = useDocumentOperation(id, type)
  const [status, setStatus] = useState({ percent: 0, message: "Idle" })
  const [handle, setHandle] = useState()

  const importHandle = async () => {
    setStatus({ percent: 5, message: "Fetching profile" })
    const user = await instagram.getProfile(handle)

    setStatus({ percent: 25, message: "Downloading avatar" })
    const image = await getImageData(user.avatar)

    setStatus({ percent: 75, message: "Uploading avatar" })
    const avatar = await uploadImage(image)

    setStatus({ percent: 90, message: "Updating document" })
    patch.execute([
      {
        set: {
          name: user.name,
          bio: user.bio,
          website: user.website ? user.website.toLowerCase() : undefined,
          avatar: { asset: { _type: "reference", _ref: avatar._id } },
          instagramHandle: handle,
        },
      },
    ])

    setStatus({ percent: 100, message: "Done" })
    onComplete()
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        importHandle()
      }}
    >
      <h3 style={{ marginTop: 0 }}>Import from Instagram</h3>

      {status.percent > 0 ? (
        <div>
          <ProgressBar percent={status.percent} text={status.message} />
          <br />
        </div>
      ) : (
        <div css={{ display: "flex" }}>
          <TextField
            label="Instagram Handle"
            value={handle}
            onChange={e => setHandle(e.target.value)}
          />

          <br />
          <Button onClick={importHandle} styles={{ marginLeft: "1em" }}>
            Import
          </Button>
        </div>
      )}
    </form>
  )
}

ImportDialog.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
}
