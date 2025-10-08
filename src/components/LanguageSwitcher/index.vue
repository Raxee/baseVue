<!-- src/components/LanguageSwitcher/index.vue -->
<template>
  <div class="language-switcher">
    <el-dropdown @command="handleLanguageChange" trigger="hover">
      <span class="language-switcher__trigger">
        <svg-icon icon-class="language" class="language-icon" />
        <span class="language-text">{{ currentLocaleName }}</span>
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="locale in availableLocales"
              :key="locale"
              :command="locale"
              :class="{ 'is-active': currentLocale === locale }"
          >
            {{ getLocaleDisplayName(locale) }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import SvgIcon from '@/components/SvgIcon/index.vue'

export default defineComponent({
  name: 'LanguageSwitcher',
  components: {
    ArrowDown,
    SvgIcon
  },
  setup() {
    const { locale, availableLocales } = useI18n()
    const currentLocale = ref(locale.value)

    // 显示当前语言的友好名称
    const currentLocaleName = computed(() => {
      return getLocaleDisplayName(currentLocale.value)
    })

    // 获取语言显示名称
    const getLocaleDisplayName = (localeCode: string) => {
      const localeNames: Record<string, string> = {
        'zh': '简体中文',
        'en': 'English',
        'zh-tw': '繁體中文'
      }
      return localeNames[localeCode] || localeCode
    }

    const handleLanguageChange = (newLocale: string) => {
      currentLocale.value = newLocale
      locale.value = newLocale
      localStorage.setItem('userLocale', newLocale)
    }

    return {
      currentLocale,
      currentLocaleName,
      availableLocales: computed(() => availableLocales),
      handleLanguageChange,
      getLocaleDisplayName
    }
  }
})
</script>

<style scoped lang="scss">
.language-switcher {
  display: inline-block;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-color-white);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &__trigger {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 7px; // 比外层小1px保持一致
    transition: all 0.3s;
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .language-icon {
      font-size: 16px;
      margin-right: 6px;
    }

    .language-text {
      font-size: 14px;
      margin-right: 4px;
    }

    .el-icon--right {
      transition: transform 0.3s;
    }

    &:hover .el-icon--right {
      transform: rotate(180deg);
    }
  }
}

.el-dropdown-menu {
  .el-dropdown-item {
    border-radius: 4px;
    margin: 2px 4px;

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 500;
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
