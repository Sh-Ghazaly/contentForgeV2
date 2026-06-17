<template>
  <div class="flex flex-col gap-5">

    <!-- Toolbar -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- Search -->
      <div class="relative flex-1 min-w-[220px]">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" type="text" :placeholder="t('admin.usersPage.searchPlaceholder')"
          class="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-blue-500/40" :class="isDark
            ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500'
            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'" @input="onSearch" />
      </div>

      <!-- Plan Filter -->
      <select v-model="planFilter" @change="fetchUsers(1)"
        class="px-3 py-2.5 rounded-xl text-sm border cursor-pointer focus:outline-none focus:border-blue-500/40" :class="isDark
          ? 'bg-slate-800 border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'">
        <option value="">{{ t('admin.usersPage.allPlans') }}</option>
        <option value="free">{{ t('admin.usersPage.free') }}</option>
        <option value="pro">{{ t('admin.usersPage.pro') }}</option>
        <option value="enterprise">{{ t('admin.usersPage.enterprise') }}</option>
      </select>

      <!-- Total Badge -->
      <div class="text-xs whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        {{ total }} {{ t('admin.usersPage.users') }}
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-2xl border overflow-hidden"
      :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-[13px] min-w-[900px]">
          <thead>
            <tr :class="isDark ? 'bg-white/2' : 'bg-slate-50'">
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.user') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.phone') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.plan') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.trialEnds') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.verified') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.joined') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4 border-b"
                :class="isDark ? 'text-slate-400 border-white/5' : 'text-slate-600 border-slate-200'">
                {{ t('admin.usersPage.table.actions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="7" class="text-center py-12" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.usersPage.loading') }}
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="!users.length">
              <td colspan="7" class="text-center py-12" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.usersPage.noUsers') }}
              </td>
            </tr>

            
            <!-- Users -->
            <tr v-else v-for="u in users" :key="u._id " :class="[
              u.isBlocked ? 'opacity-50' : '',
              u._approving ? 'opacity-40 blur-sm transition-all duration-1500 pointer-events-none' : ''
            ]">
              <!-- User -->
              <td class="py-3 px-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-200'">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold text-white"
                    :class="u.isBlocked
                      ? 'bg-slate-700'
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'">
                    {{ u.name?.[0]?.toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[13px] font-medium flex items-center gap-1.5"
                      :class="isDark ? 'text-white' : 'text-slate-900'">
                      {{ u.name }}
                      <span v-if="u.isAdmin" class="text-[10px] px-1.5 py-0.5 rounded"
                        :class="isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'">
                        {{ t('admin.usersPage.admin') }}
                      </span>
                    </p>
                    <p class="text-[11px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ u.email }}</p>
                    <span v-if="u.deletionRequest?.isAsked"
                      class="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                      :class="isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-700'">
                      {{ t('admin.usersPage.deletionRequested') }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Phone -->
              <td class="py-3 px-4 border-t text-xs"
                :class="isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-600'">
                {{ u.phone || '—' }}
              </td>

              <!-- Plan -->
              <td class="py-3 px-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-200'">
                <span class="text-[11px] px-2 py-0.5 rounded-full font-medium" :class="planClass(u)">
                  {{ planLabel(u) }}
                </span>
              </td>

              <!-- Trial Ends -->
              <td class="py-3 px-4 border-t text-xs"
                :class="isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-600'">
                {{ formatDate(u.planEndsAt) }}
                <span v-if="u.subscriptionType && u.subscriptionType !== 'none'"
                  class="ml-1 text-[10px] px-1.5 py-0.5 rounded font-medium" :class="u.subscriptionType === 'yearly'
                    ? (isDark ? 'bg-teal-500/15 text-teal-400' : 'bg-teal-100 text-teal-700')
                    : (isDark ? 'bg-slate-500/15 text-slate-400' : 'bg-slate-100 text-slate-600')">
                  {{ u.subscriptionType === 'yearly' ? t('admin.usersPage.perYear') : t('admin.usersPage.perMonth') }}
                </span>
              </td>

              <!-- Verified -->
              <td class="py-3 px-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-200'">
                <span
                  class="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold"
                  :class="u.isVerified
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400'">
                  {{ u.isVerified ? '✓' : '!' }}
                </span>
              </td>

              <!-- Joined -->
              <td class="py-3 px-4 border-t text-xs"
                :class="isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-600'">
                {{ formatDate(u.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 border-t" :class="isDark ? 'border-white/5' : 'border-slate-200'">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    class="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="[
                      u.moderation?.blockStatus === 'warning'
                        ? (isDark ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-amber-200 text-amber-700 hover:bg-amber-50')
                        : u.isBlocked
                          ? (isDark ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50')
                          : (isDark ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' : 'border-rose-200 text-rose-700 hover:bg-rose-50')
                    ]" @click="handleBlockAction(u)" :disabled="u.isAdmin">
                    {{ u.moderation?.blockStatus === 'warning' ? t('admin.usersPage.cancelWarning') : u.isBlocked ?
                      t('admin.usersPage.unblock') : t('admin.usersPage.block') }}
                  </button>
                  <button class="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors" :class="isDark
                    ? 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10'
                    : 'border-blue-200 text-blue-700 hover:bg-blue-50'" @click="openEdit(u)">
                    {{ t('admin.usersPage.edit') }}
                  </button>
                  <button
                    class="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    :class="isDark
                      ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/15'
                      : 'border-rose-200 text-rose-700 hover:bg-rose-50'" @click="confirmDelete(u)"
                    :disabled="u.isAdmin">
                    ✕
                  </button>
                  <button v-if="u.deletionRequest?.isAsked"
                    class="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors" :class="isDark
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'" @click="approveDeletion(u)">
                    {{ t('admin.usersPage.approveDeletion') }}
                  </button>
                </div>
                <p v-if="u.moderation?.blockStatus === 'warning' && u.moderation?.gracePeriodExpiresAt"
                  class="text-[10px] mt-1" :class="isDark ? 'text-amber-400' : 'text-amber-600'">
                  {{ t('admin.usersPage.endsIn') }}: {{ getRemainingTime(u.moderation?.gracePeriodExpiresAt) }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="flex items-center justify-center gap-4 py-4 border-t"
        :class="isDark ? 'border-white/5' : 'border-slate-200'">
        <button
          class="text-sm px-3.5 py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="isDark
            ? 'border-white/10 text-white hover:bg-white/5'
            : 'border-slate-200 text-slate-900 hover:bg-slate-50'" :disabled="page === 1"
          @click="fetchUsers(page - 1)">
          ← {{ t('admin.usersPage.prev') }}
        </button>
        <span class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('admin.usersPage.pageOf', { current: page, total: pages }) }}
        </span>
        <button
          class="text-sm px-3.5 py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          :class="isDark
            ? 'border-white/10 text-white hover:bg-white/5'
            : 'border-slate-200 text-slate-900 hover:bg-slate-50'" :disabled="page === pages"
          @click="fetchUsers(page + 1)">
          {{ t('admin.usersPage.next') }} →
        </button>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <TransitionGroup name="toast" tag="div"
        class="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        :class="locale === 'ar'
          ? 'bottom-5 left-5 items-start'
          : 'bottom-5 right-5 items-end'">
        <div v-for="toast in toasts" :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-[340px] w-full sm:w-auto"
          :class="[
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            toast.type === 'warning' ? 'bg-amber-400 text-slate-900' :
            'bg-rose-500 text-white',
            locale === 'ar' ? 'flex-row-reverse text-right' : ''
          ]">
          <span class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-white/25">
            {{ toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '✕' }}
          </span>
          <p class="text-sm font-semibold leading-snug flex-1 m-0">{{ toast.message }}</p>
          <button @click="removeToast(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
            :class="locale === 'ar' ? 'order-first' : ''">✕</button>
        </div>
      </TransitionGroup>
    </Teleport>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="editUser" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="editUser = null">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-md rounded-2xl p-6 shadow-xl border"
            :class="isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ t('admin.usersPage.editUser') }} — {{ editUser.name }}
              </h3>
              <button class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                @click="editUser = null">
                ✕
              </button>
            </div>
           
            <div class="space-y-4">
              <!-- Plan -->
              <div>
                <label class="text-xs font-medium mb-1.5 block" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.usersPage.plan') }}
                </label>
                <select v-model="editForm.plan"
                  class="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-blue-500/40"
                  :class="isDark
                    ? 'bg-slate-900 border-white/10 text-white'
                    : 'bg-white border-slate-200 text-slate-900'">
                  <option value="free">{{ t('admin.usersPage.free') }}</option>
                  <option value="pro">{{ t('admin.usersPage.pro') }}</option>
                  <option value="enterprise">{{ t('admin.usersPage.enterprise') }}</option>
                </select>
              </div>
               <!-- /////اضافة تاريخ الانضمام نوران -->
            <div v-if="!editForm.isAdmin">
              <label class="text-xs font-medium mb-1.5 block" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
    {{ t('admin.usersPage.startDate') }}
  </label>
  <input 
    type="date" 
    v-model="editForm.startDate"
    :min="today" 
    class="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:border-blue-500/40"
    :class="isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'" 
  />
</div>
<div v-if="!editForm.isAdmin"> 
  <label class="text-xs font-medium mb-1.5 block" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
    {{ t('admin.usersPage.subscriptionType') }}
  </label>
  <div class="flex items-center gap-4">
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" v-model="editForm.subscriptionType" value="monthly" 
             class="w-4 h-4 text-blue-600 focus:ring-blue-500" />
      <span class="text-sm">{{ t('admin.usersPage.monthly') }}</span>
    </label>
    
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="radio" v-model="editForm.subscriptionType" value="yearly" 
             class="w-4 h-4 text-blue-600 focus:ring-blue-500" />
      <span class="text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">{{ t('admin.usersPage.annually') }}</span>
    </label>
  </div>
</div>
            
              <!-- Email Verified -->
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.usersPage.emailVerified') }}
                </label>
                <div class="flex items-center gap-2">
                  <input type="checkbox" v-model="editForm.isVerified" id="isVerified" class="w-4 h-4 rounded" />
                  <label for="isVerified" class="text-xs" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                    {{ editForm.isVerified ? t('admin.usersPage.verified') : t('admin.usersPage.notVerified') }}
                  </label>
                </div>
              </div>

              <!-- Is Admin -->
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.usersPage.isAdmin') }}
                </label>
                <input type="checkbox" v-model="editForm.isAdmin" id="is-admin" class="w-4 h-4 rounded" />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" :class="isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" @click="editUser = null">
                {{ t('admin.usersPage.cancel') }}
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                :disabled="saving" @click="saveEdit">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ saving ? t('admin.usersPage.saving') : t('admin.usersPage.saveChanges') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="deleteTarget = null">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-sm rounded-2xl p-6 shadow-xl border"
            :class="isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ t('admin.usersPage.deleteUser') }}
              </h3>
              <button class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
                @click="deleteTarget = null">
                ✕
              </button>
            </div>

            <p class="text-sm mb-6 leading-relaxed" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.usersPage.deleteConfirm', { name: deleteTarget.name }) }}
            </p>

            <div class="flex gap-3">
              <button class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" :class="isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" @click="deleteTarget = null">
                {{ t('admin.usersPage.cancel') }}
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                :disabled="saving" @click="doDelete">
                <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ saving ? t('admin.usersPage.deleting') : t('admin.usersPage.yesDelete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Block Warning Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showReasonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-md rounded-2xl p-6 shadow-xl border"
            :class="isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'">
            <h3 class="text-lg font-semibold mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.usersPage.issueWarning') }}
            </h3>
            <p class="text-sm mb-6 leading-relaxed" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.usersPage.warningDesc') }}
            </p>

            <textarea v-model="blockReason" :placeholder="t('admin.usersPage.warningPlaceholder')" rows="3"
              class="w-full rounded-xl px-4 py-3 text-sm border resize-none focus:outline-none focus:border-blue-500/40 mb-4"
              :class="isDark
                ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'"></textarea>

            <div class="flex gap-3">
              <button class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" :class="isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" @click="closeModal">
                {{ t('admin.usersPage.cancel') }}
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
                :disabled="!blockReason.trim()" @click="submitBlockWarning">
                {{ t('admin.usersPage.confirmWarning') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted , nextTick} from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme.js'
import adminApi from '../../api/adminApi'

const { t, locale } = useI18n()
const { isDark } = useTheme()

const users = ref([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const pages = ref(1)
const search = ref('')
const planFilter = ref('')
const editUser = ref(null)
const editForm = ref({})
const deleteTarget = ref(null)
const saving = ref(false)

const showReasonModal = ref(false)
const blockReason = ref('')
const selectedUser = ref(null)
const toasts = ref([])
let toastIdCounter = 0

function showToast(message, type = 'success', duration = 4000) {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), duration)
}

function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

let searchTimer
// ضيفي المتغير ده في الـ Data أو الـ Setup
const today = new Date().toISOString().split('T')[0];

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchUsers(1), 400)
}

async function fetchUsers(p = 1) {
  loading.value = true
  page.value = p
  try {
    const res = await adminApi.getUsers({ page: p, limit: 6, search: search.value, plan: planFilter.value })

    const fetchedUsers = (res.users || []).filter(u => u.deletionRequest?.isDeleted !== true)
    users.value = fetchedUsers
    total.value = res.total ?? fetchedUsers.length
    pages.value = res.pages || 1
  } finally {
    loading.value = false
  }
}

async function submitBlockWarning() {
  if (!blockReason.value.trim() || !selectedUser.value) return

  const userToUpdate = selectedUser.value

  try {
    const res = await adminApi.blockUser(userToUpdate._id, blockReason.value.trim())

    userToUpdate.isBlocked = res.isBlocked
    if (!userToUpdate.moderation) userToUpdate.moderation = {}
    Object.assign(userToUpdate.moderation, res.moderation)

    closeModal()
    showToast(t('admin.usersPage.warningIssuedSuccess'), 'success')
  } catch (error) {
    console.error("Error saving warning to DB:", error)
    showToast(t('admin.usersPage.warningSyncFailed'), 'error')
  }
}
const componentKey = ref(0);
async function executeToggleBlock(u) {
  // try {
  //   const res = await adminApi.blockUser(u._id)
  //   u.isBlocked = res.isBlocked
  //   if (!u.moderation) u.moderation = {}
  //   Object.assign(u.moderation, res.moderation)
  // } catch (error) {
  //   console.error("Error toggling block:", error)
  // }
//   try {
//     const res = await adminApi.blockUser(u._id);  // ← واحدة بس
//     console.log('res:', res);
//     u.isBlocked = res.isBlocked;
//     u.moderation = res.moderation;
//     const index = users.value.findIndex(user => user._id === u._id);
//     if (index !== -1) {
//   users.value[index].isBlocked = res.isBlocked;
//   users.value[index].moderation = res.moderation;
// }
//     componentKey.value += 1; 
//     if (!res.isBlocked) { // إذا أصبح المستخدم غير محظور
//       try {
//         await emailServices.sendUnblockEmail(u);
//         console.log("تم إرسال إيميل التفعيل للمستخدم");
//       } catch (emailError) {
//         console.error("فشل إرسال الإيميل:", emailError);
//       }
//     }
    
//   } catch (error) {
//     console.error(error);
//   }

  try {
    // نطلب من السيرفر فك الحظر
    const res = await adminApi.blockUser(u._id); 
    
    // تحديث الحالة في الواجهة
    u.isBlocked = res.isBlocked;
    u.moderation = res.moderation;
    
    // تحديث الـ Array
    const index = users.value.findIndex(user => user._id === u._id);
    if (index !== -1) {
      users.value[index].isBlocked = res.isBlocked;
      users.value[index].moderation = res.moderation;
    }
    
    // التحديث التلقائي للجدول
    componentKey.value += 1; 

    // إشعار بسيط للمدير (بما أن السيرفر تكفل بإرسال الإيميل)
    if (!res.isBlocked) {
      showToast(t('admin.usersPage.unblockSuccess'), 'success')
    } else {
      showToast(t('admin.usersPage.blockSuccess'), 'success')
    }
    
  } catch (error) {
    console.error("Error toggling block:", error);
    showToast(t('admin.usersPage.blockToggleError'), 'error')
  }
}


function closeModal() {
  showReasonModal.value = false
  selectedUser.value = null
  blockReason.value = ''
}

function handleBlockAction(u) {
  selectedUser.value = u
  if (u.isBlocked || u.moderation?.blockStatus === 'warning') {
    executeToggleBlock(selectedUser.value)
  } else {
    blockReason.value = ''
    showReasonModal.value = true
  }
}

// في الـ Script الخاص بالـ Vue
const getRemainingTime = (date) => {
  if (!date) return "—";
  
  const targetDate = new Date(date);
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) return "انتهت المدة";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} H : ${minutes} M`;
};

function openEdit(u) {
  editUser.value = u
  editForm.value = {
    plan: u.plan || 'free',
    isTrial: !!u.isTrial,
    startDate: u.planStart ? u.planStart.slice(0, 10) : '',
    isVerified: !!u.isVerified,
    isAdmin: !!u.isAdmin,
    subscriptionType: u.subscriptionType || 'monthly',
  }
}


async function saveEdit() {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // التحقق من startDate
  if (editForm.value.startDate && new Date(editForm.value.startDate) < todayDate) {
    showToast(t('admin.usersPage.startDatePastError'), 'warning')
    return;
  }

  saving.value = true;
  try {
    const willBeAdmin = !!editForm.value.isAdmin;
    const payload = {
      isVerified: editForm.value.isVerified,
      isAdmin: willBeAdmin,
    };

    if (!willBeAdmin) {
      payload.plan = editForm.value.plan;
      if(payload.plan=='free'){
      payload.isTrial = true;
      }
      else{
      payload.isTrial = false;
      }
      payload.startDate = editForm.value.startDate ? new Date(editForm.value.startDate) : null;
      payload.subscriptionType = editForm.value.subscriptionType || 'monthly';
      // لا ترسل planEndsAt هنا!
    }

    const updated = await adminApi.updateUser(editUser.value._id, payload);
    const idx = users.value.findIndex(u => u._id === editUser.value._id);
    if (idx !== -1) users.value[idx] = { ...users.value[idx], ...updated.user };
    editUser.value = null;
    showToast(t('admin.usersPage.saveSuccess'), 'success')
  } catch (error) {
    showToast(t('admin.usersPage.saveError'), 'error')
  } finally {
    saving.value = false;
  }
}
function confirmDelete(u) {
  deleteTarget.value = u
}

async function doDelete() {
  saving.value = true
  try {
    await adminApi.deleteUser(deleteTarget.value._id)
    users.value = users.value.filter(u => u._id !== deleteTarget.value._id)
    total.value -= 1
    deleteTarget.value = null
    showToast(t('admin.usersPage.deleteSuccess'), 'success')
  } catch {
    showToast(t('admin.usersPage.deleteError'), 'error')
  } finally {
    saving.value = false
  }
}

function planLabel(u) {
    if (u.isAdmin) return '—'  // ← ضيفي السطر ده

  if (u.isTrial) {
    const days = Math.ceil((new Date(u.planEndsAt) - Date.now()) / 86400000)
    return days > 0 ? `${t('admin.usersPage.trial')} (${days}${t('admin.usersPage.daysShort')})` : t('admin.usersPage.trialExpired')
  }
  return u.plan || 'free'
}

function planClass(u) {
    if (u.isAdmin) return isDark.value ? 'text-slate-500' : 'text-slate-400'  // ← ده كمان

  if (u.isTrial) {
    const isExpired = new Date(u.planEndsAt) <= Date.now()
    return isExpired
      ? (isDark.value ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-700')
      : (isDark.value ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700')
  }
  if (u.plan === 'pro') return isDark.value ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700'
  if (u.plan === 'enterprise') return isDark.value ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
  return isDark.value ? 'bg-slate-500/15 text-slate-400' : 'bg-slate-100 text-slate-700'
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'
}

async function approveDeletion(u) {
  try {
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], _approving: true }
    }

    await adminApi.approveDeletion(u._id)

    setTimeout(async () => {
      await fetchUsers(page.value)
    }, 1500)

  } catch (err) {
    console.error("Error approving deletion:", err)
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) users.value[idx]._approving = false
  }
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-move {
  transition: transform 0.3s ease;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>