import { readSpreadsheet } from "./spreadsheet"

self.onmessage = (
  event: MessageEvent<{
    buffer: ArrayBuffer
    name: string
    delimiter: string
    encoding: string
  }>
) => {
  try {
    const { buffer, name, delimiter, encoding } = event.data
    self.postMessage({
      sheets: readSpreadsheet(buffer, name, delimiter, encoding),
    })
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível ler a planilha.",
    })
  }
}
