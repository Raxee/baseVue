<template>
  <div class="chat-container">
    <el-card class="chat-card">
      <template #header>
        <div class="chat-header">
          <h2>🤖 AI Chat Assistant</h2>
          <div class="chat-type-selector">
            <el-text class="mx-1">Chat Mode:</el-text>
            <el-select
                v-model="chatType"
                placeholder="Select chat mode"
                size="default"
            >
              <el-option
                  v-for="option in chatTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
              />
            </el-select>
          </div>
        </div>
      </template>

      <div class="chat-messages" ref="messagesContainer">
        <!-- 使用 column-reverse 使最新消息显示在底部 -->
        <div class="messages-wrapper">
          <div
              v-for="(message, index) in [...messages].reverse()"
              :key="messages.length - 1 - index"
              :class="['message', message.role]"
          >
            <el-avatar
                :icon="message.role === 'user' ? 'User' : 'Promotion'"
                :class="['avatar', message.role]"
            />
            <div class="message-content-wrapper">
              <div class="message-role">
                {{ message.role === 'user' ? 'You' : 'AI Assistant' }}
              </div>
              <el-card
                  :class="['message-content', message.role]"
                  shadow="never"
              >
                <template v-if="message.loading">
                  <div class="loading-dots">
                    <el-skeleton animated>
                      <template #template>
                        <el-skeleton-item variant="text" style="width: 50%" />
                      </template>
                    </el-skeleton>
                  </div>
                </template>
                <template v-else>
                  <span>{{ message.content }}</span>
                </template>
              </el-card>
            </div>
          </div>
        </div>
      </div>

      <form @submit="handleSubmit" class="chat-input">
        <el-input
            v-model="userInput"
            placeholder="Type your message here..."
            :disabled="isLoading || isStreaming"
            size="large"
            clearable
        >
          <template #append>
            <el-button
                type="primary"
                native-type="submit"
                :disabled="!userInput.trim() || isLoading || isStreaming"
                size="large"
                :loading="isLoading || isStreaming"
                style="width: 150px"
                icon="Promotion"
            >
              {{ isStreaming ? 'Streaming...' : (isLoading ? 'Sending...' : 'Send') }}
            </el-button>
          </template>
        </el-input>
      </form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import request from '@/utils/request'
import { ElCard, ElSelect, ElOption, ElInput, ElButton, ElAvatar, ElSkeleton, ElSkeletonItem, ElText } from 'element-plus'

// Define types
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

interface ChatTypeOption {
  value: string
  label: string
}

// Reactive state
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const chatType = ref('general') // Default chat type
const isStreaming = ref(false)
const isLoading = ref(false)
const chatTypeOptions = ref<ChatTypeOption[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

// Initialize with a welcome message
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: 'Hello! I am your AI assistant. How can I help you today?'
  })

  fetchChatTypes()

  // Scroll to bottom initially
  scrollToBottom()
})

// Scroll to bottom when messages change
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

const scrollToBottom = () => {
  if (messagesContainer.value) {
    // 使用 scrollTo(0, messagesContainer.value.scrollHeight) 确保始终滚动到底部
    messagesContainer.value.scrollTo(0, messagesContainer.value.scrollHeight)
  }
}

// Fetch available chat types from backend
const fetchChatTypes = async () => {
  try {
    const response = await request.get('/prompt/list')
    console.log('Chat types:', response.rows)
    chatTypeOptions.value = response.rows.map((type: any) => ({
      value: type.chatType,
      label: type.chatType
    }))
  } catch (error) {
    console.error('Failed to fetch chat types:', error)
    // Fallback options
    chatTypeOptions.value = [
      { value: 'general', label: 'General' },
    ]
  }
}

// Handle streaming chat
const handleStreamChat = async () => {
  if (!userInput.value.trim()) return

  const userMessage = userInput.value
  messages.value.push({ role: 'user', content: userMessage })
  const loadingIndex = messages.value.length
  // 移除初始的 loading 状态，改为直接显示空内容
  messages.value.push({ role: 'assistant', content: '' })

  userInput.value = ''
  isStreaming.value = true

  try {
    // 使用 EventSource 实现服务端推送
    const eventSource = new EventSource(`${import.meta.env.VITE_APP_BASE_API}/ai/streamChat?chatType=${chatType.value}&userMsg=${encodeURIComponent(userMessage)}`)

    eventSource.onmessage = (event) => {
      // 实时更新消息内容
      if (messages.value[loadingIndex]) {
        messages.value[loadingIndex].content += event.data
        // 每次更新内容后滚动到底部
        nextTick(() => {
          scrollToBottom()
        })
      }
    }

    eventSource.onerror = (err) => {
      console.error('Stream connection error:', err)
      eventSource.close()
      isStreaming.value = false
    }

    // 监听连接关闭事件
    eventSource.addEventListener('end', () => {
      eventSource.close()
      isStreaming.value = false
    })
  } catch (error) {
    console.error('Stream chat error:', error)
    if (messages.value[loadingIndex]) {
      messages.value[loadingIndex].content = 'Sorry, something went wrong with the stream.'
    }
    isStreaming.value = false
  }
}

// Handle form submission
const handleSubmit = (event: Event) => {
  event.preventDefault()
  if (isLoading.value || isStreaming.value) return
  handleStreamChat()
}
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;

  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    color: #303133;
    font-weight: 600;
  }
}

.chat-type-selector {
  display: flex;
  align-items: center;
  gap: 12px;

  :deep(.el-select) {
    width: 180px;
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  // 固定高度
  max-height: 650px;
  overflow: scroll;

  // 使用 column-reverse 使最新消息显示在底部
  .messages-wrapper {
    display: flex;
    flex-direction: column-reverse;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #909399;
  }
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease-in-out;

  &.user {
    flex-direction: row-reverse;

    .message-content-wrapper {
      align-items: flex-end;
    }

    .message-content.user {
      background-color: #409eff;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message-role {
      color: #409eff;
    }
  }

  &.assistant {
    .message-content.assistant {
      background-color: white;
      border: 1px solid #ebeef5;
      border-bottom-left-radius: 4px;
    }

    .message-role {
      color: #67c23a;
    }
  }
}

.avatar {
  flex-shrink: 0;

  &.user {
    background-color: #409eff;
  }

  &.assistant {
    background-color: #67c23a;
  }
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 80%;

  .message-role {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 6px;
    margin-left: 12px;
  }
}

.message-content {
  padding: 0 5px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  &.user {
    border-bottom-right-radius: 4px;
  }

  &.assistant {
    border-bottom-left-radius: 4px;
  }
}

.chat-input {
  padding: 20px;
  background-color: white;
  border-top: 1px solid #ebeef5;

  :deep(.el-input-group__append) {
    padding: 0;
    border: none;
  }

  :deep(.el-button) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

.loading-dots {
  display: flex;
  align-items: center;
  height: 24px;

  :deep(.el-skeleton__item) {
    height: 16px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .chat-container {
    padding: 10px;
    border-radius: 8px;
  }

  .chat-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .chat-type-selector {
    width: 100%;
    justify-content: space-between;

    :deep(.el-select) {
      width: auto;
      flex: 1;
    }
  }

  .message {
    &.user, &.assistant {
      .message-content-wrapper {
        max-width: 75%;
      }
    }
  }

}
</style>
