"use client"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Square, Play, Pause } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function GeminiMicButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState("")
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  const { toast } = useToast()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  // Animate audio level visualization
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
      
      // Setup MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const audioChunks: BlobPart[] = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await sendToGemini(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      setIsListening(true)
      setTranscript("Listening...")
      mediaRecorderRef.current.start()
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
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
      setAudioLevel(0)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }

  const interruptGemini = () => {
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const sendToGemini = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setTranscript("Processing...")
    
    try {
      // Convert audio to text using Web Speech API as fallback
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(`You said: "${transcript}"`)
        
        // Send to Gemini API
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
      }
      
      recognition.onerror = () => {
        throw new Error('Speech recognition failed')
      }
      
      recognition.start()
      
    } catch (err) {
      setTranscript("Sorry, I couldn't process that. Please try again.")
      toast({
        title: "Processing Error",
        description: "Failed to process your voice input.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text: string) => {
    setIsSpeaking(true)
    setTranscript(`Gemini: ${text}`)
    
    speechSynthesisRef.current = new SpeechSynthesisUtterance(text)
    speechSynthesisRef.current.rate = 0.9
    speechSynthesisRef.current.pitch = 1.0
    speechSynthesisRef.current.volume = 1.0
    
    // Use the best available voice
    const voices = speechSynthesis.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
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
    <>
      <button
        className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition flex items-center justify-center"
        aria-label="Gemini Voice"
        onClick={() => setIsOpen(true)}
      >
        <Mic size={18} className="text-white" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Assistant</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* Voice visualization circle */}
            <div className="relative">
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isListening ? 'bg-red-500' : isProcessing ? 'bg-yellow-500' : isSpeaking ? 'bg-green-500' : 'bg-purple-600'
                }`}
                style={{
                  transform: `scale(${1 + audioLevel * 0.3})`,
                  boxShadow: isListening ? `0 0 ${20 + audioLevel * 30}px rgba(239, 68, 68, 0.5)` : 'none'
                }}
              >
                {isListening ? (
                  <Mic size={32} className="text-white" />
                ) : isProcessing ? (
                  <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
                ) : isSpeaking ? (
                  <Play size={32} className="text-white" />
                ) : (
                  <Mic size={32} className="text-white" />
                )}
              </div>
            </div>

            {/* Status text */}
            <div className="text-center min-h-[60px]">
              <p className="text-sm text-muted-foreground mb-2">
                {isListening ? "Listening..." : isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : "Ready to listen"}
              </p>
              {transcript && (
                <p className="text-sm bg-muted p-3 rounded-lg max-w-sm break-words">
                  {transcript}
                </p>
              )}
            </div>

            {/* Control buttons */}
            <div className="flex gap-3">
              {!isListening && !isProcessing && !isSpeaking && (
                <Button onClick={startListening} className="bg-purple-600 hover:bg-purple-700">
                  <Mic className="w-4 h-4 mr-2" />
                  Start Listening
                </Button>
              )}
              
              {isListening && (
                <Button onClick={stopListening} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              
              {isSpeaking && (
                <Button onClick={interruptGemini} variant="outline">
                  <MicOff className="w-4 h-4 mr-2" />
                  Interrupt
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
