const category = {
  title: "Category",
  name: "category",
  type: "document",
  fields: [
    {
      title: "Pluralized Name of Trade",
      description: "e.g. “Photographers”; use title case",
      name: "name",
      type: "string",
    },
    {
      title: "Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "name",
      },
    },
    {
      title: "Description",
      name: "description",
      type: "text",
      rows: 2,
    },
    {
      title: "Show on Website?",
      name: "published",
      type: "boolean",
    },
  ],
  initialValue: {
    published: false,
  },
}

export default category
