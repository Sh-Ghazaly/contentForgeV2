<template>
  <div
    class="min-h-screen theme-bg flex flex-col"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <!-- Mobile Header (Minimal - only hamburger and logo) -->
    <header
      class="md:hidden sticky top-0 z-30 h-[57px] px-3 flex items-center theme-glass border-b"
      style="border-color: var(--border)"
    >
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="w-8 h-8 rounded-lg theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <RouterLink to="/" class="flex items-center gap-2 ms-3">
        <div
          class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8L7 12L13 4"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="font-display font-700 text-base theme-text"
          >ContentForge</span
        >
      </RouterLink>
      <!-- Mobile notification bell -->
      <div class="relative ms-auto">
        <button
          @click="showNotifDropdown = !showNotifDropdown"
          class="relative p-2"
        >
          <svg
            class="w-5 h-5 theme-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            v-if="unreadCount > 0"
            class="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
          >
            {{ unreadCount > 9 ? "9+" : unreadCount }}
          </span>
        </button>
      </div>
      <!-- Mobile notification dropdown -->
      <Transition name="dropdown-fade">
        <div
          v-if="showNotifDropdown"
          class="fixed top-[57px] left-0 right-0 z-40 theme-surface theme-border shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto"
          style="border: 1px solid var(--border)"
        >
          <div
            class="flex items-center justify-between px-4 py-2.5 border-b"
            style="border-color: var(--border)"
          >
            <p class="text-xs font-semibold theme-text">
              {{ t("layout.notifications.title") || "Notifications" }}
            </p>
            <button
              v-if="unreadCount > 0"
              @click="markAllRead"
              class="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all read
            </button>
          </div>

          <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
            <p class="text-xs theme-muted">
              {{ t("layout.notifications.empty") || "No notifications" }}
            </p>
          </div>

          <div
            v-for="notif in notifications"
            :key="notif._id || notif.id"
            class="px-4 py-3 border-b cursor-pointer transition-colors"
            :class="[!notif.read ? 'bg-blue-500/5' : '']"
            style="border-color: var(--border)"
            @click="handleNotifClick(notif._id || notif.id)"
          >
            <div class="flex items-start gap-2.5">
              <div
                class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                :class="notif.read ? 'bg-transparent' : 'bg-blue-400'"
              ></div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium theme-text truncate">
                  {{ notif.title }}
                </p>
                <p
                  class="text-[11px] theme-sub mt-0.5"
                  :class="expandedNotifId === (notif._id || notif.id) ? '' : 'line-clamp-2'"
                >
                  {{ notif.message }}
                </p>
                <p class="text-[10px] theme-muted mt-1">
                  {{
                    notif.time || new Date(notif.createdAt).toLocaleDateString()
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Desktop Navbar -->
    <header
      class="hidden md:flex theme-glass border-b sticky top-0 z-30 h-[57px] px-4 items-center justify-between"
      style="border-color: var(--border)"
    >
      <div class="flex items-center gap-3 min-w-0">
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <div
            class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="font-display font-700 text-base theme-text"
            >ContentForge</span
          >
        </RouterLink>
        <span style="color: var(--border)" class="shrink-0">|</span>
        <span class="text-sm theme-sub truncate">{{ pageTitle }}</span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Contact us -->
        <RouterLink
          to="/contact"
          class="text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors flex items-center gap-1.5"
        >
          <svg
            class="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {{ t("layout.contactUs") }}
        </RouterLink>

        <!-- Language switcher -->
        <button
          @click="switchLang"
          class="text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors flex items-center gap-1.5"
        >
          <svg
            class="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
            />
          </svg>
          {{ locale === "en" ? "عربي" : "English" }}
        </button>

        <!-- Light/Dark toggle -->
        <button
          @click="toggleTheme"
          class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0"
          :title="isDark ? t('layout.switchLight') : t('layout.switchDark')"
        >
          <svg
            v-if="isDark"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <!-- Notification Bell -->
        <div class="relative">
          <button
            @click="showNotifDropdown = !showNotifDropdown"
            class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0 relative"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
            >
              {{ unreadCount > 9 ? "9+" : unreadCount }}
            </span>
          </button>

          <!-- Dropdown -->
          <Transition name="dropdown-fade">
            <div
              v-if="showNotifDropdown"
              class="absolute top-full mt-2 w-80 rounded-xl theme-surface theme-border shadow-xl overflow-hidden z-50"
              :class="locale === 'ar' ? 'left-0' : 'right-0'"
              style="border: 1px solid var(--border)"
            >
              <div
                class="flex items-center justify-between px-4 py-2.5 border-b"
                style="border-color: var(--border)"
              >
                <p class="text-xs font-semibold theme-text">
                  {{ t("layout.notifications.title") || "Notifications" }}
                </p>
                <button
                  v-if="unreadCount > 0"
                  @click="markAllRead"
                  class="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <div class="max-h-80 overflow-y-auto">
                <div
                  v-if="notifications.length === 0"
                  class="px-4 py-8 text-center"
                >
                  <p class="text-xs theme-muted">
                    {{ t("layout.notifications.empty") || "No notifications" }}
                  </p>
                </div>

                <div
                  v-for="notif in notifications"
                  :key="notif._id || notif.id"
                  class="px-4 py-3 border-b cursor-pointer transition-colors group relative"
                  :class="[
                    !notif.read ? 'bg-blue-500/5' : '',
                    'hover:bg-blue-500/5',
                  ]"
                  style="border-color: var(--border)"
                  @click="handleNotifClick(notif._id || notif.id)"
                >
                  <div class="flex items-start gap-2.5">
                    <div
                      class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      :class="notif.read ? 'bg-transparent' : 'bg-blue-400'"
                    ></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium theme-text truncate">
                        {{ notif.title }}
                      </p>
                      <p
                        class="text-[11px] theme-sub mt-0.5"
                        :class="expandedNotifId === (notif._id || notif.id) ? '' : 'line-clamp-2'"
                      >
                        {{ notif.message }}
                      </p>
                      <p class="text-[10px] theme-muted mt-1">
                        {{
                          notif.time ||
                          new Date(notif.createdAt).toLocaleDateString()
                        }}
                      </p>
                    </div>
                    <button
                      @click.stop="deleteNotif(notif._id || notif.id)"
                      class="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity shrink-0"
                    >
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Avatar with dropdown -->
        <div class="relative">
          <button
            @click="showAvatarMenu = !showAvatarMenu"
            class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0 hover:ring-2 hover:ring-blue-500/30 transition-all"
          >
            {{ authStore.userInitial }}
          </button>

          <!-- Dropdown menu -->
          <Transition name="dropdown-fade">
            <div
              v-if="showAvatarMenu"
              class="absolute top-full mt-2 w-56 rounded-xl theme-surface theme-border shadow-xl overflow-hidden z-50"
              :class="locale === 'ar' ? 'left-0' : 'right-0'"
              style="border: 1px solid var(--border)"
            >
              <!-- User info header -->
              <div
                class="px-4 py-3 border-b"
                style="border-color: var(--border)"
              >
                <p class="text-sm font-medium theme-text truncate">
                  {{ authStore.userName }}
                </p>
                <p class="text-[11px] theme-sub truncate mt-0.5">
                  {{ authStore.user?.email }}
                </p>
              </div>

              <!-- Menu items -->
              <div class="py-1.5">
                <RouterLink
                  to="/profile"
                  @click="showAvatarMenu = false"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-xs theme-sub hover:theme-text hover:bg-blue-500/5 transition-colors"
                >
                  <svg
                    class="w-4 h-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {{ t("layout.nav.profile") }}
                </RouterLink>
              </div>

              <!-- Divider -->
              <div class="border-t" style="border-color: var(--border)"></div>

              <!-- Logout -->
              <button
                @click="authStore.logout()"
                class="flex items-center gap-2.5 px-4 py-2.5 text-xs theme-sub hover:text-rose-400 hover:bg-rose-500/5 transition-colors w-full text-start"
              >
                <svg
                  class="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {{ t("layout.logout") }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- BODY -->
    <div class="flex flex-1" style="min-height: 0">
      <!-- Mobile sidebar backdrop -->
      <Transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 z-30 bg-black/50 md:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>

      <!-- SIDEBAR -->
      <aside
        class="fixed top-[57px] z-40 md:z-auto w-56 border-e flex flex-col py-5 px-3 shrink-0 theme-sidebar overflow-y-auto scrollbar-thin transition-transform duration-300"
        :class="
          sidebarOpen
            ? 'translate-x-0'
            : locale === 'ar'
              ? 'translate-x-full md:translate-x-0'
              : '-translate-x-full md:translate-x-0'
        "
        style="height: calc(100vh - 57px); border-color: var(--border)"
        v-show="sidebarOpen || isDesktop"
      >
   <!-- Nav items -->
<nav class="space-y-0.5 flex-1">
  <!-- ✅ Unlocked items (RouterLink) -->
  <RouterLink 
    v-for="item in unlockedNavItems" 
    :key="item.path" 
    :to="item.path" 
    @click="sidebarOpen = false"
    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all group" 
    :class="[
      $route.path === item.path
        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
        : 'theme-sub hover:theme-text border border-transparent hover:bg-blue-500/5',
    ]"
  >
    <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
    </svg>
    {{ item.label }}
    <span v-if="item.badgeKey && sidebarStats[item.badgeKey]"
      class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
      {{ sidebarStats[item.badgeKey] }}
    </span>
  </RouterLink>

  <!-- ✅ Locked items (div with click handler) -->
  <div
    v-for="item in lockedNavItems"
    :key="item.path"
    @click="!item.comingSoon && $router.push('/payment')"
    class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all group theme-muted cursor-pointer hover:theme-text opacity-70 border border-transparent hover:bg-amber-500/5 relative"
    :class="{ 'cursor-not-allowed': item.comingSoon }"
  >
    <!-- 🔒 Lock icon overlay -->
    <div class="relative">
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
      </svg>
      <svg 
        class="w-2.5 h-2.5 text-amber-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    </div>
    
    <span>{{ item.label }}</span>
    
    <!-- ✅ Badge: PRO أو Coming Soon -->
    <span 
      v-if="item.comingSoon"
      class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold"
    >
      {{ t('layout.comingSoon') || 'Coming Soon' }}
    </span>
    <span 
      v-else
      class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
    >
      PRO
    </span>
  </div>
</nav>

        <!-- Quick stats -->
        <div class="mt-4 p-3 rounded-xl theme-card theme-border space-y-2">
          <div class="flex items-center justify-between mb-1">
            <p
              class="text-[10px] theme-muted font-medium uppercase tracking-wider"
            >
              {{ currentMonth }}
            </p>
            <svg
              v-if="statsLoading"
              class="w-3 h-3 animate-spin text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <div
            v-for="s in stats"
            :key="s.labelKey"
            class="flex justify-between items-center"
          >
            <span class="text-[11px] theme-sub">{{ t(s.labelKey) }}</span>
            <span class="text-[11px] font-medium" :class="s.color">{{
              s.value
            }}</span>
          </div>
        </div>

        <!-- Mobile only extra items -->
        <div class="flex flex-col gap-1 px-1 pb-2 mt-3 md:hidden">
          <div class="border-t my-2" style="border-color: var(--border)"></div>

          <!-- Contact us -->
          <RouterLink
            to="/contact"
            @click="sidebarOpen = false"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:theme-text transition-colors w-full"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {{ t("layout.contactUs") }}
          </RouterLink>

          <!-- Localization toggle -->
          <button
            @click="switchLang"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:theme-text transition-colors w-full text-start"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
              />
            </svg>
            {{ locale === "en" ? "عربي" : "English" }}
          </button>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:theme-text transition-colors w-full text-start"
          >
            <svg
              v-if="isDark"
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            {{ isDark ? t("layout.switchLight") : t("layout.switchDark") }}
          </button>

          <!-- Log out -->
          <button
            @click="authStore.logout()"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs theme-sub hover:text-rose-400 transition-colors w-full text-start"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {{ t("layout.logout") }}
          </button>
        </div>
      </aside>

      <!-- PAGE CONTENT -->
      <main class="flex-1 overflow-y-auto scrollbar-thin min-w-0 md:ms-56">
        <slot />
      </main>
    </div>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          @click.self="showDeleteModal = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

          <div
            class="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl theme-surface p-6 sm:p-8 theme-shadow max-h-[95vh] overflow-y-auto"
            style="border: 1px solid var(--border)"
          >
            <div class="flex items-start gap-4 mb-6">
              <div
                class="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"
              >
                <svg
                  class="w-5 h-5 text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <div class="space-y-1">
                <h3 class="font-display text-lg font-600 theme-text">
                  {{ t("layout.deleteModal.title") }}
                </h3>
                <p class="text-sm theme-sub leading-relaxed">
                  {{ t("layout.deleteModal.desc") }}
                </p>
              </div>
            </div>

            <div class="space-y-2 mb-6">
              <textarea
                v-model="deleteReason"
                rows="4"
                :placeholder="t('layout.deleteModal.reasonPlaceholder')"
                class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40 leading-relaxed"
                style="border-color: var(--border)"
              />
            </div>

            <p
              v-if="deleteError"
              class="text-sm text-rose-400 mb-6 bg-rose-500/10 py-2.5 px-4 rounded-xl border border-rose-500/15"
            >
              {{ deleteError }}
            </p>

            <div
              v-if="deleteSuccess"
              class="text-sm text-emerald-400 mb-6 bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/15"
            >
              {{ t("layout.deleteModal.success") }}
            </div>

            <div class="flex gap-3 w-full items-center justify-center">
              <button
                @click="
                  showDeleteModal = false;
                  deleteReason = '';
                  deleteError = null;
                  deleteSuccess = false;
                "
                class="flex-1 w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-colors"
              >
                {{ t("common.cancel") }}
              </button>
              <button
                @click="submitDeletion"
                :disabled="deleteLoading || deleteSuccess"
                class="flex-1 w-full py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg
                  v-if="deleteLoading"
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {{
                  deleteLoading
                    ? t("layout.deleteModal.sending")
                    : t("layout.deleteModal.confirm")
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
     <!-- ✅ أضف هذا في النهاية -->
    <LimitModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme.js";
import { useLang } from "../composables/useLang.js";
import { useAuthStore } from "../stores/authStore";
import api from "../api/client";
import LimitModal from './LimitModal.vue'
import { useCalendarStore } from "../stores/calendarStore";

const route = useRoute();
const authStore = useAuthStore();
const calendarStore = useCalendarStore();
const { isDark, toggle: toggleTheme } = useTheme();
const { locale, switchLang } = useLang();
const { t } = useI18n();

// Add reactive data
const notifications = ref([]);
const unreadCount = ref(0);
const showNotifDropdown = ref(false);
const notifLoading = ref(false);
const expandedNotifId = ref(null);

const sidebarOpen = ref(false);
const showAvatarMenu = ref(false);
const statsLoading = ref(false);

watch(
  () => route.path,
  () => {
    sidebarOpen.value = false;
    showAvatarMenu.value = false;
  },
);

const isDesktop = ref(window.innerWidth >= 768);
function onResize() {
  isDesktop.value = window.innerWidth >= 768;
  if (!isDesktop.value) showAvatarMenu.value = false;
}
onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));

const currentMonth = computed(() =>
  new Date().toLocaleString(locale.value === "ar" ? "ar-EG" : "en-US", {
    month: "long",
    year: "numeric",
  }),
);

const pageTitle = computed(() => {
  const map = {
    "/dashboard": t("layout.nav.calendar"),
    "/drafts": t("layout.nav.drafts"),
    "/branding": t("layout.nav.branding"),
    "/chat": t("layout.nav.chat"),
    "/connections": t("layout.nav.connections"),
    "/payment": t("layout.nav.payment"),
    "/profile": t("layout.nav.profile"),
  };
  return map[route.path] || t("layout.nav.calendar");
});

const sidebarStats = ref({ calendars: 0, drafts: 0 });
const stats = ref([
  { labelKey: "layout.stats.generated", value: "…", color: "text-blue-400" },
  { labelKey: "layout.stats.approved", value: "…", color: "text-green-400" },
  { labelKey: "layout.stats.scheduled", value: "…", color: "text-blue-400" },
  { labelKey: "layout.stats.published", value: "…", color: "text-teal-400" },
]);

async function fetchStats() {
  if (!localStorage.getItem("cf_token")) return;
  statsLoading.value = true;
  try {
    const data = await api.get("/stats");
    stats.value = [
      {
        labelKey: "layout.stats.generated",
        value: String(data.generated ?? 0),
        color: "text-blue-400",
      },
      {
        labelKey: "layout.stats.approved",
        value: String(data.approved ?? 0),
        color: "text-green-400",
      },
      {
        labelKey: "layout.stats.scheduled",
        value: String(data.scheduled ?? 0),
        color: "text-blue-400",
      },
      {
        labelKey: "layout.stats.published",
        value: String(data.published ?? 0),
        color: "text-teal-400",
      },
    ];
    sidebarStats.value = {
      calendars: data.calendars ?? 0,
      drafts: data.generated ?? 0,
    };
  } catch {
    /* keep defaults */
  } finally {
    statsLoading.value = false;
  }
}

onMounted(async () => {
  if (localStorage.getItem('cf_token')) {
    fetchStats()
    
    // ✅ حدّث الـ user data من الـ backend
    try {
      const freshUser = await authStore.refreshUser()
      console.log('User refreshed on mount:', freshUser)
    } catch (err) {
      console.error('Failed to refresh user on mount:', err)
    }
  } else {
    setTimeout(fetchStats, 300)
  }
})
watch(() => calendarStore.posts, fetchStats, { deep: true });
watch(() => authStore.user?._id, fetchStats);
watch(
  () => authStore.user?._id,
  (newId) => {
    if (newId) fetchNotifications();
  },
);

// ✅ Check if user is on Free plan
const isNotProOrEnterprise = computed(() => {
  const plan = authStore.user?.plan || 'free';
  return plan !== 'pro' && plan !== 'enterprise';
});

// ✅ Check if user is NOT on Enterprise plan
const isNotEnterprise = computed(() => {
  const plan = authStore.user?.plan || 'free';
  return plan !== 'enterprise';
});

const navItems = computed(() => [
  { label: t('layout.nav.calendar'), path: '/dashboard', badgeKey: 'calendars', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: t('layout.nav.drafts'), path: '/drafts', badgeKey: 'drafts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: t('layout.nav.branding'), path: '/branding', badgeKey: null, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { label: t('layout.nav.chat'), path: '/chat', badgeKey: null, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { label: t('layout.nav.connections'), path: '/connections', badgeKey: null, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  
  // ✅ Poster - مقفول للـ Free users فقط (PRO feature)
  { 
    label: t('layout.nav.poster'), 
    path: '/poster', 
    badgeKey: null, 
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    locked: isNotProOrEnterprise.value,  // 🔒 مقفول لغير Pro/Enterprise
    comingSoon: false
  },
  
  // ✅ AI Reels - مقفول لغير Enterprise + Coming Soon
  { 
    label: t('layout.nav.aiReels'), 
    path: '/ai-reels', 
    badgeKey: null, 
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    locked: isNotEnterprise.value,  // 🔒 مقفول لغير Enterprise
    comingSoon: true
  },
  
  { label: t('layout.nav.payment'), path: '/payment', badgeKey: null, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { label: t('layout.nav.profile'), path: '/profile', badgeKey: null, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
])

const unlockedNavItems = computed(() => {
  let items = navItems.value.filter(item => !item.locked)
  
  if (isDesktop.value) {
    items = items.filter(item => item.path !== '/profile')
  }
  
  return items
})

const lockedNavItems = computed(() => {
  return navItems.value.filter(item => item.locked)
})

const showDeleteModal = ref(false);
const deleteReason = ref("");
const deleteLoading = ref(false);
const deleteError = ref(null);
const deleteSuccess = ref(false);

async function submitDeletion() {
  deleteLoading.value = true;
  deleteError.value = null;
  try {
    await api.post("/auth/deletion-request", { reason: deleteReason.value });
    deleteSuccess.value = true;
    setTimeout(() => {
      showDeleteModal.value = false;
      deleteReason.value = "";
      deleteSuccess.value = false;
    }, 2000);
  } catch (err) {
    deleteError.value = err.message || t("layout.deleteModal.error");
  } finally {
    deleteLoading.value = false;
  }
}

// Handle notification click: expand on first click, mark read on second
function handleNotifClick(notifId) {
  if (expandedNotifId.value === notifId) {
    // Already expanded → mark as read
    if (!notifications.value.find((x) => (x._id || x.id) === notifId)?.read) {
      markRead(notifId);
    }
    expandedNotifId.value = null;
  } else {
    // Expand it
    expandedNotifId.value = notifId;
  }
}

// Fetch notifications
async function fetchNotifications() {
  notifLoading.value = true;
  try {
    const res = await api.get("/notifications");
    notifications.value = res.notifications || [];
    unreadCount.value = res.unreadCount || 0;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  } finally {
    notifLoading.value = false;
  }
}

// Mark single as read
async function markRead(notifId) {
  try {
    await api.patch(`/notifications/${notifId}/read`);
    const n = notifications.value.find(
      (x) => x._id === notifId || x.id === notifId,
    );
    if (n) n.read = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch (err) {
    console.error("Mark read failed:", err);
  }
}

// Mark all as read
async function markAllRead() {
  try {
    await api.patch("/notifications/read-all");
    notifications.value.forEach((n) => (n.read = true));
    unreadCount.value = 0;
  } catch (err) {
    console.error("Mark all read failed:", err);
  }
}

// Delete notification
async function deleteNotif(notifId) {
  try {
    await api.delete(`/notifications/${notifId}`);
    notifications.value = notifications.value.filter(
      (x) => (x._id || x.id) !== notifId,
    );
    unreadCount.value = notifications.value.filter((n) => !n.read).length;
  } catch (err) {
    console.error("Delete notification failed:", err);
  }
}

// Poll every 30 seconds
let notifInterval;
onMounted(() => {
  fetchNotifications();
  notifInterval = setInterval(fetchNotifications, 30000);
});
onUnmounted(() => {
  if (notifInterval) clearInterval(notifInterval);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform 0.25s ease;
}

.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>