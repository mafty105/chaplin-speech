# Next.js App Router Conventions Guide

This document outlines the key conventions and best practices for using Next.js App Router in the ChaplinSpeech project.

## Server vs Client Components

### Server Components (Default)
- All components are Server Components by default
- Can directly access server-side resources (database, file system, etc.)
- Cannot use browser APIs, event handlers, or React hooks like useState/useEffect
- Smaller JavaScript bundle sent to client

```tsx
// Server Component (no 'use client' directive)
export default async function Page() {
  const data = await fetchFromDatabase() // Direct server access
  return <div>{data}</div>
}
```

### Client Components
- Must include `'use client'` directive at the top
- Can use React hooks, browser APIs, and event handlers
- Cannot use async/await at component level
- Props passed from Server to Client components must be serializable

```tsx
'use client'

import { useState } from 'react'

export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

## Server Actions

### Definition
Server Actions are asynchronous functions that run on the server and can be called from Client Components.

```tsx
// app/actions.ts
'use server'

import { redirect } from 'next/navigation'

export async function createItem(formData: FormData) {
  // Server-side logic
  const name = formData.get('name')
  await saveToDatabase(name)
  redirect('/success')
}
```

### Usage in Client Components
```tsx
'use client'

import { createItem } from '@/app/actions'

export default function Form() {
  return (
    <form action={createItem}>
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### With Custom Submit Handlers
```tsx
'use client'

import { useState } from 'react'
import { createItem } from '@/app/actions'

export default function Form() {
  const [isLoading, setIsLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await createItem(formData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form action={handleSubmit}>
      <input name="name" />
      <button disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  )
}
```

## Data Fetching Patterns

### In Server Components
```tsx
// Direct fetch in component
export default async function Page() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store' // or 'force-cache' for static data
  })
  const data = await res.json()
  
  return <div>{data}</div>
}
```

### In Route Handlers
```tsx
// app/api/data/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const data = await fetchData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = await createData(body)
  return NextResponse.json(result)
}
```

## Dynamic Routes

### Basic Dynamic Routes
```
app/
  blog/
    [slug]/
      page.tsx  // matches /blog/anything
```

```tsx
// app/blog/[slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <div>Blog post: {slug}</div>
}
```

### Nested Dynamic Routes
```
app/
  session/
    [sessionId]/
      [participantId]/
        page.tsx
```

```tsx
interface PageProps {
  params: Promise<{
    sessionId: string
    participantId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { sessionId, participantId } = await params
  // Use the params
}
```

## Form Handling Best Practices

### Progressive Enhancement
Forms should work without JavaScript when possible:

```tsx
// Server Action approach (works without JS)
<form action={serverAction}>
  <input name="email" type="email" required />
  <button>Submit</button>
</form>
```

### Client-Side Validation with Server Actions
```tsx
'use client'

export default function Form() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    // Client-side validation
    if (!formData.get('email')) {
      alert('Email required')
      return
    }
    
    // Call server action
    await serverAction(formData)
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## Common Pitfalls to Avoid

### 1. Mixing Server and Client Logic
❌ **Wrong:**
```tsx
'use client'

export default function Component() {
  // This won't work - can't use server-only code in client component
  const data = await fetchFromDatabase()
  return <div>{data}</div>
}
```

✅ **Correct:**
```tsx
// Fetch in server component and pass to client
export default async function Page() {
  const data = await fetchFromDatabase()
  return <ClientComponent data={data} />
}
```

### 2. Non-Serializable Props
❌ **Wrong:**
```tsx
// Passing functions or complex objects to client components
<ClientComponent 
  onClick={() => console.log('clicked')} // Functions can't be serialized
  date={new Date()} // Date objects need to be strings
/>
```

✅ **Correct:**
```tsx
<ClientComponent 
  message="clicked" // Pass data, handle logic in client
  date={new Date().toISOString()} // Serialize dates
/>
```

### 3. Using Browser APIs in Server Components
❌ **Wrong:**
```tsx
export default function ServerComponent() {
  // This will error - window is not defined on server
  const width = window.innerWidth
  return <div>Width: {width}</div>
}
```

✅ **Correct:**
```tsx
'use client'

import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])
  
  return <div>Width: {width}</div>
}
```

## Project-Specific Patterns

### Form with Dynamic Fields
When handling forms with dynamic fields (like participant names):

```tsx
// Extract array fields from FormData
const names: string[] = []
for (let i = 0; i < count; i++) {
  const name = formData.get(`names[${i}]`)
  if (name) names.push(name.toString())
}
```

### Server Action with Redirect
```tsx
'use server'

export async function createSession(data: FormData) {
  const sessionId = await saveSession(data)
  redirect(`/session/${sessionId}`) // Navigation happens server-side
}
```

### Loading States with Server Actions
```tsx
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button disabled={pending}>
      {pending ? 'Loading...' : 'Submit'}
    </button>
  )
}
```

## Redis Integration Pattern
```tsx
// Server-side only
import { redis } from '@/lib/redis'

export async function getSession(id: string) {
  'use server'
  const session = await redis.get(`session:${id}`)
  return session
}
```

## Summary of Key Rules

1. **Default to Server Components** - Only use Client Components when needed
2. **Server Actions** must be in separate files with `'use server'` directive
3. **Forms** can use Server Actions directly with the `action` prop
4. **Dynamic routes** now use Promise-based params in Next.js 15
5. **Data fetching** happens in Server Components or Route Handlers
6. **Client Components** handle interactivity, browser APIs, and React hooks
7. **Props** between Server and Client components must be serializable
8. **Navigation** from Server Actions uses `redirect()` from `next/navigation`

This architecture ensures optimal performance, SEO, and user experience while maintaining clean separation of concerns.