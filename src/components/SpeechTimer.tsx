'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SpeechTimerProps {
  duration: 1 | 2 | 3 // duration in minutes
}

export function SpeechTimer({ duration }: SpeechTimerProps) {
  const totalSeconds = duration * 60
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleStartStop = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(totalSeconds)
  }

  const formatTime = (seconds: number): string => {
    const isNegative = seconds < 0
    const absSeconds = Math.abs(seconds)
    const minutes = Math.floor(absSeconds / 60)
    const remainingSeconds = absSeconds % 60
    const formatted = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    return isNegative ? `-${formatted}` : formatted
  }

  const getTimeColor = (): string => {
    if (timeLeft < 0) {
      return 'text-[#DE350B]' // danger red for overtime
    } else {
      return 'text-black' // black for all other states
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className={cn(
            "text-5xl font-bold font-mono transition-colors duration-300",
            getTimeColor()
          )}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleStartStop}
              variant="primary"
              size="lg"
              className="min-w-[100px]"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  停止
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  開始
                </>
              )}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="secondary"
              size="lg"
            >
              <RotateCcw className="w-4 h-4" />
              リセット
            </Button>
          </div>
          
          <p className="text-sm text-[#6B778C]">
            スピーチ時間: {duration}分
          </p>
        </div>
      </CardContent>
    </Card>
  )
}