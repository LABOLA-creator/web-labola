import type {LandingHeaderData, SanityImage, SeoData} from '@/sanity/types/homePage'

export interface TalentSocialLink {
  _key: string
  platform?: string
  url: string
  followers?: string
  icon?: SanityImage
}

export interface TalentCard {
  _key: string
  name: string
  description?: string
  image?: SanityImage
  socialLinks?: TalentSocialLink[]
}

export interface TalentsHeroSection {
  title: string
  highlightedWord?: string
  backgroundImage?: SanityImage
  overlayOpacity?: number
}

export interface TalentsPageData {
  _id: string
  _type: 'talentsPage'
  title: string
  slug?: string
  header: LandingHeaderData
  hero: TalentsHeroSection
  talents: TalentCard[]
  seo?: SeoData
}
