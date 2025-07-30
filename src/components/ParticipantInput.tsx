'use client'

import { useState } from 'react'
import { Users, User, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberStepper } from '@/components/ui/number-stepper'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'

type InputMode = 'count' | 'names'

interface ParticipantInputProps {
  onSubmit: (participants: string[] | number) => void | Promise<void>
}

export default function ParticipantInput({ onSubmit }: ParticipantInputProps) {
  const [inputMode, setInputMode] = useState<InputMode>('count')
  const [isLoading, setIsLoading] = useState(false)
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      if (inputMode === 'count') {
        // Get the count from the NumberStepper value
        const count = formData.get('participantCount')
        await onSubmit(count ? parseInt(count.toString()) : participantCount)
      } else if (inputMode === 'names') {
        // Extract all participant names from the form
        const names: string[] = []
        for (let i = 0; i < participantNames.length; i++) {
          const name = formData.get(`participantNames[${i}]`)
          if (name) {
            names.push(name.toString())
          }
        }
        // Filter out empty names
        const validNames = names.filter(name => name.trim() !== '')
        await onSubmit(validNames.length > 0 ? validNames : participantNames.filter(n => n.trim() !== ''))
      }
    } catch (error: any) {
      console.error('Failed to create session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = inputMode === 'count' || participantNames.some((name) => name.trim() !== '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          参加者の設定
        </CardTitle>
        <CardDescription>スピーチ練習に参加する人数または名前を入力してください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[#172B4D] mb-3">入力方法</h3>
            <RadioGroup
              value={inputMode}
              onValueChange={(value) => setInputMode(value as InputMode)}
            >
              <RadioGroupItem value="count">人数で指定</RadioGroupItem>
              <RadioGroupItem value="names">名前で指定</RadioGroupItem>
            </RadioGroup>
          </div>

          {inputMode === 'count' ? (
            <CountInput
              participantCount={participantCount}
              setParticipantCount={setParticipantCount}
              isLoading={isLoading}
            />
          ) : (
            <NamesInput
              participantNames={participantNames}
              isLoading={isLoading}
              handleAddName={handleAddName}
              handleRemoveName={handleRemoveName}
              handleNameChange={handleNameChange}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !isValid}
            isLoading={isLoading}
            className="w-full"
            variant="primary"
          >
            セッションを開始
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

const CountInput = ({
  participantCount,
  setParticipantCount,
  isLoading,
}: {
  participantCount: number
  setParticipantCount: (count: number) => void
  isLoading: boolean
}) => {
  return (
    <div className="space-y-3">
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
    </div>
  )
}

const NamesInput = ({
  participantNames,
  isLoading,
  handleAddName,
  handleRemoveName,
  handleNameChange,
}: {
  participantNames: string[]
  isLoading: boolean
  handleAddName: () => void
  handleRemoveName: (index: number) => void
  handleNameChange: (index: number, value: string) => void
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#172B4D]">参加者の名前</h3>
        {participantNames.length < 10 && (
          <Button variant="subtle" type="button" size="sm" onClick={handleAddName} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {participantNames.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <Input
              placeholder={`参加者 ${index + 1}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              disabled={isLoading}
              className="flex-1"
              name={`participantNames[${index}]`}
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
      <p className="text-xs">最大10名まで入力できます</p>
    </div>
  )
}
