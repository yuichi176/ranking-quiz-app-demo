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
  useSortable,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export type QuizOption = {
  id: string;
  label: string;
};

type RankingArea = {
  position1: string[];
  position2: string[];
  position3: string[];
  position4: string[];
  position5: string[];
};

type RankingQuizContentProps = {
  allOptions: QuizOption[];
  optionsArea: string[];
  ranking: RankingArea;
  setOptionsArea: React.Dispatch<React.SetStateAction<string[]>>;
  setRanking: React.Dispatch<React.SetStateAction<RankingArea>>;
  statuses: ('correct' | 'incorrect' | 'neutral')[];
};

export default function RankingQuizContent({
  allOptions,
  optionsArea,
  ranking,
  setOptionsArea,
  setRanking,
  statuses,
}: RankingQuizContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const allItemIds = [
    ...optionsArea,
    ...ranking.position1,
    ...ranking.position2,
    ...ranking.position3,
    ...ranking.position4,
    ...ranking.position5,
  ];

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItemId = String(active.id);
    const overContainerId = String(over.id);

    // Find source container
    let sourceContainer: string | null = null;
    if (optionsArea.includes(activeItemId)) {
      sourceContainer = 'options';
    } else if (ranking.position1.includes(activeItemId)) {
      sourceContainer = 'position1';
    } else if (ranking.position2.includes(activeItemId)) {
      sourceContainer = 'position2';
    } else if (ranking.position3.includes(activeItemId)) {
      sourceContainer = 'position3';
    } else if (ranking.position4.includes(activeItemId)) {
      sourceContainer = 'position4';
    } else if (ranking.position5.includes(activeItemId)) {
      sourceContainer = 'position5';
    }

    // Determine target container
    let targetContainer = overContainerId;
    if (allItemIds.includes(overContainerId)) {
      // Dropped on an item, find which container it belongs to
      if (optionsArea.includes(overContainerId)) {
        targetContainer = 'options';
      } else if (ranking.position1.includes(overContainerId)) {
        targetContainer = 'position1';
      } else if (ranking.position2.includes(overContainerId)) {
        targetContainer = 'position2';
      } else if (ranking.position3.includes(overContainerId)) {
        targetContainer = 'position3';
      } else if (ranking.position4.includes(overContainerId)) {
        targetContainer = 'position4';
      } else if (ranking.position5.includes(overContainerId)) {
        targetContainer = 'position5';
      }
    }

    if (sourceContainer === targetContainer) return;

    // Remove from source
    if (sourceContainer === 'options') {
      setOptionsArea((prev) => prev.filter((id) => id !== activeItemId));
    } else if (sourceContainer) {
      setRanking((prev) => ({
        ...prev,
        [sourceContainer]: prev[sourceContainer as keyof RankingArea].filter(
          (id) => id !== activeItemId
        ),
      }));
    }

    // Add to target
    if (targetContainer === 'options') {
      setOptionsArea((prev) => [...prev, activeItemId]);
    } else if (targetContainer?.startsWith('position')) {
      // Only allow one item per ranking position
      setRanking((prev) => {
        const positionKey = targetContainer as keyof RankingArea;
        const currentItem = prev[positionKey][0];

        // Move existing item back to options if there is one
        if (currentItem) {
          setOptionsArea((optPrev) => [...optPrev, currentItem]);
        }

        return {
          ...prev,
          [positionKey]: [activeItemId],
        };
      });
    }
  }

  const activeOption = activeId
    ? allOptions.find((option) => option.id === activeId)
    : null;

  const getRankingStatus = (itemId: string) => {
    const allRankingItems = [
      ...ranking.position1,
      ...ranking.position2,
      ...ranking.position3,
      ...ranking.position4,
      ...ranking.position5,
    ];
    const index = allRankingItems.indexOf(itemId);
    return index >= 0 && index < statuses.length ? statuses[index] : 'neutral';
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="space-y-6">
        {/* Options Area */}
        <DropZone containerId="options" title="選択肢">
          <SortableContext
            items={optionsArea}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {optionsArea.map((itemId) => {
                const option = allOptions.find((o) => o.id === itemId)!;
                return (
                  <DraggleItem
                    key={itemId}
                    id={itemId}
                    label={option.label}
                    status="neutral"
                  />
                );
              })}
            </div>
          </SortableContext>
        </DropZone>

        {/* Ranking Positions */}
        <div className="space-y-3">
          {(
            [
              'position1',
              'position2',
              'position3',
              'position4',
              'position5',
            ] as const
          ).map((positionKey, index) => (
            <div key={positionKey} className="flex items-center gap-4">
              {/* Ranking Number */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
              </div>

              {/* Drop Zone */}
              <div className="flex-1">
                <DropZone containerId={positionKey} title="">
                  <SortableContext
                    items={ranking[positionKey]}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="min-h-[60px] flex items-center">
                      {ranking[positionKey].length > 0 ? (
                        ranking[positionKey].map((itemId) => {
                          const option = allOptions.find(
                            (o) => o.id === itemId
                          )!;
                          return (
                            <DraggleItem
                              key={itemId}
                              id={itemId}
                              label={option.label}
                              status={getRankingStatus(itemId)}
                            />
                          );
                        })
                      ) : (
                        <div className="text-muted-foreground text-sm italic text-center w-full">
                          ここにドラッグしてください
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DropZone>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 150,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {activeOption ? <DragOverlayItem label={activeOption.label} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

// Drop Zone Component
type DropZoneProps = {
  containerId: string;
  title: string;
  children: React.ReactNode;
};

const DropZone = ({ containerId, title, children }: DropZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id: containerId });
  const isRankingPosition = containerId.startsWith('position');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed border-muted-foreground/20 rounded-2xl transition-all duration-200',
        'hover:border-muted-foreground/40',
        isOver && 'border-primary bg-primary/5',
        isRankingPosition ? 'p-3' : 'p-4'
      )}
    >
      {title && (
        <h3
          className={cn(
            'font-semibold mb-3 text-center',
            isRankingPosition ? 'text-base' : 'text-lg'
          )}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Draggable Item Component
type DraggleItemProps = {
  id: string;
  label: string;
  status: 'correct' | 'incorrect' | 'neutral';
};

const DraggleItem = ({ id, label, status }: DraggleItemProps) => {
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
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.6,
      }}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      whileTap={!isDragging ? { scale: 0.98 } : {}}
    >
      <Card
        {...attributes}
        {...listeners}
        className={cn(
          'flex items-center gap-3 px-3 py-2 cursor-grab active:cursor-grabbing rounded-2xl shadow-sm',
          'transition-all duration-150 ease-out',
          'hover:shadow-md hover:ring-1 hover:ring-primary/20',
          isDragging && 'shadow-lg ring-2 ring-primary/40',
          status === 'correct' && 'border-green-500/70 bg-green-50/30',
          status === 'incorrect' && 'border-destructive/60 bg-red-50/30'
        )}
        style={{ willChange: 'transform, box-shadow' }}
      >
        <CardContent className="p-0 w-full">
          <div className="flex justify-between items-center min-h-[40px]">
            <div className="flex items-center gap-2 flex-1">
              <p className="text-xs sm:text-sm leading-tight select-none font-medium text-left break-words">
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
              className="shrink-0 ml-2"
            >
              {status === 'correct' && (
                <Check
                  className="w-4 h-4 text-green-600"
                  aria-label="correct"
                />
              )}
              {status === 'incorrect' && (
                <X className="w-4 h-4 text-red-600" aria-label="incorrect" />
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DragOverlayItem = ({ label }: { label: string }) => (
  <motion.div
    className="w-full"
    initial={{ scale: 1.02, rotate: 2 }}
    animate={{ scale: 1.05, rotate: 1 }}
    transition={{ type: 'spring', stiffness: 250, damping: 18, mass: 0.7 }}
  >
    <Card className="flex items-center gap-3 px-3 py-2 rounded-2xl shadow-xl border-primary/40 bg-background/95 backdrop-blur-sm">
      <CardContent className="p-0 w-full">
        <div className="flex items-center gap-3">
          <p className="text-sm sm:text-base leading-tight select-none font-medium">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
