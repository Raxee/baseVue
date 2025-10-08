<!-- src/views/welcome/index.vue -->
<template>
  <div class="welcome-container">
    <div class="language-switcher">
      <LanguageSwitcher />
    </div>

    <div class="welcome-content">
      <h1 class="welcome-title">{{ $t('welcome.title') }}</h1>
      <p class="welcome-subtitle">{{ $t('welcome.subtitle') }}</p>

      <div class="features">
        <el-card v-for="(item, index) in features" :key="index" class="feature-card">
          <div class="feature-icon">
            <component :is="item.icon" />
          </div>
          <h3>{{ $t(`features.${index}.title`) }}</h3>
          <p>{{ $t(`features.${index}.description`) }}</p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher/index.vue'
import {
  Monitor,
  Setting,
  User,
  Lock
} from '@element-plus/icons-vue'

const { t } = useI18n()

const features = ref([
  {
    icon: Monitor,
    title: t('features.0.title'),
    description: t('features.0.description')
  },
  {
    icon: Setting,
    title: t('features.1.title'),
    description: t('features.1.description')
  },
  {
    icon: User,
    title: t('features.2.title'),
    description: t('features.2.description')
  },
  {
    icon: Lock,
    title: t('features.3.title'),
    description: t('features.3.description')
  }
])
</script>

<style scoped lang="scss">
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 50px);
  background-color: #f5f7fa;
  padding: 20px;

  .language-switcher {
    margin-bottom: 20px;
    align-self: flex-end;
  }

  .welcome-content {
    max-width: 1200px;
    width: 100%;
    text-align: center;

    .welcome-title {
      font-size: 2.5rem;
      color: #303133;
      margin-bottom: 0.5rem;
    }

    .welcome-subtitle {
      font-size: 1.2rem;
      color: #909399;
      margin-bottom: 2rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 30px;

      .feature-card {
        padding: 20px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--el-color-primary);
        }

        h3 {
          margin: 0.5rem 0;
          color: #303133;
        }

        p {
          margin: 0;
          color: #909399;
          font-size: 0.9rem;
        }
      }
    }
  }
}
</style>