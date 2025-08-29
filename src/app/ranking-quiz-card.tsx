'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import RankingQuizContent from '@/app/ranking-quiz-content';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const initialOptions = [
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
const correctOrder = [
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

export const RankingQuizCard = () => {
  const [checked, setChecked] = useState(false);
  const [optionsArea, setOptionsArea] = useState<string[]>(() =>
    shuffle(initialOptions.map((o) => o.id))
  );
  const [ranking, setRanking] = useState<{
    position1: string[];
    position2: string[];
    position3: string[];
    position4: string[];
    position5: string[];
  }>({
    position1: [],
    position2: [],
    position3: [],
    position4: [],
    position5: [],
  });

  const allOptions = useMemo(() => initialOptions, []);

  const getRankingArray = useMemo(() => {
    return [
      ...ranking.position1,
      ...ranking.position2,
      ...ranking.position3,
      ...ranking.position4,
      ...ranking.position5,
    ];
  }, [ranking]);

  const statuses = useMemo(() => {
    if (!checked) return getRankingArray.map(() => 'neutral' as const);
    return getRankingArray.map((id, i) =>
      id === correctOrder[i] ? ('correct' as const) : ('incorrect' as const)
    );
  }, [getRankingArray, correctOrder, checked]);

  const score = useMemo(
    () => statuses.filter((s) => s === 'correct').length,
    [statuses]
  );

  function checkAnswer() {
    // TODO: send anwer to server
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
            <p className="text-muted-foreground">
              オプションエリアから上位5つを予想して、1位〜5位にドラッグして並べてください
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {checked && (
                  <Badge
                    className={cn(score === 5 ? 'bg-green-600' : 'bg-primary')}
                  >
                    スコア: {score} / 5
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RankingQuizContent
              allOptions={allOptions}
              optionsArea={optionsArea}
              ranking={ranking}
              setOptionsArea={setOptionsArea}
              setRanking={setRanking}
              statuses={statuses}
            />
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
            <div className="flex gap-2">
              <Button
                onClick={checkAnswer}
                className="rounded-2xl cursor-pointer"
              >
                <Check className="w-4 h-4" /> 送信
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
