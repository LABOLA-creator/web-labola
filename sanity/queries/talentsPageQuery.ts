export const talentsPageQuery = /* groq */ `
*[_type == "talentsPage" && (!defined($slug) || slug.current == $slug)][0]{
  _id,
  _type,
  title,
  "slug": slug.current,

  header{
    title,
    logo{
      "url": asset->url,
      crop,
      hotspot
    },
    navLinks[]{
      _key,
      label,
      href,
      variant,
      showOn
    }
  },

  hero{
    title,
    highlightedWord,
    backgroundImage{
      alt,
      "url": asset->url,
      crop,
      hotspot
    },
    overlayOpacity
  },

  talents[]{
    _key,
    name,
    description,
    image{
      alt,
      "url": asset->url,
      crop,
      hotspot
    },
    socialLinks[]{
      _key,
      platform,
      url,
      followers,
      icon{
        alt,
        "url": asset->url,
        crop,
        hotspot
      }
    }
  },

  seo{
    title,
    description,
    ogImage{
      "url": asset->url,
      crop,
      hotspot
    }
  }
}
`
