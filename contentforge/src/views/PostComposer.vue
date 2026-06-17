<template>
  <div class="rounded-2xl theme-surface theme-border p-5 space-y-4">
    <div class="flex items-center gap-3">
      <select v-model="selectedPlatform" class="theme-input rounded-lg px-3 py-2 text-sm">
        <option value="facebook">{{ t('publish.platforms.facebook') }}</option>
        <option value="instagram">{{ t('publish.platforms.instagram') }}</option>
      </select>
    </div>

    <textarea v-model="content.message" rows="3" :placeholder="t('publish.messagePlaceholder')"
      class="w-full theme-input rounded-xl px-3 py-2 text-sm resize-none" />

    <input v-if="selectedPlatform === 'instagram'" v-model="content.imageUrl" type="url"
      :placeholder="t('publish.imageUrlPlaceholder')" class="w-full theme-input rounded-xl px-3 py-2 text-sm" />

    <input v-if="selectedPlatform === 'facebook'" v-model="content.link" type="url"
      :placeholder="t('publish.linkPlaceholder')" class="w-full theme-input rounded-xl px-3 py-2 text-sm" />

    <button @click="publish"
      :disabled="publishing || !content.message || (selectedPlatform === 'instagram' && !content.imageUrl)" class="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium
             hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
      <span v-if="publishing" class="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
      {{ publishing ? t('publish.publishing') : t('publish.publishBtn') }}
    </button>

    <p v-if="result" :class="result.success ? 'text-green-400' : 'text-rose-400'" class="text-xs text-center">
      {{ result.message }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/client'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const selectedPlatform = ref('facebook')
const content = ref({ message: '', imageUrl: '', link: '' })
const publishing = ref(false)
const result = ref(null)

async function publish() {
  publishing.value = true
  result.value = null

  try {
    const endpoint = `/posts/${selectedPlatform.value}`

    const payload = selectedPlatform.value === 'facebook'
      ? {
        message: content.value.message,
        link: content.value.link || undefined
      }
      : {
        imageUrl: content.value.imageUrl,
        caption: content.value.message
      }

    const { data } = await api.post(endpoint, payload)

    result.value = {
      success: true,
      message: t('publish.successMessage', { id: data.postId })
    }
    content.value = { message: '', imageUrl: '', link: '' }

  } catch (err) {
    result.value = {
      success: false,
      message: err.response?.data?.message || t('publish.errorMessage')
    }
  } finally {
    publishing.value = false
  }
}
</script>