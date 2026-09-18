import {
  useEffect,
  useState,
} from "react"


const DEFAULT_LOADING_MESSAGES = [
  "Shuffling the shelf...",
  "Rolling for initiative...",
  "Counting meeples...",
  "Consulting the rulebook...",
  "Setting up the table...",
]


type Props = {
  messages?: string[]
  intervalMs?: number
  className?: string
}


function LoadingMessage({
  messages = DEFAULT_LOADING_MESSAGES,
  intervalMs = 1500,
  className,
}: Props) {
  const [index, setIndex] =
    useState(0)

  useEffect(() => {
    if (messages.length <= 1) {
      return
    }

    const timer = setInterval(() => {
      setIndex((current) =>
        (current + 1) % messages.length
      )
    }, intervalMs)

    return () => clearInterval(timer)
  }, [messages, intervalMs])

  return (
    <span
      className={
        className
          ? `loading-message ${className}`
          : "loading-message"
      }
      key={index}
    >
      {messages[index]}
    </span>
  )
}


export default LoadingMessage
