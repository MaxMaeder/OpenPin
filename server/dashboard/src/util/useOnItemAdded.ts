import { useEffect, useRef } from "react";

export function useOnItemAdded<T>(
  currentItems: T[],
  onItemAdded: (newItems: T[]) => void
) {
  const prevItemsRef = useRef<T[]>();

  useEffect(() => {
    if (prevItemsRef.current) {
      const prevItems = prevItemsRef.current;
      const added = currentItems.filter((item) => !prevItems.includes(item));

      if (added.length > 0) {
        onItemAdded(added);
      }
    }

    prevItemsRef.current = currentItems;
  }, [currentItems, onItemAdded]);
}
