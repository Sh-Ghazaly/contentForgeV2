// src/composables/useLimitModal.js
import { ref } from "vue";

// ✅ State عالمي (Singleton)
const isVisible = ref(false);
const modalData = ref({
  type: "general",
  title: "",
  message: "",
});

// ✅ Listen للـ events من interceptor
if (typeof window !== "undefined") {
  window.addEventListener("show-limit-modal", (event) => {
    modalData.value = event.detail;
    isVisible.value = true;
  });
}

export function useLimitModal() {
  function show(data) {
    modalData.value = data;
    isVisible.value = true;
  }

  function hide() {
    isVisible.value = false;
  }

  return {
    isVisible,
    modalData,
    show,
    hide,
  };
}