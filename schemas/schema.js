import createSchema from "part:@sanity/base/schema-creator"
import schemaTypes from "all:part:@sanity/base/schema-type"

import category from "./documents/category"
import maker from "./documents/maker"

export default createSchema({
  name: "default",
  types: schemaTypes.concat([category, maker]),
})
