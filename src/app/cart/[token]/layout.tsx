export default function PublicCheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The public checkout opts out of the dashboard's dark mode. The
  // `force-light-theme` wrapper (defined in globals.css) redeclares the
  // light-theme CSS variables for this subtree, so shoppers always see
  // the same UI regardless of their system preference or any `.dark`
  // class active on <html>.
  return <div className="force-light-theme">{children}</div>
}
