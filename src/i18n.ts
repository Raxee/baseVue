// src/i18n.ts
import { createI18n } from 'vue-i18n'
import en from './locales/en'
import zh from './locales/zh'

type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'zh'>({
    legacy: false, // 使用 Composition API 模式
    locale: 'en', // 默认语言
    fallbackLocale: 'en', // 回退语言
    messages: {
        en,
        zh
    }
})

export default i18n