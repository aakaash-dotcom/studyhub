import { Users, FileText, Award, BookOpen } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, hasAnimated])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export default function StatsSection() {
  const stats = [
    { icon: Users, value: 50000, suffix: '+', label: 'Students Helped', description: 'Monthly active learners' },
    { icon: FileText, value: 10000, suffix: '+', label: 'Study Resources', description: 'Notes, papers & materials' },
    { icon: Award, value: 500, suffix: '+', label: 'Exams Covered', description: 'School, entrance & govt' },
    { icon: BookOpen, value: 200, suffix: '+', label: 'Subjects', description: 'All major subjects' },
  ]

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Students Trust StudyHub?
          </h2>
          <p className="text-blue-200 max-w-2xl mx-auto">
            We've been helping students prepare for their exams with quality study materials,
            organized and accessible from Google Drive.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <h3 className="text-white font-semibold mt-2">{stat.label}</h3>
              <p className="text-blue-200 text-sm mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
