<template>
  <div class="chat-container q-pa-md" v-if="currentChat">

    <!-- Chat messages area -->
    <div class="chat-messages q-mb-md" ref="messagesContainer">
      <template v-for="(message, index) in currentChat?.messages" :key="index">
        <div
          class="message-wrapper q-mb-sm"
          :class="{ 'justify-end': message.own }"
        >
          <div
            class="message q-pa-sm"
            :class="message.own ? 'message-own' : 'message-other'"
          >
            <div class="message-text">{{ message.message }}</div>
            <div class="message-time text-caption text-grey-7">
              {{ formatTime(message.createdAt) }}
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Message input area -->
    <q-form @submit="sendMessage" class="message-input-container">
      <div class="row">
        <div class="col">
          <q-input
            v-model="newMessage"
            outlined
            dense
            placeholder="Type a message"
            bg-color="white"
            class="message-input"
            autofocus
            ref="messageInput"
            @keydown.enter.prevent="sendMessage"
          />
        </div>
        <div class="col-auto q-ml-sm">
          <q-btn
            type="submit"
            color="primary"
            icon="send"
            round
            flat
            :disable="!newMessage.trim()"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useScroll } from '@vueuse/core'
import { useChatsStore } from "src/store/chats-store"


const chatsStore = useChatsStore()


const currentChat = computed(() => chatsStore.getCurrentActiveChat)
const chatName = computed(() => {
  if (!currentChat?.value?.name) return null
  return currentChat.value.name
})


const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const messageInput = ref(null)


const { y, isScrolling } = useScroll(messagesContainer)


watch(() => currentChat?.value?.messages.length, async () => {
  if (!isScrolling.value) {
    await nextTick()
    scrollToBottom()
  }
})

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}


const formatTime = (date: Date) => {
  if (!date) return ''

  const messageDate = typeof date === 'string' ? new Date(date) : date
  return messageDate
}


const sendMessage = () => {
  if (!newMessage.value.trim() || !chatName.value) return

  chatsStore.sendMessage(chatName.value, newMessage.value)
  newMessage.value = ''

  if (messageInput.value) {
    ;(messageInput.value as any).focus()
  }
}



onMounted(() => {
  if (chatName.value) {
    chatsStore.markMessagesAsRead(chatName.value)
  }
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}


.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 230px);
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message {
  max-width: 80%;
  border-radius: 8px;
  position: relative;
  word-break: break-word;
}

.message-own {
  background-color: #DCF8C6;
  align-self: flex-end;
  border-bottom-right-radius: 0;
}

.message-other {
  background-color: white;
  align-self: flex-start;
  border-bottom-left-radius: 0;
}

.message-time {
  text-align: right;
  font-size: 0.7rem;
  margin-top: 2px;
}

.message-input-container {
  margin-top: auto;
  padding-top: 10px;
}
</style>
