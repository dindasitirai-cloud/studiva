import { useState, useEffect } from "react"

interface ProfileCardProps {
  name: string
  title: string
  avatarUrl?: string
  backgroundUrl?: string
  childrenCount: number
  updatesCount: number
  consultationsCount: number
  /** 0-100: how far through the current subscription billing period we are. */
  subscriptionProgress: number
}

export function ProfileCard({
  name,
  title,
  avatarUrl,
  backgroundUrl,
  childrenCount,
  updatesCount,
  consultationsCount,
  subscriptionProgress,
}: ProfileCardProps) {
  const [expProgress, setExpProgress] = useState(0)
  const [animatedChildren, setAnimatedChildren] = useState(0)
  const [animatedUpdates, setAnimatedUpdates] = useState(0)
  const [animatedConsultations, setAnimatedConsultations] = useState(0)

  // Animate subscription progress bar
  useEffect(() => {
    const target = Math.max(0, Math.min(100, subscriptionProgress))
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setExpProgress((prev) => {
          if (prev >= target) {
            clearInterval(interval)
            return target
          }
          return prev + 1
        })
      }, 20)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [subscriptionProgress])

  // Animate counters
  useEffect(() => {
    const duration = 1200
    const steps = 30
    const stepDuration = duration / steps

    const childrenIncrement = childrenCount / steps
    const updatesIncrement = updatesCount / steps
    const consultationsIncrement = consultationsCount / steps

    let currentStep = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++
        setAnimatedChildren(Math.min(Math.floor(childrenIncrement * currentStep), childrenCount))
        setAnimatedUpdates(Math.min(Math.floor(updatesIncrement * currentStep), updatesCount))
        setAnimatedConsultations(Math.min(Math.floor(consultationsIncrement * currentStep), consultationsCount))

        if (currentStep >= steps) {
          clearInterval(interval)
        }
      }, stepDuration)
      return () => clearInterval(interval)
    }, 300)

    return () => clearTimeout(timer)
  }, [childrenCount, updatesCount, consultationsCount])

  const initial = name.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="w-full max-w-sm">
      <div className="bg-card rounded-[2rem] shadow-lg overflow-hidden">
        {/* Header background */}
        <div className="relative h-32 bg-gradient-to-br from-sky-start to-sky-end overflow-hidden">
          {backgroundUrl && (
            <img src={backgroundUrl} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>

        {/* Profile content */}
        <div className="px-6 pb-6 -mt-12">
          {/* Avatar */}
          <div className="relative w-24 h-24 mb-4">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-card bg-card shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-skyblue/20 text-3xl font-bold text-navy">
                  {initial}
                </span>
              )}
            </div>
          </div>

          {/* Subscription progress bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground font-light">Subscription</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-skyblue to-gold transition-all duration-300 ease-out"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Name and title */}
          <h2 className="text-2xl font-semibold text-card-foreground mb-2 tracking-tight">{name}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-light">{title}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-border">
            <div className="text-center">
              <div className="text-2xl font-semibold text-card-foreground mb-1">{animatedChildren}</div>
              <div className="text-xs text-muted-foreground font-light">Children</div>
            </div>
            <div className="text-center border-l border-r border-border">
              <div className="text-2xl font-semibold text-card-foreground mb-1">{animatedUpdates}</div>
              <div className="text-xs text-muted-foreground font-light">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-card-foreground mb-1">{animatedConsultations}</div>
              <div className="text-xs text-muted-foreground font-light">Consultations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
