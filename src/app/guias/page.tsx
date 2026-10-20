import { MarketingIndex } from "@/components/marketing/marketing-index"
import { marketingMetadata } from "@/lib/marketing/seo"

export const metadata = marketingMetadata("/guias")
export default function Page() { return <MarketingIndex path="/guias" /> }
