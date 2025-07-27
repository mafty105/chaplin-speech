'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, User, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberStepper } from '@/components/ui/number-stepper'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'

type InputMode = 'count' | 'names'

interface ParticipantInputProps {
  onSubmit: (participants: string[] | number) => void
  isLoading?: boolean
}

export default function ParticipantInput({ onSubmit, isLoading }: ParticipantInputProps) {
  const [inputMode, setInputMode] = useState<InputMode>('count')
  const [participantCount, setParticipantCount] = useState(1)
  const [participantNames, setParticipantNames] = useState<string[]>([''])

  const handleAddName = () => {
    if (participantNames.length < 10) {
      setParticipantNames([...participantNames, ''])
    }
  }

  const handleRemoveName = (index: number) => {
    if (participantNames.length > 1) {
      setParticipantNames(participantNames.filter((_, i) => i !== index))
    }
  }

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...participantNames]
    newNames[index] = value
    setParticipantNames(newNames)
  }

  const handleSubmit = () => {
    if (inputMode === 'count') {
      onSubmit(participantCount)
    } else {
      const validNames = participantNames.filter(name => name.trim() !== '')
      if (validNames.length > 0) {
        onSubmit(validNames)
      }
    }
  }

  const isValid = inputMode === 'count' || participantNames.some(name => name.trim() !== '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-[#6B778C]" />
          参加者の設定
        </CardTitle>
        <CardDescription>
          スピーチ練習に参加する人数または名前を入力してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Mode Selection */}
        <div>
          <h3 className="text-sm font-medium text-[#172B4D] mb-3">入力方法</h3>
          <RadioGroup
            value={inputMode}
            onValueChange={(value) => setInputMode(value as InputMode)}
            disabled={isLoading}
          >
            <RadioGroupItem value="count">人数で指定</RadioGroupItem>
            <RadioGroupItem value="names">名前で指定</RadioGroupItem>
          </RadioGroup>
        </div>

        {/* Input Fields */}
        <AnimatePresence mode="wait">
          {inputMode === 'count' ? (
            <motion.div
              key="count"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-medium text-[#172B4D]">参加人数</h3>
              <div className="flex items-center gap-3">
                <NumberStepper
                  value={participantCount}
                  onChange={setParticipantCount}
                  min={1}
                  max={10}
                  disabled={isLoading}
                />
                <span className="text-[#172B4D] text-base font-medium">人</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="names"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#172B4D]">参加者の名前</h3>
                {participantNames.length < 10 && (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={handleAddName}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    追加
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {participantNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#6B778C]" />
                    <Input
                      placeholder={`参加者 ${index + 1}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    {participantNames.length > 1 && (
                      <Button
                        variant="subtle"
                        size="icon"
                        onClick={() => handleRemoveName(index)}
                        disabled={isLoading}
                        className="h-9 w-9"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B778C]">
                最大10名まで入力できます
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !isValid}
          isLoading={isLoading}
          className="w-full"
          variant="primary"
        >
          セッションを開始
        </Button>
      </CardContent>
    </Card>
  )
}