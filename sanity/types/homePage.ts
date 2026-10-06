export interface SanityImageCrop {
  _type?: 'sanity.imageCrop'
  top: number
  bottom: number
  left: number
  right: number
}

export interface SanityImageHotspot {
  _type?: 'sanity.imageHotspot'
  x: number
  y: number
  height: number
  width: number
}

export interface SanityImage {
  url: string
  alt?: string
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

export interface SanityFile {
  url: string
}

export interface LandingLink {
  label: string
  href: string
}

export type LandingNavLinkShowOn = 'both' | 'desktop' | 'mobile'

export interface LandingNavLink extends LandingLink {
  _key: string
  variant: 'link' | 'button'
  showOn?: LandingNavLinkShowOn
}

export interface LandingHeaderData {
  title: string
  logo?: SanityImage
  navLinks: LandingNavLink[]
}

export interface PortableTextMarkDef {
  _key: string
  _type: string
  href?: string
}

export interface PortableTextSpan {
  _key: string
  _type: 'span'
  text: string
  marks: string[]
}

export interface PortableTextBlock {
  _key: string
  _type: 'block'
  style: string
  markDefs: PortableTextMarkDef[]
  children: PortableTextSpan[]
}

export interface PortableTextImageBlock extends SanityImage {
  _key: string
  _type: 'image'
}

export type PortableTextNode = PortableTextBlock | PortableTextImageBlock

export interface LandingHeroSection {
  _key: string
  _type: 'landingHero'
  title: string
  headline: string
  highlightedText?: string
  subheadline: string
  primaryCta: LandingLink
  background?: {
    image?: SanityImage
    video?: SanityFile
    overlayOpacity?: number
  }
  imageTrailItems?: Array<
    SanityImage & {
      _key: string
    }
  >
  tagsRibbon?: string[]
}

export interface LandingMetric {
  _key: string
  value: string
  label: string
  description?: string
}

export interface LandingServiceAccordionItem {
  _key: string
  title: string
  id?: string
  icon?: string
  content: PortableTextNode[]
}

export interface LandingBrand {
  _key: string
  name: string
  logo: SanityImage
}

export interface LandingWhyCard {
  _key?: string
  eyebrow: string
  title: string
  text: string
}

export interface LandingBodySection {
  _key: string
  _type: 'landingBody'
  title: string
  introEyebrow: string
  introTitle: string
  introText: string
  metrics: LandingMetric[]
  servicesTitle?: string
  servicesDescription?: string
  servicesAccordion: LandingServiceAccordionItem[]
  manifesto: {
    title: string
    subtitle?: string
  }
  whyCards: LandingWhyCard[]
  brands: LandingBrand[]
}

export type LandingFormFieldType = 'text' | 'email' | 'textarea'

export interface LandingFormField {
  _key: string
  name: string
  label: string
  type: LandingFormFieldType
  required?: boolean
}

export interface LandingFormSection {
  _key: string
  _type: 'landingForm'
  title: string
  heading: string
  subtext: string
  contactInfo: {
    email: string
    city?: string
    country?: string
  }
  formFields: LandingFormField[]
  submitLabel: string
  successMessage?: string
  errorMessage?: string
}

export type HomePageSection = LandingHeroSection | LandingBodySection | LandingFormSection

export interface LandingLinksColumn {
  _key: string
  title?: string
  links: Array<LandingLink & {_key: string}>
}

export interface LandingSocialLink {
  _key: string
  platform?: 'instagram' | 'linkedin' | 'twitter' | 'youtube' | 'tiktok'
  href: string
  icon?: SanityImage
}

export interface LandingFooterBottomLogo {
  _key: string
  image: SanityImage
  alt?: string
  href?: string
}

export interface LandingFooterData {
  title: string
  footerLogo?: SanityImage
  linksColumns: LandingLinksColumn[]
  socialLinks?: LandingSocialLink[]
  bottomLogos?: LandingFooterBottomLogo[]
  legalText: string
  smallPrint?: string
}

export interface SeoData {
  title?: string
  description?: string
  ogImage?: SanityImage
}

export interface HomePageData {
  _id: string
  _type: 'homePage'
  title: string
  slug?: string
  header: LandingHeaderData
  sections: HomePageSection[]
  footer: LandingFooterData
  seo?: SeoData
}
