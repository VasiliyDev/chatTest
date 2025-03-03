<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useWebSocketService} from 'src/services/websocket'
import {useChatsStore} from "src/store/chats-store";
import SingleChatComponent from "components/SingleChatComponent.vue";
import {screenSize} from "src/helpers/screen-size";
import {storeToRefs} from "pinia";

const chatsStore = useChatsStore()
const {
  connect,
  disconnect,
  isConnected,
  lastError,
  addSocketHandler
} = useWebSocketService()

const curChat = computed(() => chatsStore.getCurrentActiveChat)

const setChat = (name:string) => {
  chatsStore.setCurrentActiveChat(name)
}

const userMinimized = ref<Boolean>(false)


const isDesktop = computed(()=>{
  return screenSize.isLG.value
})

const isMinimized = computed(() => {
  return !isDesktop.value || userMinimized.value === true
})

const toggleMinimized = () => {
  userMinimized.value = !userMinimized.value
}

const {chatsList} = storeToRefs(chatsStore)

const sortedChats = computed(() => {
  const chatsForSorting = [...chatsList.value];
  return chatsForSorting.sort((a, b) => {
    if (a.lastOwnMessageDate && b.lastOwnMessageDate) {
      return b.lastOwnMessageDate.getTime() - a.lastOwnMessageDate.getTime();
    }

    if (a.lastOwnMessageDate && !b.lastOwnMessageDate) return -1;
    if (!a.lastOwnMessageDate && b.lastOwnMessageDate) return 1;

    return 0;
  });
})
addSocketHandler((msg)=>{
  chatsStore.handleNewMessage(msg.message.from, msg.message.message)
})



onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <div class="chat-container">
    <div class="connection-controls">
      <div class="connection-status-wrapper">
        <q-badge :color="isConnected ? 'positive' : 'negative'" class="q-py-xs">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </q-badge>
        <q-btn
          v-if="!isConnected"
          @click="connect"
          color="primary"
          class="q-ml-sm"
          size="sm"
        >
          Connect
        </q-btn>
        <q-btn
          v-else
          @click="disconnect"
          color="negative"
          class="q-ml-sm"
          size="sm"
        >
          Disconnect
        </q-btn>


        <q-btn
          v-if="isDesktop"
          @click="toggleMinimized"
          :icon="isMinimized ? 'expand' : 'compress'"
          flat
          round
          size="sm"
          class="minimize-btn"
        />
      </div>

      <q-banner v-if="lastError" class="bg-negative text-white q-mt-sm">
        {{ lastError }}
      </q-banner>
    </div>

    <div class="main-content">
      <div class="chat-sidebar" :class="{minimized:isMinimized}"  v-if="!isMinimized || !curChat">
        <q-card class="chat-list">
          <q-card-section class="chat-list-header">
            <div class="text-h6">Chats</div>
          </q-card-section>

          <q-scroll-area class="chat-scroll-area">
            <q-card-section
              v-for="chat in sortedChats"
              :key="chat.name"
              class="chat-item"
              :class="{ 'active-chat': curChat?.name === chat.name }"
              @click="setChat(chat.name)"
            >
              <div class="chat-item-content">
                <q-avatar color="primary" text-color="white">
                  {{ chat.name.charAt(0) }}
                </q-avatar>
                <div class="chat-details q-ml-sm">
                  <div class="chat-name">{{ chat.name }}</div>
                  <div class="chat-last-message" v-if="chat.lastMsg?.message">
                    {{chat.lastMsg?.own ? "You" : chat.name}}:
                    {{ chat.lastMsg?.message}}
                  </div>
                  <div class="chat-last-message text-grey-6" v-else>
                    No messages yet
                  </div>
                </div>
              </div>
              <q-badge
                v-if="chat.unreadCount && chat.unreadCount > 0"
                color="red"
                floating
                class="unread-badge"
              >
                {{ chat.unreadCount }}
              </q-badge>
            </q-card-section>

            <q-card-section v-if="!chatsStore.chatsList.length" class="no-chats">
              No chats available
            </q-card-section>
          </q-scroll-area>
        </q-card>
      </div>


      <div class="chat-content" v-if="!isMinimized || curChat">
        <q-card class="chat-display" v-if="curChat">
          <div class="chat-header">
            <div class="chat-title">
              <q-avatar color="primary" text-color="white" size="sm" class="q-mr-sm">
                {{ curChat.name.charAt(0) }}
              </q-avatar>
              {{ curChat.name }}
            </div>

            <q-btn
              v-if="screenSize.isXS"
              icon="arrow_back"
              flat
              round
              size="sm"
              @click="chatsStore.setCurrentActiveChat(null)"
            />
          </div>
          <SingleChatComponent :chat-name="curChat.name"/>
        </q-card>
        <q-card class="empty-chat" v-else-if="!isMinimized">
          <q-card-section class="column items-center justify-center">
            <q-icon name="chat" size="5rem" color="grey-5" />
            <div class="text-h6 q-mt-md">Select a chat to get started</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100svh;
  max-height: 100svh;
  overflow: hidden;
}

.connection-controls {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.connection-status-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.minimize-btn {
  margin-left: auto;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chat-sidebar {
  width: 280px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  &.minimized {
    width:100%;
  }
}

@media (max-width: 992px) {
  .chat-sidebar {
    width: 100%;
  }
}

.chat-content {
  flex: 1;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.chat-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.chat-list, .chat-display, .empty-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-list-header {
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-scroll-area {
  flex: 1;
}

.chat-item {
  cursor: pointer;
  padding: 8px 16px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.chat-item-content {
  display: flex;
  align-items: flex-start;
  width: calc(100% - 30px);
}

.chat-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  max-width:180px;
}

.chat-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-last-message {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chat-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.active-chat {
  background-color: rgba(0, 0, 0, 0.05);
}

.no-chats {
  color: #9e9e9e;
  text-align: center;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.unread-badge {
  margin-right:10px;
  margin-top:10px;
}
</style>
