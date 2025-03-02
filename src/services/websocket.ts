import {ref} from 'vue'

interface Message {
  from: string
  message: string
}


const TIMEOUT_DELAY = 3000;

interface MessagePayload {
  message: Message
}

export const useWebSocketService = () => {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<Message[]>([])
  const lastError = ref<string>('')

  const socketHandlers = ref<((payload: MessagePayload) => void)[]>([])
  const addSocketHandler = (func: (payload: MessagePayload) => void) => {
    socketHandlers.value.push(func);
  }
  const connect = () => {
    try {
      socket.value = new WebSocket('ws://localhost:8181/ws')
      socket.value.onopen = () => {
        isConnected.value = true
        lastError.value = ''
      }

      socket.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if ('message' in data) {
            const msg = data as MessagePayload
            socketHandlers.value.forEach(handler => handler(msg));
          }
        } catch (e) {
          console.error('Failed to parse message:', e)
        }
      }

      socket.value.onclose = () => {
        isConnected.value = false
        setTimeout(connect, TIMEOUT_DELAY)
      }

      socket.value.onerror = (error) => {
        lastError.value = 'WebSocket error'
        console.error('WebSocket error:', error)
      }
    } catch (e) {
      lastError.value = 'Failed to connect'
      console.error('Connection setup failed:', e)
    }
  }

  const disconnect = () => {
    if (socket.value && isConnected.value) {
      socket.value.close()
      isConnected.value = false
    }
  }

  return {
    connect,
    disconnect,
    isConnected,
    messages,
    lastError,
    addSocketHandler
  }
}
