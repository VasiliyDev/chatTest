import { defineStore } from 'pinia';
import {ref, computed, watch} from 'vue';

export interface Message {
  own: boolean,
  message: string,
  new: boolean,
  createdAt: Date;
}
export interface Chat {
  name: string;
  messages: Message[]
}

export const useChatsStore = defineStore('chat', () => {
  const chats = ref<Chat[]>([])
  const currentActiveChat = ref<string | undefined | null>()

  function handleNewMessage(name: string, messageText: string) {
    const now = new Date()
    const newMessage: Message = {
      own: false,
      message: messageText,
      new: name !== currentActiveChat.value,
      createdAt: now
    }

    // Check if chat exists
    const existingChatIndex = chats.value.findIndex(chat => chat.name === name)

    if (existingChatIndex !== -1 && chats.value[existingChatIndex]) {
      // Chat exists, add message to it
      chats.value[existingChatIndex].messages.push(newMessage)
    } else {
      // Chat doesn't exist, create new chat
      const newChat: Chat = {
        name,
        messages: [newMessage]
      }
      chats.value.push(newChat)
    }
  }

  function sendMessage(chatName: string, messageText: string) {
    const now = new Date()
    const newMessage: Message = {
      own: true,
      message: messageText,
      new: false,
      createdAt: now
    }

    const chatIndex = chats.value.findIndex(chat => chat.name === chatName)

    if (chatIndex !== -1 && chats.value[chatIndex]) {
      chats.value[chatIndex].messages.push(newMessage)
    } else {
      // Create new chat if it doesn't exist
      const newChat: Chat = {
        name: chatName,
        messages: [newMessage]
      }
      chats.value.push(newChat)
    }
  }

  function markMessagesAsRead(chatName: string) {
    const chatIndex = chats.value.findIndex(chat => chat.name === chatName)

    if (chatIndex !== -1) {
      if (!chats.value[chatIndex]) return;
      chats.value[chatIndex].messages.forEach(message => {
        message.new = false
      })
    }
  }


  watch(currentActiveChat, (newVal)=> {
    if (!newVal) return;
    markMessagesAsRead(String(newVal))
  })


  const setCurrentActiveChat = (name:string | undefined | null) => {
    currentActiveChat.value = name;
  }

  const getChatByName = (name: string) => {
    return chats.value.find(chat => chat.name === name)
  }

  const getCurrentActiveChat = computed(()=> {
    if (!currentActiveChat.value) return null
    const activeChat = getChatByName(currentActiveChat.value)
    return activeChat
  })

  const chatsList = computed(() => {

    const chatItems = chats.value.map(chat => {
      const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
      const unreadCount = chat.messages.filter(message => message.new).length;


      const lastOwnMessage = [...chat.messages].reverse().find(message => message.own);

      return {
        name: chat.name,
        lastMsg: lastMessage,
        unreadCount: unreadCount,
        lastOwnMessageDate: lastOwnMessage ? lastOwnMessage.createdAt : null,
      };
    });

    return chatItems.sort((a, b) => {
      if (a.lastOwnMessageDate && b.lastOwnMessageDate) {
        return b.lastOwnMessageDate.getTime() - a.lastOwnMessageDate.getTime();
      }

      if (a.lastOwnMessageDate && !b.lastOwnMessageDate) return -1;
      if (!a.lastOwnMessageDate && b.lastOwnMessageDate) return 1;

      return 0;
    });
  });

  return {
    chats,
    handleNewMessage,
    sendMessage,
    setCurrentActiveChat,
    markMessagesAsRead,
    getChatByName,
    getCurrentActiveChat,
    chatsList,
  }
})
