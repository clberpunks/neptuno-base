// frontend/contexts/ErrorContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface ErrorContextType {
  error: Error | null;
  setError: (err: Error | null) => void;
}

const ErrorContext = createContext<ErrorContextType>({ error: null, setError: () => {} });

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}

