import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
import { Card, CardContent } from '@/components/ui/card';
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const activeOption = activeId
    ? options.find((option) => option.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {options.map((option) => {
              const index = order.indexOf(option.id);
              return (
                <SortableItem
                  key={option.id}
                  id={option.id}
                  index={index}
                  label={option.label}
                  status={statuses[index]}
                  isDraggedOver={activeId !== null && activeId !== option.id}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </SortableContext>
      <DragOverlay
        dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        style={{ willChange: 'transform' }}
      >
        {activeOption ? (
          <DragOverlayItem
            label={activeOption.label}
            index={order.indexOf(activeOption.id)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

type SortableItemProps = {
  id: string;
  index: number;
  label: string;
  status?: 'correct' | 'incorrect' | 'neutral';
  isDraggedOver?: boolean;
};

const SortableItem = ({
  id,
  index,
  label,
  status,
  isDraggedOver,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
    opacity: isDragging ? 0.4 : 1,
    willChange: 'transform',
  };

  return (
    <motion.div
      layout
      layoutId={`item-${id}`}
      ref={setNodeRef}
      style={style}
      className="w-full"
      initial={{ opacity: 0.9, scale: 0.99, y: 4 }}
      animate={{
        opacity: isDraggedOver ? 0.8 : 1,
        scale: isDraggedOver ? 0.99 : 1,
        y: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.6,
      }}
      whileHover={!isDragging ? { scale: 1.01 } : {}}
      whileTap={!isDragging ? { scale: 0.99 } : {}}
    >
      <ItemCard
        attributes={attributes}
        listeners={listeners}
        isDragging={isDragging}
        status={status}
        index={index}
        label={label}
      />
    </motion.div>
  );
};

const ItemCard = ({
  attributes,
  listeners,
  isDragging,
  status,
  index,
  label,
}: {
  attributes: any;
  listeners: any;
  isDragging: boolean;
  status?: 'correct' | 'incorrect' | 'neutral';
  index: number;
  label: string;
}) => (
  <Card
    {...attributes}
    {...listeners}
    className={cn(
      'flex items-center gap-3 px-3 py-2 cursor-grab active:cursor-grabbing rounded-2xl shadow-sm',
      'transition-shadow duration-150 ease-out',
      'hover:shadow-md hover:ring-1 hover:ring-primary/20',
      isDragging && 'shadow-lg ring-2 ring-primary/40',
      status === 'correct' && 'border-green-500/70 bg-green-50/30',
      status === 'incorrect' && 'border-destructive/60 bg-red-50/30'
    )}
    style={{ willChange: 'transform, box-shadow' }}
  >
    <CardContent className="p-0 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="shrink-0 text-base w-9 h-9 rounded-full grid place-items-center transition-colors"
          >
            {index + 1}
          </Badge>
          <p className="text-base sm:text-lg leading-tight select-none">
            {label}
          </p>
        </div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            status !== 'neutral'
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.5,
          }}
        >
          {status === 'correct' && (
            <Check className="w-5 h-5 text-green-600" aria-label="correct" />
          )}
          {status === 'incorrect' && (
            <X className="w-5 h-5 text-red-600" aria-label="incorrect" />
          )}
        </motion.div>
      </div>
    </CardContent>
  </Card>
);

const DragOverlayItem = ({
  label,
  index,
}: {
  label: string;
  index: number;
}) => (
  <motion.div
    className="w-full"
    initial={{ scale: 1.02, rotate: 2 }}
    animate={{ scale: 1.05, rotate: 1 }}
    transition={{ type: 'spring', stiffness: 250, damping: 18, mass: 0.7 }}
  >
    <Card className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-xl border-primary/40 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-0 w-full">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="shrink-0 text-base w-9 h-9 rounded-full grid place-items-center bg-primary text-primary-foreground"
          >
            {index + 1}
          </Badge>
          <p className="text-base sm:text-lg leading-tight select-none font-medium">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
