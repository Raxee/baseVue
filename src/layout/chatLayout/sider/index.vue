<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import {computed, onMounted, ref, watch} from 'vue'
import { NButton, NLayoutSider, useDialog } from 'naive-ui'
import {DeleteFilled} from "@element-plus/icons-vue";
import List from './List.vue'
import Footer from './Footer.vue'
import { useChat } from "@/views/chat/hooks/useChat";
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/views/ai/chat/hooks/useBasicLayout'
import { PromptStore } from '@/components/common'
import { t } from '@/locales'
import {createNewSession, delSessionByUserId, getMySession} from "@/api/chat";
import {getUserId, isTourist} from "@/utils/token";
import {ChatContent, ChatSession} from "@/api/interface";
import {ElMessage} from "_element-plus@2.7.7@element-plus";

const appStore = useAppStore()
const chatStore = useChatStore()
const {addChat, formatDateTime} = useChat()
const dialog = useDialog()

const { isMobile } = useBasicLayout()
const show = ref(false)
const ifTourist = ref<boolean>(isTourist());
const collapsed = computed(() => appStore.siderCollapsed)
const createTouristSession = () => {
	const title = t('chat.newChatTitle');
	const uuid = String(new Date().getTime());
	chatStore.clearHistory();
	chatStore.addHistory({ title: title, uuid: uuid, isEdit: false});
	chatStore.setActive(uuid);
}
const createSession = async () => {
  const title = t('chat.newChatTitle')
	const res = await getMySession({
		userId: getUserId(),
		sessionLabel: title,
	});
  const uuid = res.data.uuid
  const chatSessions = res.data.chatSessions
  const chatContents = res.data.chatContents
  chatStore.clearHistory()
  chatSessions.forEach((chatSession: ChatSession) => {
    chatStore.addHistory({ title: chatSession.sessionLabel, uuid: chatSession.id, isEdit: false})
  })
  chatStore.setActive(uuid);
  chatContents.forEach((chatContent: ChatContent) => {
    addChat(
      uuid,
      {
        dateTime: formatDateTime(chatContent.sendTime),
        text: chatContent.message,
        inversion: chatContent.inversion === 1,
        error: false,
        conversationOptions: null,
        requestOptions: { prompt: '', options: null },
      },
    )
  })
	if (isMobile.value)
		appStore.setSiderCollapsed(true)
}
async function handleAdd() {
	if (ifTourist.value) {
		ElMessage.warning("游客无此权限，请登录后进行！")
		return
	}
  const title = t('chat.newChatTitle')
  const res = await createNewSession({
    userId: getUserId(),
    sessionLabel: title,
  })
  const uuid = res.data
  chatStore.addHistory({ title: title, uuid: uuid, isEdit: false})
  chatStore.setActive(uuid);
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

function handleClearAll() {
  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.clearHistoryConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
			if (ifTourist.value) {
				chatStore.clearHistory()
				createTouristSession()
				return
			}
      delSessionByUserId(getUserId());
      chatStore.clearHistory()
      if (isMobile.value)
        appStore.setSiderCollapsed(true)
    },
  })
}
const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})
watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
onMounted(() => {
	if (ifTourist.value) {
		createTouristSession();
	} else {
		createSession()
	}

})
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <NButton dashed block @click="handleAdd">
            {{ $t('chat.newChatButton') }}
          </NButton>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <div class="flex items-center p-4 space-x-4">
<!--          <div class="flex-1">-->
<!--            <NButton block @click="show = true">-->
<!--              {{ $t('store.siderButton') }}-->
<!--            </NButton>-->
<!--          </div>-->
          <el-button style="width: 100%" @click="handleClearAll" type="danger" plain>
						<el-icon><DeleteFilled /></el-icon>
						清除历史对话
          </el-button>
        </div>
      </main>
      <Footer />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 w-full h-full bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
</template>
