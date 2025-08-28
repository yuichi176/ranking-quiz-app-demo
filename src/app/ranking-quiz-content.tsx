import React from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export type QuizOption = {
  id: string;
  label: string;
};

type RankingQuizContentProps = {
  options: QuizOption[];
  order: string[];
  statuses: ('correct' | 'incorrect' | 'neutral')[];
  setOrder: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function RankingQuizContent({
  options,
  order,
  statuses,
  setOrder,
}: RankingQuizContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {options.map((option) => (
              <SortableItem
                key={option.id}
                id={option.id}
                index={order.indexOf(option.id)}
                label={option.label}
                status={statuses[order.indexOf(option.id)]}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  index,
  label,
  status,
}: {
  id: string;
  index: number;
  label: string;
  status?: 'correct' | 'incorrect' | 'neutral';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <motion.div
      layout
      ref={setNodeRef}
      style={style}
      className="w-full"
      initial={{ opacity: 0.6, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        {...attributes}
        {...listeners}
        className={cn(
          'flex items-center gap-3 px-3 py-2 cursor-grab active:cursor-grabbing rounded-2xl shadow-sm',
          isDragging && 'ring-2 ring-primary/40',
          status === 'correct' && 'border-green-500/70',
          status === 'incorrect' && 'border-destructive/60'
        )}
      >
        <CardContent className="p-0 w-full">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="shrink-0 text-base w-9 h-9 rounded-full grid place-items-center"
            >
              {index + 1}
            </Badge>
            <p className="text-base sm:text-lg leading-tight select-none">
              {label}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-0 ml-auto">
          {status === 'correct' && (
            <Check className="w-5 h-5 text-green-600" aria-label="correct" />
          )}
          {status === 'incorrect' && (
            <X className="w-5 h-5 text-red-600" aria-label="incorrect" />
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
