"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Square, Volume2, VolumeX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FloatingVoiceAssistantProps {
  onTranscript?: (text: string) => void
}

export default function FloatingVoiceAssistant({ onTranscript }: FloatingVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isMinimized, setIsMinimized] = useState(true)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const animateAudioLevel = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average / 255)
    
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(animateAudioLevel)
    }
  }

  const startListening = async () => {
    try {
      // Check if browser supports speech recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Setup audio visualization
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      
      // Setup speech recognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        onTranscript?.(transcript)
        await sendToGemini(transcript)
        stopListening()
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        stopListening()
        toast({
          title: "Voice Input Error",
          description: "Could not process your voice. Please try again.",
          variant: "destructive"
        })
      }
      
      recognitionRef.current.onend = () => {
        stopListening()
      }
      
      setIsListening(true)
      recognitionRef.current.start()
      animateAudioLevel()
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening()
        }
      }, 10000)
      
    } catch (err) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setAudioLevel(0)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const interruptGemini = () => {
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const sendToGemini = async (transcript: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/gemini-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: transcript })
      })
      
      if (response.ok) {
        const data = await response.json()
        speakResponse(data.response)
      } else {
        throw new Error('Failed to get response from Gemini')
      }
    } catch (err) {
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    setIsSpeaking(true)
    
    speechSynthesisRef.current = new SpeechSynthesisUtterance(text)
    speechSynthesisRef.current.rate = 0.9
    speechSynthesisRef.current.pitch = 1.0
    speechSynthesisRef.current.volume = 1.0
    
    // Use the best available voice
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      (voice.lang.startsWith('en') && voice.name.includes('Neural'))
    )
    if (preferredVoice) {
      speechSynthesisRef.current.voice = preferredVoice
    }
    
    speechSynthesisRef.current.onend = () => {
      setIsSpeaking(false)
    }
    
    speechSynthesis.speak(speechSynthesisRef.current)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isListening ? 'bg-red-500 animate-pulse' : 
            isProcessing ? 'bg-yellow-500' : 
            isSpeaking ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
          }`}
          style={{
            transform: `scale(${1 + audioLevel * 0.2})`,
            boxShadow: isListening ? `0 0 ${20 + audioLevel * 30}px rgba(239, 68, 68, 0.5)` : '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          {isListening ? (
            <Mic size={24} className="text-white" />
          ) : isProcessing ? (
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
          ) : isSpeaking ? (
            <Volume2 size={24} className="text-white" />
          ) : (
            <Mic size={24} className="text-white" />
          )}
        </button>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-4 w-64 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Voice Assistant</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Square size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isListening ? 'bg-red-500' : isProcessing ? 'bg-yellow-500' : isSpeaking ? 'bg-green-500' : 'bg-purple-600'
              }`}
              style={{
                transform: `scale(${1 + audioLevel * 0.2})`,
              }}
            >
              {isListening ? (
                <Mic size={20} className="text-white" />
              ) : isProcessing ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : isSpeaking ? (
                <Volume2 size={20} className="text-white" />
              ) : (
                <Mic size={20} className="text-white" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {isListening ? "Listening..." : isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : "Ready"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isListening && !isProcessing && !isSpeaking && (
              <button
                onClick={startListening}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs font-medium transition"
              >
                Start Listening
              </button>
            )}
            
            {isListening && (
              <button
                onClick={stopListening}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-xs font-medium transition"
              >
                Stop
              </button>
            )}
            
            {isSpeaking && (
              <button
                onClick={interruptGemini}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-xs font-medium transition"
              >
                Interrupt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
