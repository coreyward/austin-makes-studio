/* eslint-disable camelcase */

let userDataCache = []
const fetchInstagramData = async username => {
  if (userDataCache.hasOwnProperty(username)) return userDataCache[username]

  const html = await global
    .fetch(`https://www.instagram.com/${username}/`)
    .then(response => response.text())
  const matchData = html.match(
    /<script type="text\/javascript">window\._sharedData = ([^\n]+);<\/script>/
  )

  userDataCache[username] = matchData && JSON.parse(matchData[1])

  return userDataCache[username]
}

const getUserData = async username => {
  const data = await fetchInstagramData(username)
  return data && data.entry_data.ProfilePage[0].graphql.user
}

const getProfile = async username => {
  const user = await getUserData(username)

  return {
    name: user.full_name,
    bio: user.biography,
    website: user.external_url,
    followerCount: user.edge_followed_by.count,
    followingCount: user.edge_follow.count,
    avatar: user.profile_pic_url_hd,
  }
}

const getPosts = async username => {
  const user = await getUserData(username)

  return user.edge_owner_to_timeline_media.edges.map(({ node }) => ({
    id: node.id,
    caption: node.edge_media_to_caption.edges
      .map(edge => edge.node.text)
      .join("\n"),
    dimensions: node.dimensions,
    src: node.display_url,
    thumbnails: node.thumbnail_resources.map(
      ({ src, config_width, config_height }) => ({
        src,
        width: config_width,
        height: config_height,
      })
    ),
    isVideo: node.is_video,
  }))
}

export default {
  getPosts,
  getProfile,
  getUserData,
  fetchInstagramData,
}
