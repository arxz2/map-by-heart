export const regions = ['world', 'europe', 'americas', 'africa', 'middle-east-central-asia', 'asia-oceania'] as const
export type Region = (typeof regions)[number]
export type CountryRegion = Exclude<Region, 'world'>
