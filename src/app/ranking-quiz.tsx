'use client';
import React, { useMemo, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Eye, Shuffle } from 'lucide-react';
// ---- Types ----
export type QuizOption = {
  id: string; // unique stable ID
  label: string; // text shown to the user
};
export type RankingQuizProps = {
  question: string;
  options: QuizOption[]; // must be length 10 for this task
  correctOrder: string[]; // array of option ids, from rank 1 to 10
};
// ---- Sortable Item ----
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
// ---- Main Component ----
export default function RankingQuizApp(props: Partial<RankingQuizProps>) {
  // Demo defaults if props aren't provided
  const demoOptions: QuizOption[] = [
    { id: 'opt1', label: 'Mount Everest' },
    { id: 'opt2', label: 'K2' },
    { id: 'opt3', label: 'Kangchenjunga' },
    { id: 'opt4', label: 'Lhotse' },
    { id: 'opt5', label: 'Makalu' },
    { id: 'opt6', label: 'Cho Oyu' },
    { id: 'opt7', label: 'Dhaulagiri I' },
    { id: 'opt8', label: 'Manaslu' },
    { id: 'opt9', label: 'Nanga Parbat' },
    { id: 'opt10', label: 'Annapurna I' },
  ];
  // Correct order for the demo (by elevation, 1 → 10)
  const demoCorrect: string[] = [
    'opt1',
    'opt2',
    'opt3',
    'opt4',
    'opt5',
    'opt6',
    'opt7',
    'opt8',
    'opt9',
    'opt10',
  ];
  const question =
    props.question ??
    '次の10個を正しい順位（1位→10位）にドラッグして並べ替えてください';
  const initialOptions = props.options ?? demoOptions;
  const correctOrder = props.correctOrder ?? demoCorrect;
  // State
  const [order, setOrder] = useState<string[]>(() =>
    shuffle(initialOptions.map((o) => o.id))
  );
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );
  // Derived
  const items = useMemo(
    () => order.map((id) => initialOptions.find((o) => o.id === id)!),
    [order, initialOptions]
  );
  const statuses = useMemo(() => {
    if (!checked) return order.map(() => 'neutral' as const);
    return order.map((id, i) =>
      id === correctOrder[i] ? ('correct' as const) : ('incorrect' as const)
    );
  }, [order, correctOrder, checked]);
  const score = useMemo(
    () => statuses.filter((s) => s === 'correct').length,
    [statuses]
  );
  // Handlers
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const oldIndex = prev.indexOf(String(active.id));
      const newIndex = prev.indexOf(String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  }
  function revealAnswer() {
    setOrder([...correctOrder]);
    setRevealed(true);
    setChecked(true);
  }
  function checkAnswer() {
    setChecked(true);
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30 py-10 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              ランキング並べ替えクイズ
            </CardTitle>
            <p className="text-muted-foreground">{question}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  合計 10 項目
                </Badge>
                {checked && (
                  <Badge
                    className={cn(score === 10 ? 'bg-green-600' : 'bg-primary')}
                  >
                    スコア: {score} / 10
                  </Badge>
                )}
                {revealed && <Badge variant="outline">解答を表示中</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={order}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        index={order.indexOf(item.id)}
                        label={item.label}
                        status={statuses[order.indexOf(item.id)]}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setOrder(shuffle([...order]))}
                variant="ghost"
                className="rounded-2xl"
              >
                <Shuffle className="w-4 h-4 mr-2" /> シャッフル
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={checkAnswer} className="rounded-2xl">
                <Check className="w-4 h-4 mr-2" /> 回答をチェック
              </Button>
              <Button
                onClick={revealAnswer}
                variant="outline"
                className="rounded-2xl"
              >
                <Eye className="w-4 h-4 mr-2" /> 解答を表示
              </Button>
            </div>
          </CardFooter>
        </Card>
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>
            ヒント: 各カードをドラッグ &
            ドロップして順位を並べ替え、\"回答をチェック\"で正誤が表示されます。
          </p>
        </div>
      </div>
    </div>
  );
}
// ---- Utils ----
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
