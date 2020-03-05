import React, { useState } from "react"
import PropTypes from "prop-types"
import client from "part:@sanity/base/client"
import ProgressBar from "part:@sanity/components/progress/bar"
import TextField from "part:@sanity/components/textfields/default"
import Button from "part:@sanity/components/buttons/default"
import ToggleSwitch from "part:@sanity/components/toggles/switch"
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
  const [posts, setPosts] = useState()
  const [importImages, setImportImages] = useState(true)

  const importHandle = async () => {
    setStatus({ percent: 5, message: "Fetching profile" })
    const user = await instagram.getProfile(handle)

    setStatus({ percent: 15, message: "Downloading avatar" })
    const image = await getImageData(user.avatar)

    setStatus({ percent: 30, message: "Uploading avatar" })
    const avatar = await uploadImage(image)

    setStatus({ percent: 40, message: "Updating document" })
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

    if (importImages) {
      setStatus({ percent: 60, message: "Fetching posts" })
      setPosts(await instagram.getPosts(handle))
    } else {
      onComplete()
    }

    setStatus({ percent: 100, message: "Done" })
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        importHandle()
      }}
    >
      <h3 style={{ marginTop: 0 }}>Import from Instagram</h3>

      {posts ? (
        <PostImporter posts={posts} patch={patch} onComplete={onComplete} />
      ) : status.percent > 0 ? (
        <div>
          <ProgressBar percent={status.percent} text={status.message} />
          <br />
        </div>
      ) : (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: "1em",
            }}
          >
            <TextField
              label="Instagram Handle"
              value={handle}
              onChange={e => setHandle(e.target.value)}
            />
            <Button onClick={importHandle} style={{ marginLeft: "1em" }}>
              Import
            </Button>
          </div>

          <ToggleSwitch
            label="Import Images"
            checked={importImages}
            onChange={() => setImportImages(prev => !prev)}
          />
          <br />
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

const PostImporter = ({ posts, patch, onComplete }) => {
  const [selectedPosts, setSelectedPosts] = useState(new Set())

  const handleSelectPost = id => {
    const newPosts = new Set(selectedPosts)
    if (selectedPosts.has(id)) {
      newPosts.delete(id)
    } else {
      newPosts.add(id)
    }
    setSelectedPosts(newPosts)
  }

  return (
    <div>
      <p>Select the photos you would like to import.</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: "1em",
        }}
      >
        {posts.map(post => (
          <div
            key={post.id}
            style={{ position: "relative", paddingBottom: "100%" }}
          >
            <img
              src={post.thumbnails[1].src}
              alt={post.caption}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: post.isVideo ? "not-allowed" : "pointer",
                opacity: post.isVideo ? 0.5 : 1,
                outline: selectedPosts.has(post.id) ? "2px blue solid" : "none",
              }}
              onClick={() => handleSelectPost(post.id)}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={async () => {
          // TODO: Show progress bar during this!
          const photos = await Promise.all(
            Array.from(selectedPosts).map(id => {
              const post = posts.find(post => post.id === id)
              return getImageData(post.src).then(uploadImage)
            })
          )

          patch.execute([
            {
              set: {
                photos: photos.map((photo, index) => ({
                  _key: `${index}-${photo._id}`,
                  _type: "image",
                  asset: { _type: "reference", _ref: photo._id },
                })),
              },
            },
          ])

          onComplete()
        }}
      >
        Import Photos
      </Button>
    </div>
  )
}

PostImporter.propTypes = {
  posts: PropTypes.array.isRequired,
  patch: PropTypes.shape({
    execute: PropTypes.func.isRequired,
  }).isRequired,
  onComplete: PropTypes.func.isRequired,
}
