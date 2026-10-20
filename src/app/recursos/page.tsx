import { MarketingIndex } from "@/components/marketing/marketing-index"
import { marketingMetadata } from "@/lib/marketing/seo"

export const metadata = marketingMetadata("/recursos")
export default function Page() { return <MarketingIndex path="/recursos" /> }
