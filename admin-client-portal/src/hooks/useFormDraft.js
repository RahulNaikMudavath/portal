import { useState, useEffect, useRef, useCallback } from "react";

const DRAFT_PREFIX = "PF_FORM_DRAFT_";

/**
 * useFormDraft Hook
 * Automatically persists form draft state to localStorage to prevent data loss
 * on accidental refresh, tab close, or network disconnection.
 *
 * @param {string} draftKey - Unique key for this form (e.g. "create_task", "add_material_task123")
 * @param {Object} formData - Current form state
 * @param {Function} setFormData - State setter to update form
 * @param {Object} [options] - Configuration options
 * @returns {Object} { isDraftSaved, draftSavedAt, clearDraft, hasRecoveredDraft }
 */
export function useFormDraft(draftKey, formData, setFormData, { debounceMs = 600, enabled = true } = {}) {
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false);
  const isInitialMount = useRef(true);
  const storageKey = `${DRAFT_PREFIX}${draftKey}`;

  // 1. Check & Recover Saved Draft on Initial Mount
  useEffect(() => {
    if (!enabled || !draftKey) return;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data && typeof parsed.data === "object") {
          // Check if there is actual user input inside
          const hasContent = Object.values(parsed.data).some(
            (val) => val && String(val).trim() !== "" && val !== "medium" && val !== "office"
          );

          if (hasContent) {
            setFormData((prev) => ({ ...prev, ...parsed.data }));
            setHasRecoveredDraft(true);
            setDraftSavedAt(parsed.savedAt || new Date().toISOString());
            setIsDraftSaved(true);
            console.log(`[FormDraft] Automatically recovered unsaved draft for: ${draftKey}`);
          }
        }
      }
    } catch (e) {
      console.warn("[FormDraft] Error recovering draft:", e);
    }
  }, [storageKey, draftKey, enabled, setFormData]);

  // 2. Debounced Auto-Save Draft
  useEffect(() => {
    if (!enabled || !draftKey) return;

    // Skip auto-saving on the very first mount cycle
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      try {
        const hasContent = Object.values(formData || {}).some(
          (val) => val && String(val).trim() !== ""
        );

        if (hasContent) {
          const timestamp = new Date().toISOString();
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              data: formData,
              savedAt: timestamp,
            })
          );
          setIsDraftSaved(true);
          setDraftSavedAt(timestamp);
        }
      } catch (err) {
        console.warn("[FormDraft] Failed to auto-save draft:", err);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, storageKey, draftKey, debounceMs, enabled]);

  // 3. Clear Draft (Call upon successful form submit)
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setIsDraftSaved(false);
      setDraftSavedAt(null);
      setHasRecoveredDraft(false);
    } catch (e) {}
  }, [storageKey]);

  return {
    isDraftSaved,
    draftSavedAt,
    clearDraft,
    hasRecoveredDraft,
  };
}

export default useFormDraft;
