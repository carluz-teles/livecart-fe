interface FrameProps {
  children: React.ReactNode
}

export function EventDetailFrame({ children }: FrameProps) {
  return <div className="flex flex-col gap-6">{children}</div>
}
