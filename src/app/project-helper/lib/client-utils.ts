import { useEffect, useState } from 'react';

// Helper hook to prevent hydration mismatch by delaying render until client-side
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}

// Helper to create a stable client-side ID
export function useClientId(prefix: string = 'id') {
  const [id, setId] = useState<string | null>(null);
  
  useEffect(() => {
    setId(`${prefix}-${Math.random().toString(36).substring(2, 9)}`);
  }, [prefix]);
  
  return id || undefined; // Return undefined during SSR
}
