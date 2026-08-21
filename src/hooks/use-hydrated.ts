import { useEffect, useState } from "react";

/** Verdadeiro apenas após a hidratação no navegador. */
export function useHydrated() {
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);
  return hidratado;
}
