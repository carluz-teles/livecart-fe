"use client"

import Script from "next/script"

const CRISP_WEBSITE_ID = "4c9d3e31-fd44-4366-960e-6a7b44e6c83e"

export function CrispChat() {
  return (
    <Script id="crisp-chat" strategy="afterInteractive">
      {`window.$crisp = [];
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
