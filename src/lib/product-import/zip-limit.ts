// Check the ZIP directory before SheetJS decompresses XLSX. The upload size
// alone does not bound the memory needed for highly compressed worksheets.
export function checkWorkbookZipSize(buffer: ArrayBuffer) {
  const view = new DataView(buffer)
  if (buffer.byteLength < 4 || view.getUint32(0, true) !== 0x04034b50) return
  let end = -1
  for (
    let i = buffer.byteLength - 22;
    i >= Math.max(0, buffer.byteLength - 65557);
    i--
  ) {
    if (
      view.getUint32(i, true) === 0x06054b50 &&
      i + 22 + view.getUint16(i + 20, true) === buffer.byteLength
    ) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error("Arquivo Excel incompleto ou inválido.")
  const count = view.getUint16(end + 10, true)
  let offset = view.getUint32(end + 16, true),
    total = 0
  if (count > 2000)
    throw new Error(
      "Arquivo Excel com muitos recursos. Salve uma cópia apenas com os dados."
    )
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50)
      throw new Error("Estrutura do arquivo Excel inválida.")
    total += view.getUint32(offset + 24, true)
    if (total > 64 * 1024 * 1024)
      throw new Error(
        "O conteúdo descompactado excede 64 MB. Divida a planilha ou remova imagens e formatação."
      )
    offset +=
      46 +
      view.getUint16(offset + 28, true) +
      view.getUint16(offset + 30, true) +
      view.getUint16(offset + 32, true)
  }
}
