module.exports = {
  "name": "Page",
  "description": "Basic page model.",
  "displayField": "title",
  "fields": [
    {
      "name": "Page Title",
      "id": "title",
      "type": "Symbol",
      "localized": false,
      "required": false,
      "disabled": false,
      "omitted": false,
      "validations": []
    },
    {
      "name": "Page Slug",
      "id": "uid",
      "type": "Symbol",
      "validations": []
    },
    {
      "name": "Page Description",
      "id": "description",
      "type": "Symbol"
    },
    {
      "name": "Page Image",
      "id": "image",
      "type": "Link",
      "linkType": "Asset"
    }
  ]
};
