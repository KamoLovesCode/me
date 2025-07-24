"use client"
import { useState } from "react"
import { Mic } from "lucide-react"

export default function GeminiMicButton() {
  const [listening, setListening] = useState(false)

  const handleGeminiClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setListening(true)
      // TODO: Send audio to Gemini backend and play response
      alert("Mic access granted! (Gemini integration pending)")
    } catch (err) {
      alert("Microphone access denied or unavailable.")
    }
  }

  return (
    <button
      className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition flex items-center justify-center"
      aria-label="Gemini Voice"
      onClick={handleGeminiClick}
    >
      <Mic size={18} className="text-white" />
    </button>
  )
}
