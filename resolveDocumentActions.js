import defaultResolve from "part:@sanity/base/document-actions"

import InstagramImporter from "./actions/InstagramImporter"

export default function resolveDocumentActions(props) {
  return [...defaultResolve(props), InstagramImporter]
}
