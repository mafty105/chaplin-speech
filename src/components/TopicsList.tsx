'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, CheckCircle2, ChevronDown, Loader2, ArrowRight, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { Topic } from '@/types'
import { generateAssociations } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ShareButton from '@/components/ShareButton'
import { cn } from '@/lib/utils'

interface TopicsListProps {
  topics: Topic[]
  participants: number
  hasGenerated?: boolean
  onTopicsUpdate: (topics: Topic[]) => void
}

export default function TopicsList({ topics, participants, hasGenerated = false, onTopicsUpdate }: TopicsListProps) {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTopicClick = async (topic: Topic) => {
    // Toggle expansion
    if (expandedTopic === topic.id) {
      setExpandedTopic(null)
      return
    }

    setExpandedTopic(topic.id)
    
    // Generate associations if not already cached
    if (!topic.associations && !loadingTopic) {
      await generateAssociationsForTopic(topic)
    }
  }

  const generateAssociationsForTopic = async (topic: Topic) => {
    setLoadingTopic(topic.id)
    setError(null)

    try {
      const associations = await generateAssociations(topic.text)
      
      // Update topics with new associations
      const updatedTopics = topics.map(t => 
        t.id === topic.id 
          ? { ...t, associations, associationGeneratedAt: new Date().toISOString() }
          : t
      )
      onTopicsUpdate(updatedTopics)
      
      // Save to session storage
      sessionStorage.setItem('topics', JSON.stringify(updatedTopics))
    } catch (err) {
      setError('連想ワードの生成に失敗しました。')
    } finally {
      setLoadingTopic(null)
    }
  }

  const renderAssociations = (associations: string) => {
    const words = associations.split('→').map(w => w.trim())
    
    return (
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {words.map((word, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <Badge 
              variant={index === 0 ? "primary" : index === words.length - 1 ? "success" : "subtle"}
              size="sm"
            >
              {word}
            </Badge>
            {index < words.length - 1 && (
              <ArrowRight className="w-3 h-3 text-[#6B778C]" />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  if (topics.length === 0) {
    if (!hasGenerated) {
      return null
    }
    
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-[#C1C7D0] mx-auto mb-3" />
          <p className="text-[#6B778C]">
            参加人数を入力して「お題を生成」ボタンをクリックしてください
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-[#6B778C]" />
            お題一覧
          </CardTitle>
          {topics.length > 0 && (
            <ShareButton 
              topics={topics}
              participants={participants}
              disabled={false}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {topics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <button
                onClick={() => handleTopicClick(topic)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded border transition-all duration-200",
                  expandedTopic === topic.id
                    ? "border-[#0052CC] bg-[#DEEBFF] shadow-sm"
                    : "border-[#DFE1E6] hover:border-[#C1C7D0] hover:bg-[#F4F5F7]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-xs text-[#6B778C] font-medium">お題 {index + 1}</span>
                    <h3 className="text-base font-medium text-[#172B4D] mt-0.5">{topic.text}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {topic.associations && (
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        連想済み
                      </Badge>
                    )}
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 text-[#6B778C] transition-transform duration-200",
                        expandedTopic === topic.id && "rotate-180"
                      )}
                    />
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {expandedTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-2">
                      {loadingTopic === topic.id && (
                        <div className="flex items-center gap-2 text-[#6B778C] py-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">連想ワードを生成中...</span>
                        </div>
                      )}
                      
                      {topic.associations && loadingTopic !== topic.id && (
                        <div>
                          <p className="text-xs text-[#6B778C] font-medium">連想ワード:</p>
                          {renderAssociations(topic.associations)}
                        </div>
                      )}

                      {error && expandedTopic === topic.id && (
                        <div className="text-xs text-[#DE350B] bg-[#FFEBE6] border border-[#FFBDAD] px-2 py-1 rounded mt-2">
                          {error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-[#F4F5F7] rounded">
            <p className="text-xs text-[#6B778C] text-center">
              お題をクリックすると連想ワードが表示されます
            </p>
          </div>
          
          {/* Show examples button if topics exist */}
          {topics.length > 0 && (
            <Link href="/examples" className="block">
              <Button variant="primary" className="w-full">
                <Lightbulb className="w-4 h-4 mr-2" />
                スピーチ例を見る
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}