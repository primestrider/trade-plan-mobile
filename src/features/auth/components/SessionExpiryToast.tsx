import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "@/shared/components";

import { useSessionStore } from "../stores/session.store";

/**
 * Announces a session that ended on its own.
 *
 * This exists so the request layer never has to touch React. The interceptor
 * records *why* the session ended; this reads that and says it out loud. A
 * deliberate sign-out is not announced — the user already knows.
 *
 * Renders nothing. Mount it once, inside the toast provider.
 */
export function SessionExpiryToast() {
  const toast = useToast();
  const { t } = useTranslation();

  const reason = useSessionStore((state) => state.signOutReason);
  const clearSignOutReason = useSessionStore(
    (state) => state.clearSignOutReason,
  );

  useEffect(() => {
    if (reason !== "expired") return;

    toast.error(t("utils.error.unauthorized"));
    clearSignOutReason();
  }, [reason, toast, t, clearSignOutReason]);

  return null;
}
