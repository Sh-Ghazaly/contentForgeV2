<!-- DraftsPage.vue -->
<template>
  <AppLayout>
    <div class="p-7">

      <!-- Header -->
      <div class="flex items-center justify-between mb-7">
        <div>
          <h1 class="font-display text-xl font-600 theme-text">{{ t('drafts.title') }}</h1>
          <p class="text-xs theme-sub mt-0.5">{{ t('drafts.subtitle', { count: drafts.length }) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 p-1 rounded-xl theme-card theme-border">
            <button v-for="f in filters" :key="f.value"
              @click="activeFilter = f.value"
              class="px-3 py-1.5 rounded-lg text-xs transition-all"
              :class="activeFilter===f.value ? 'bg-blue-600 text-white' : 'theme-sub hover:theme-text'">
              {{ t(f.labelKey) }}
            </button>
          </div>
          <button class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors">
            + {{ t('drafts.newDraft') }}
          </button>
        </div>
      </div>

      <!-- Bulk actions bar -->
      <div v-if="selected.length" class="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20">
        <span class="text-xs text-blue-400 font-medium">{{ t('drafts.selected', { count: selected.length }) }}</span>
        <button @click="approveSelected" class="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-500 transition-colors">{{ t('drafts.approveAll') }}</button>
        <button @click="deleteSelected" class="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 text-xs hover:bg-rose-600/30 transition-colors border border-rose-500/20">{{ t('common.delete') }}</button>
        <button @click="selected=[]" class="ml-auto text-xs theme-muted hover:theme-text">{{ t('drafts.clearSelection') }}</button>
      </div>

      <!-- Drafts list -->
      <div class="space-y-3">
        <div v-for="draft in filteredDrafts" :key="draft.id"
          class="rounded-2xl theme-surface theme-border p-5 hover:border-blue-500/25 transition-all group"
          :class="selected.includes(draft.id) ? 'border-blue-500/40 bg-blue-500/5' : ''">
          <div class="flex items-start gap-4">

            <!-- Checkbox -->
            <div @click="toggleSelect(draft.id)"
              class="w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-colors"
              :class="selected.includes(draft.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-600 hover:border-blue-400'">
              <svg v-if="selected.includes(draft.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="platformClass(draft.platform)">{{ t(`drafts.platform.${draft.platform}`, draft.platform) }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full theme-card theme-border theme-muted">{{ t(`drafts.dialect.${draft.dialectKey}`, draft.dialect) }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="statusClass(draft.status)">{{ t(`drafts.status${draft.status}`) }}</span>
                <span class="text-[10px] theme-muted ml-auto">{{ draft.date }}</span>
              </div>
              <p class="text-sm theme-text leading-relaxed mb-2">{{ draft.copy }}</p>
              <p v-if="draft.arabic" class="text-sm theme-sub leading-relaxed mb-3 font-arabic text-right">{{ draft.arabic }}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <span v-for="tag in draft.hashtags" :key="tag" class="text-[10px] text-blue-400">#{{ tag }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="approveDraft(draft.id)" class="px-3 py-1.5 rounded-lg bg-green-600/15 text-green-400 text-[11px] hover:bg-green-600/25 transition-colors border border-green-500/20">{{ t('drafts.approve') }}</button>
              <button @click="editDraft(draft)" class="px-3 py-1.5 rounded-lg theme-card theme-border theme-sub text-[11px] hover:theme-text transition-colors">{{ t('drafts.edit') }}</button>
              <button @click="deleteDraft(draft.id)" class="px-3 py-1.5 rounded-lg bg-rose-600/10 text-rose-400 text-[11px] hover:bg-rose-600/20 transition-colors border border-rose-500/15">{{ t('common.delete') }}</button>
            </div>
          </div>

          <!-- A/B variant -->
          <div v-if="draft.variantB" class="mt-4 pt-4 border-t" style="border-color:var(--border)">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">⚡ {{ t('drafts.variantBLabel') }}</span>
            </div>
            <p class="text-xs theme-sub leading-relaxed">{{ draft.variantB }}</p>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="editingDraft" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div class="theme-surface rounded-2xl theme-border max-w-lg w-full p-7 theme-shadow">
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-display text-lg font-600 theme-text">{{ t('drafts.editDraft') }}</h2>
            <button @click="editingDraft=null" class="theme-muted hover:theme-text">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{ t('drafts.copyEN') }}</label>
              <textarea v-model="editingDraft.copy" rows="3"
                class="w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                style="border-color:var(--border)"></textarea>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{ t('drafts.copyAR') }}</label>
              <textarea v-model="editingDraft.arabic" rows="3" dir="rtl"
                class="w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-right"
                style="border-color:var(--border)"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs theme-sub mb-1.5 block">{{ t('drafts.platformLabel') }}</label>
                <select v-model="editingDraft.platform" class="w-full theme-input rounded-xl p-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
                  <option v-for="p in platformOptions" :key="p.value" :value="p.value">{{ t(p.labelKey) }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs theme-sub mb-1.5 block">{{ t('drafts.statusLabel') }}</label>
                <select v-model="editingDraft.status" class="w-full theme-input rounded-xl p-2.5 text-sm theme-text border focus:outline-none" style="border-color:var(--border)">
                  <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ t(s.labelKey) }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="editingDraft=null" class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">{{ t('common.cancel') }}</button>
            <button @click="saveDraft" class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors">{{ t('drafts.saveDraft') }}</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import postsApi from '../api/postsApi'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// filters use value (for logic) + labelKey (for display)
const activeFilter = ref('All')
const filters = [
  { value: 'All',      labelKey: 'drafts.filterAll' },
  { value: 'Draft',    labelKey: 'drafts.filterDraft' },
  { value: 'Pending',  labelKey: 'drafts.filterPending' },
  { value: 'Approved', labelKey: 'drafts.statusApproved' },
]

const selected     = ref([])
const editingDraft = ref(null)

// platform & status select options for the edit modal
const platformOptions = [
  { value: 'Instagram',  labelKey: 'drafts.platform.Instagram' },
  { value: 'Facebook',   labelKey: 'drafts.platform.Facebook' },
  { value: 'LinkedIn',   labelKey: 'drafts.platform.LinkedIn' },
  { value: 'Twitter/X',  labelKey: 'drafts.platform.Twitter/X' },
]
const statusOptions = [
  { value: 'Draft',    labelKey: 'drafts.statusDraft' },
  { value: 'Pending',  labelKey: 'drafts.statusPending' },
  { value: 'Approved', labelKey: 'drafts.statusApproved' },
]

// dialectKey maps raw dialect string to a safe i18n key
function toDialectKey(dialect) {
  return {
    'Arabic (EGY)':    'egy',
    'Arabic (Gulf)':   'gulf',
    'Levantine':       'levantine',
    'English':         'english',
    'Bilingual':       'bilingual',
  }[dialect] || dialect
}

const drafts = ref([
  { id:1, platform:'Instagram', dialect:'Arabic (EGY)', dialectKey:'egy', status:'Draft', date:'May 27', copy:'Start your suhoor right — Araby Cold Brew, the morning pick-me-up that keeps you going all day.', arabic:'ابدأ سحورك صح — عربي كولد برو، طاقة الصبح اللي تكمل معاك طول اليوم ☕', hashtags:['سحور','قهوة','رمضان2026'], variantB:'Cold brew for suhoor? Yes. Araby\'s new cold brew hits different at 3 AM — get yours before Ramadan ends.' },
  { id:2, platform:'Facebook',  dialect:'Bilingual',    dialectKey:'bilingual', status:'Pending', date:'May 27', copy:'Family iftar moments hit different with the right coffee. Share yours and tag us 👨‍👩‍👧‍👦', arabic:'لمة العيلة في الإفطار بتبقى أحلى — شاركونا صورتكم 💛', hashtags:['Iftar','إفطار','ArabyCoffee'], variantB:null },
  { id:3, platform:'LinkedIn',  dialect:'English',      dialectKey:'english',   status:'Draft',   date:'May 26', copy:'How we grew Araby Coffee\'s Instagram engagement by 340% during Ramadan 2026 — the full breakdown.', arabic:null, hashtags:['Marketing','ArabBrands','ContentStrategy'], variantB:'We spent $0 on ads and grew 340% this Ramadan. Here\'s exactly what we did (thread).' },
  { id:4, platform:'Instagram', dialect:'Arabic (Gulf)',dialectKey:'gulf',      status:'Pending', date:'May 26', copy:'Weekend promo alert — buy 2 cold brews, get 1 free. This Friday and Saturday only!', arabic:'عرض نهاية الأسبوع — اشتري اثنين واحصل على الثالث مجاناً. الجمعة والسبت فقط! 🎉', hashtags:['عرض','كولدبرو','الخليج'], variantB:null },
  { id:5, platform:'Twitter/X', dialect:'Arabic (EGY)', dialectKey:'egy',      status:'Draft',   date:'May 25', copy:'Poll: which flavor are you choosing for Ramadan this year?', arabic:'تصويت: إيه الطعم اللي هتختاره في رمضان السنة دي؟ 🗳️', hashtags:['تصويت','رمضان','قهوة'], variantB:null },
  { id:6, platform:'Instagram', dialect:'Levantine',    dialectKey:'levantine', status:'Draft',   date:'May 25', copy:'ترند الأسبوع — قهوة الصبح بتكون أحلى مع عربي ☀️', arabic:'ترند الأسبوع — قهوة الصبح بتكون أحلى مع عربي ☀️', hashtags:['ترند','قهوة_الصباح','لبنان'], variantB:null },
])

// ── Load drafts from DB on mount ──────────────────────────────────────────────
onMounted(async () => {
  try {
    const brandId = localStorage.getItem('cf_brandId')
    if (!brandId) return
    const data = await postsApi.getDrafts(brandId)
    if (data?.length) drafts.value = data.map(p => {
      const dialect = p.dialect || 'Arabic (EGY)'
      return {
        id:         p._id,
        platform:   p.platform || 'Instagram',
        dialect,
        dialectKey: toDialectKey(dialect),
        status:     p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Draft',
        date:       new Date(p.scheduledDate || p.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' }),
        copy:       p.copyEN || p.copy || '',
        arabic:     p.copyAR || null,
        hashtags:   p.hashtags || [],
        variantB:   p.variantB || null,
      }
    })
  } catch {
    // API not running — keeps static data
  }
})

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredDrafts = computed(() =>
  activeFilter.value === 'All' ? drafts.value : drafts.value.filter(d => d.status === activeFilter.value)
)

// ── Actions ───────────────────────────────────────────────────────────────────
function toggleSelect(id) {
  const i = selected.value.indexOf(id)
  if (i === -1) selected.value.push(id)
  else selected.value.splice(i, 1)
}

async function approveSelected() {
  for (const id of selected.value) {
    const d = drafts.value.find(x => x.id === id)
    if (d) {
      d.status = 'Approved'
      await postsApi.updatePost(id, { status: 'approved' }).catch(() => {})
    }
  }
  selected.value = []
}

function deleteSelected() {
  const ids = [...selected.value]
  drafts.value = drafts.value.filter(d => !ids.includes(d.id))
  selected.value = []
  ids.forEach(id => postsApi.deletePost(id).catch(() => {}))
}

async function approveDraft(id) {
  const d = drafts.value.find(x => x.id === id)
  if (d) {
    d.status = 'Approved'
    await postsApi.updatePost(id, { status: 'approved' }).catch(() => {})
  }
}

function editDraft(draft) { editingDraft.value = { ...draft } }

async function saveDraft() {
  const i = drafts.value.findIndex(x => x.id === editingDraft.value.id)
  if (i !== -1) drafts.value[i] = { ...editingDraft.value }
  await postsApi.updatePost(editingDraft.value.id, {
    copyEN: editingDraft.value.copy,
    copyAR: editingDraft.value.arabic,
    status: editingDraft.value.status.toLowerCase(),
  }).catch(() => {})
  editingDraft.value = null
}

async function deleteDraft(id) {
  drafts.value = drafts.value.filter(x => x.id !== id)
  await postsApi.deletePost(id).catch(() => {})
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformClass(p) {
  return { Instagram:'bg-pink-500/15 text-pink-400', Facebook:'bg-blue-500/15 text-blue-400', LinkedIn:'bg-blue-700/15 text-blue-300', 'Twitter/X':'bg-sky-500/15 text-sky-400' }[p] || 'bg-slate-500/15 text-slate-400'
}
function statusClass(s) {
  return { Draft:'bg-slate-500/15 text-slate-400', Pending:'bg-amber-500/15 text-amber-400', Approved:'bg-green-500/15 text-green-400' }[s] || ''
}
</script>