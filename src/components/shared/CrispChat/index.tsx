"use client"

import Script from "next/script"
import { useEffect } from "react"

const CRISP_WEBSITE_ID = "4c9d3e31-fd44-4366-960e-6a7b44e6c83e"

export function CrispChat() {
  useEffect(() => {
    window.$crisp = window.$crisp || []
    window.$crisp.push(["do", "chat:show"])

    return () => {
      // O SDK continua vivo na navegação SPA; hide sozinho não fecha um chat aberto.
      window.$crisp?.push(["do", "chat:close"])
      window.$crisp?.push(["do", "chat:hide"])
    }
  }, [])

  return (
    <Script id="crisp-chat" strategy="afterInteractive">
      {`window.$crisp = window.$crisp || [];
        window.CRISP_WEBSITE_ID = "${CRISP_WEBSITE_ID}";
        (function () {
          var d = document;
          var s = d.createElement("script");
          s.src = "https://client.crisp.chat/l.js";
          s.async = 1;
          d.getElementsByTagName("head")[0].appendChild(s);
        })();`}
    </Script>
  )
}
