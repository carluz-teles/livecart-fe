import { MarketingArticlePage } from "@/components/marketing/marketing-article"
import { marketingMetadata } from "@/lib/marketing/seo"
export const metadata = marketingMetadata("/sobre")
export default function Page() { return <MarketingArticlePage path="/sobre" /> }
