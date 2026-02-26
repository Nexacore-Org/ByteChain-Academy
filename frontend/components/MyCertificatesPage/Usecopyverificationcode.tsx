import { useState, useRef } from "react";

type CopyState = "idle" | "copied" | "error";

export function useCopyVerificationCode() {
    const [copyState, setCopyState] = useState<CopyState>("idle");
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = async (fullCode: string) => {
        // Clear any pending timers
        if (revertTimer.current) clearTimeout(revertTimer.current);
        if (errorTimer.current) clearTimeout(errorTimer.current);

        try {
        await navigator.clipboard.writeText(fullCode);
        setCopyState("copied");
        setErrorCode(null);

        revertTimer.current = setTimeout(() => {
            setCopyState("idle");
        }, 2000);
        } catch {
        setCopyState("error");
        setErrorCode(fullCode);

        errorTimer.current = setTimeout(() => {
            setCopyState("idle");
            setErrorCode(null);
        }, 4000);
        }
    };

    return { copyState, errorCode, copy };
}