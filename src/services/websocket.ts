import { ref } from 'vue'
import {useChatsStore} from "src/store/chats-store";

interface Message {
    from: string
    message: string
}



interface MessagePayload {
    message: Message
}

export const useWebSocketService = () => {
    const socket = ref<WebSocket | null>(null)
    const isConnected = ref(false)
    const messages = ref<Message[]>([])
    const lastError = ref<string>('')

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
                        const msg= data as MessagePayload
                        const chatStore = useChatsStore()
                        chatStore.handleNewMessage(msg.message.from, msg.message.message)
                    }
                } catch (e) {
                    console.error('Failed to parse message:', e)
                }
            }

            socket.value.onclose = () => {
                isConnected.value = false
                   setTimeout(connect, 3000)
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
        lastError
    }
}
