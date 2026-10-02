export const roles = ['reviewer', 'approver', 'owner'] as const
export type Role = typeof roles[number]
export const anchors = ['headline', 'artwork', 'details'] as const
export type Anchor = typeof anchors[number]
export type AssetId = 'poster' | 'banner'
export type VersionId = 'v1' | 'v2'
export const assets = [
  { id: 'poster', title: 'Night Garden', format: 'Campaign poster', owner: 'Mira · Creative owner', summary: 'A quiet invitation to the Northstar evening collection.', versions: { v1: { file: 'poster-v1.svg', change: 'Initial creative · small date line' }, v2: { file: 'poster-v2.svg', change: 'Larger date line · clearer invitation' } } },
  { id: 'banner', title: 'A little afterglow', format: 'Campaign banner', owner: 'Theo · Creative owner', summary: 'A companion banner for the fictional evening collection.', versions: { v1: { file: 'banner-v1.svg', change: 'Initial creative · abstract horizon' }, v2: { file: 'banner-v2.svg', change: 'Stronger contrast · revised collection line' } } },
] as const
export const anchorLabels: Record<Anchor, string> = { headline: 'Headline · upper left', artwork: 'Artwork · center', details: 'Details · lower left' }
export const roleLabels: Record<Role, string> = { reviewer: 'Jules · Reviewer', approver: 'Ari · Approver', owner: 'Mira / Theo · Creative owner' }
