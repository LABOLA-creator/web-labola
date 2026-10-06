export const homePageQuery = /* groq */ `
*[_type == "homePage" && (!defined($slug) || slug.current == $slug)][0]{
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

  sections[]{
    _key,
    _type,

    _type == "landingHero" => {
      title,
      headline,
      highlightedText,
      subheadline,
      primaryCta{
        label,
        href
      },
      background{
        image{
          "url": asset->url,
          crop,
          hotspot
        },
        video{
          "url": asset->url
        },
        overlayOpacity
      },
      imageTrailItems[]{
        _key,
        alt,
        "url": asset->url,
        crop,
        hotspot
      },
      tagsRibbon[]
    },

    _type == "landingBody" => {
      title,
      introEyebrow,
      introTitle,
      introText,
      metrics[]{
        _key,
        value,
        label,
        description
      },
      servicesTitle,
      servicesDescription,
      servicesAccordion[]{
        _key,
        title,
        id,
        icon,
        "content": content[]{
          _key,
          _type,
          _type == "block" => {
            style,
            markDefs[]{
              _key,
              _type,
              href
            },
            children[]{
              _key,
              _type,
              text,
              marks
            }
          },
          _type == "image" => {
            "url": asset->url,
            crop,
            hotspot
          }
        }
      },
      manifesto{
        title,
        subtitle
      },
      "whyCards": coalesce(
        whyCards[]{
          _key,
          eyebrow,
          title,
          text
        },
        select(
          defined(whyCard) => [
            {
              "_key": "legacy-why-card",
              "eyebrow": whyCard.eyebrow,
              "title": whyCard.title,
              "text": whyCard.text
            }
          ],
          []
        )
      ),
      brands[]{
        _key,
        name,
        logo{
          "url": asset->url,
          crop,
          hotspot
        }
      }
    },

    _type == "landingForm" => {
      title,
      heading,
      subtext,
      contactInfo{
        email,
        city,
        country
      },
      formFields[]{
        _key,
        name,
        label,
        type,
        required
      },
      submitLabel,
      successMessage,
      errorMessage
    }
  },

  footer{
    title,
    footerLogo{
      "url": asset->url,
      crop,
      hotspot
    },
    linksColumns[]{
      _key,
      title,
      links[]{
        _key,
        label,
        href
      }
    },
    socialLinks[]{
      _key,
      platform,
      href,
      icon{
        "url": asset->url,
        crop,
        hotspot
      }
    },
    bottomLogos[]{
      _key,
      image{
        "url": asset->url,
        crop,
        hotspot
      },
      alt,
      href
    },
    legalText,
    smallPrint
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

// Ejemplos de uso:
// const homePage = await client.fetch(homePageQuery)
// const homeBySlug = await client.fetch(homePageQuery, {slug: 'home'})
