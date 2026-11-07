/* Drag-and-drop list using SortableJS. Children marked className "sortable" can be dragged by their ".drag" handle.
   SortableJS moves the DOM itself; we put it back and let React redraw from the new order (onMove(from, to)). */
import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

export default function SortableList({ as: Tag = 'ol', className, onMove, children, label }) {
  const ref = useRef(null), cb = useRef(onMove);
  cb.current = onMove;
  useEffect(() => {
    const s = Sortable.create(ref.current, {
      handle: '.drag', draggable: '.sortable', animation: 150, ghostClass: 'drag-ghost', chosenClass: 'drag-chosen',
      onEnd(e) {
        const { item, from, oldIndex, newIndex, oldDraggableIndex, newDraggableIndex } = e;
        if (oldIndex === newIndex) return;
        from.removeChild(item); from.insertBefore(item, from.children[oldIndex] || null);
        cb.current(oldDraggableIndex, newDraggableIndex);
      }
    });
    return () => s.destroy();
  }, []);
  return <Tag ref={ref} className={className} aria-label={label}>{children}</Tag>;
}
