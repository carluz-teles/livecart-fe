import { MarketingIndex } from "@/components/marketing/marketing-index"
import { marketingMetadata } from "@/lib/marketing/seo"

export const metadata = marketingMetadata("/casos")
export default function Page() { return <MarketingIndex path="/casos" /> }
