'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BotMessageSquare, Send, User, Sparkles, AlertCircle, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTIONS = [
  'My PC is running very slow',
  'Blue screen of death BSOD error',
  'Cannot connect to internet',
  'Windows Update stuck',
  'Hard drive making clicking noise',
  'Application crashes on startup',
]

const AI_RESPONSES: Record<string, string> = {
  default: `I'm the IT Repair AI Assistant. I can help with Windows troubleshooting, network issues, hardware diagnostics, and repair recommendations.

**Common quick fixes:**
• Run SFC /scannow to repair corrupted system files
• ipconfig /flushdns to fix DNS/internet issues
• netsh winsock reset for network connectivity problems
• DISM /Online /Cleanup-Image /RestoreHealth for deep system repair

What issue can I help you diagnose today?`,

  slow: `**Slow PC Diagnosis & Fix:**

**Immediate Actions:**
1. Open Task Manager (Ctrl+Shift+Esc) — check CPU/RAM/Disk usage
2. Run **Temp File Cleaner** → Repair Toolkit → Temp File Cleaner
3. Check startup programs — disable Teams, Adobe Updater, OneDrive from startup

**Advanced Fixes:**
• Run \`sfc /scannow\` to repair system files
• Check disk health: \`chkdsk C: /f\` 
• Scan for malware with Windows Defender
• Check for Windows Updates

**Hardware Check:**
• RAM: Run Windows Memory Diagnostic
• Storage: CrystalDiskInfo for SMART data
• Consider upgrading to SSD if on HDD

*Recommendation: Start with the Temp Cleaner + SFC Scan tools in the Repair Toolkit.*`,

  bsod: `**Blue Screen of Death (BSOD) Analysis:**

**Immediate Steps:**
1. Note the error code (e.g., MEMORY_MANAGEMENT, DRIVER_IRQL_NOT_LESS)
2. Boot into Safe Mode if recurring
3. Run \`sfc /scannow\` immediately
4. Run DISM Repair: \`DISM /Online /Cleanup-Image /RestoreHealth\`

**Common BSOD Causes:**
• **0x0000007E** — Driver conflict or hardware issue
• **0x0000003B** — System service exception (run SFC)
• **0xC0000005** — Memory/driver issue
• **0x0000000A** — IRQL mismatch (recent driver install)

**Diagnosis Commands:**
\`\`\`
windbg -y srv*c:\\symbols*https://msdl.microsoft.com/download/symbols -i c:\\windows\\i386 -z c:\\windows\\memory.dmp
\`\`\`

*Check: Event Viewer → Windows Logs → System for crash details*`,

  internet: `**Internet Connectivity Troubleshooting:**

**Step-by-Step Fix:**
1. **DNS Flush** → Use Repair Toolkit DNS Flush tool
2. **Winsock Reset** → Network Reset tool
3. **IP Renew** → IP Release/Renew tool

**Manual Commands:**
\`\`\`
ipconfig /flushdns
netsh winsock reset catalog
netsh int ip reset reset.log
ipconfig /release && ipconfig /renew
\`\`\`

**Check Connectivity:**
• \`ping 8.8.8.8\` — Tests internet (bypasses DNS)
• \`ping google.com\` — Tests DNS resolution
• \`tracert google.com\` — Finds where connection fails

**Firewall Check:**
• Temporarily disable Windows Firewall to test
• Check router admin page for blocked devices`,

  update: `**Windows Update Stuck - Fix:**

**Stop & Restart Update Service:**
\`\`\`
net stop wuauserv
net stop cryptSvc
net stop bits
ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old
net start wuauserv
net start cryptSvc
net start bits
\`\`\`

**If stuck downloading:**
1. Run DISM: \`DISM /Online /Cleanup-Image /RestoreHealth\`
2. Run SFC: \`sfc /scannow\`
3. Use Windows Update Troubleshooter
4. Manual update via Microsoft Update Catalog

**Check disk space:** Updates require at least 10GB free`,

  disk: `**Hard Drive Clicking Noise - URGENT:**

⚠️ **Clicking noise typically indicates imminent drive failure!**

**IMMEDIATE ACTIONS:**
1. **BACK UP DATA NOW** — This is critical
2. Run CrystalDiskInfo to check SMART data
3. Check for Reallocated Sectors Count > 0

**Diagnostic Commands:**
\`\`\`
chkdsk C: /f /r /x
\`\`\`

**Signs of Failure:**
• Clicking = Read/write head hitting platter
• Bad sectors increasing
• SMART errors in Event Viewer

**Recovery:**
• If SMART shows failing — replace drive immediately
• Clone drive using Macrium Reflect before replacement
• Consider SSD upgrade for reliability`,

  crash: `**Application Crash Troubleshooting:**

**Immediate Checks:**
1. Check Event Viewer → Application logs for error codes
2. Run SFC scan for system file corruption
3. Reinstall Visual C++ Redistributables
4. Update GPU and DirectX drivers

**Common Fixes:**
\`\`\`
# Repair .NET Framework
DISM /Online /Enable-Feature /FeatureName:NetFx3
sfc /scannow

# Clean boot (isolate startup conflicts)
msconfig → Services → Hide Microsoft → Disable all
\`\`\`

**If game/graphics app:**
• Update GPU drivers (clean install with DDU)
• Check GPU temperatures (HWiNFO64)
• Verify game files in Steam/launcher

**Memory Test:**
• Run Windows Memory Diagnostic: \`mdsched.exe\``,
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('slow') || lower.includes('lag') || lower.includes('freeze')) return AI_RESPONSES.slow
  if (lower.includes('blue') || lower.includes('bsod') || lower.includes('crash') && lower.includes('screen')) return AI_RESPONSES.bsod
  if (lower.includes('internet') || lower.includes('network') || lower.includes('connect') || lower.includes('wifi') || lower.includes('dns')) return AI_RESPONSES.internet
  if (lower.includes('update') || lower.includes('windows update')) return AI_RESPONSES.update
  if (lower.includes('click') || lower.includes('disk') || lower.includes('hard drive') || lower.includes('storage')) return AI_RESPONSES.disk
  if (lower.includes('crash') || lower.includes('application') || lower.includes('error') || lower.includes('startup')) return AI_RESPONSES.crash
  return `I understand you're experiencing: **"${message}"**

Here are my recommendations:

1. **Start with System Repair** → Run SFC Scan + DISM Repair
2. **Check Event Viewer** → Windows Logs → Application/System
3. **Review recent changes** → New software installs, Windows updates
4. **Check hardware** → Temperatures, SMART data for drives

Would you like me to walk you through a specific diagnostic process? Try describing the exact symptoms (error codes, when it happens, what changed recently).

*Tip: Use the Repair Toolkit to run automated diagnostics with one click.*`
}

function formatMarkdown(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-terminal-cyan mt-2">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="pl-3 text-slate-300">• {line.slice(2)}</p>
      }
      if (line.startsWith('```')) return <div key={i} className="h-1" />
      if (line.match(/^\d+\./)) {
        return <p key={i} className="pl-2 text-slate-300">{line}</p>
      }
      if (line.startsWith('⚠️') || line.startsWith('*')) {
        return <p key={i} className="text-terminal-yellow italic">{line.replace(/^\*|\*$/g, '')}</p>
      }
      if (line === '') return <div key={i} className="h-1" />
      return <p key={i} className="text-slate-300">{line}</p>
    })
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0',
    role: 'assistant',
    content: AI_RESPONSES.default,
    timestamp: new Date(),
  }])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(msg),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, aiMsg])
    setThinking(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-h-[800px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-terminal-purple/15 border border-terminal-purple/30 flex items-center justify-center">
          <BotMessageSquare className="w-5 h-5 text-terminal-purple" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white font-mono">AI ASSISTANT <span className="text-terminal-green">_</span></h1>
          <p className="text-xs text-slate-400 font-mono">IT troubleshooting & repair recommendations</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-terminal-green">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-terminal-green" />
          ONLINE
        </div>
      </motion.div>

      {/* Suggestions */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Lightbulb className="w-3.5 h-3.5 text-terminal-yellow shrink-0" />
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => sendMessage(s)}
            className="text-xs font-mono px-2.5 py-1 rounded-lg bg-terminal-card border border-terminal-border text-slate-400 hover:text-terminal-green hover:border-terminal-border-active transition-all">
            {s}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-terminal-card rounded-xl border border-terminal-border p-4 mb-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-terminal-purple/15 border border-terminal-purple/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-terminal-purple" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs font-mono leading-relaxed space-y-0.5 ${
                msg.role === 'user'
                  ? 'bg-terminal-green/10 border border-terminal-green/20 text-terminal-green'
                  : 'bg-terminal-card-2 border border-terminal-border'
              }`}>
                {msg.role === 'assistant' ? formatMarkdown(msg.content) : <p>{msg.content}</p>}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-terminal-green/15 border border-terminal-green/30 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-terminal-green" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-terminal-purple/15 border border-terminal-purple/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-terminal-purple" />
            </div>
            <div className="bg-terminal-card-2 border border-terminal-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-terminal-purple" />
                ))}
                <span className="text-xs text-slate-500 font-mono ml-1">Analyzing...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Describe your IT issue..."
          className="input-field flex-1 font-mono"
          disabled={thinking}
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => sendMessage()}
          disabled={!input.trim() || thinking}
          icon={<Send className="w-4 h-4" />}
        >
          SEND
        </Button>
      </div>
    </div>
  )
}
