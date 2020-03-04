const maker = {
  type: "document",
  name: "maker",
  title: "Maker",
  fieldsets: [
    {
      title: "Contact Information",
      name: "contactInfo",
    },
    {
      title: "Classification",
      name: "classification",
    },
  ],
  fields: [
    {
      title: "Name",
      name: "name",
      type: "string",
    },
    {
      title: "Bio",
      name: "bio",
      type: "text",
      rows: 2,
    },
    {
      title: "Categories",
      name: "categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      fieldset: "classification",
    },
    {
      title: "Tags",
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      fieldset: "classification",
    },
    {
      title: "Featured",
      name: "featured",
      type: "boolean",
      fieldset: "classification",
    },
    {
      title: "Website",
      name: "website",
      type: "url",
      fieldset: "contactInfo",
    },
    {
      title: "Instagram Handle",
      name: "instagramHandle",
      type: "string",
      fieldset: "contactInfo",
    },
    {
      title: "Email Address",
      name: "email",
      type: "string",
      fieldset: "contactInfo",
    },
    {
      title: "Phone Number",
      name: "phone",
      type: "string",
      fieldset: "contactInfo",
    },
    {
      title: "Avatar",
      name: "avatar",
      type: "image",
    },
  ],
  initialValue: {
    featured: false,
  },
}

export default maker
