export const homePageSeoQuery = /* groq */ `
*[_type == "homePage" && (!defined($slug) || slug.current == $slug)][0]{
  title,
  seo{
    title,
    description,
    ogImage{
      alt,
      "url": asset->url,
      crop,
      hotspot
    }
  }
}
`
