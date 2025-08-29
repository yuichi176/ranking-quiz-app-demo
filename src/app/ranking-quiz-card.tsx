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
import RankingQuizContent, { QuizOption } from '@/app/ranking-quiz-content';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { mutate } from 'swr';

type RankingQuizCardProps = {
  title: string;
  initialOptions: QuizOption[];
  correctOrder: string[];
};

export const RankingQuizCard = ({
  title,
  initialOptions,
  correctOrder,
}: RankingQuizCardProps) => {
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

  const score = useMemo(() => {
    let totalScore = 0;

    // Base points: 1 point for each correct item in top 5 (regardless of position)
    const userTop5 = getRankingArray.slice(0, 5);
    const correctTop5 = correctOrder.slice(0, 5);

    userTop5.forEach((userItem) => {
      if (correctTop5.includes(userItem)) {
        totalScore += 1;
      }
    });

    // Exact match bonus points
    const exactMatchBonus = [5, 4, 3, 2, 1]; // 1st, 2nd, 3rd, 4th, 5th
    userTop5.forEach((userItem, index) => {
      if (userItem === correctOrder[index]) {
        totalScore += exactMatchBonus[index];
      }
    });

    return totalScore;
  }, [getRankingArray, correctOrder]);

  const checkAnswer = async () => {
    setChecked(true);
    await mutate(
      '/api/score',
      await fetch('/api/score', {
        method: 'POST',
        body: JSON.stringify({
          quizTitle: title,
          user: 'dummy_user',
          score: score,
        }),
      })
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/30 py-10 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              杉山裕一のランキングクイズ：{title}
            </CardTitle>
            <p className="text-muted-foreground">
              選択肢をドラッグして、ランキング形式で並び替えてください。
            </p>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">📊 スコアリング方式：</p>
              <ul className="space-y-1">
                <li>• トップ5に正解が含まれている場合：各1ポイント</li>
                <li>
                  •
                  順位が完全一致の場合のボーナス：1位+5、2位+4、3位+3、4位+2、5位+1ポイント
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
              <div className="flex items-center gap-2">
                {checked && (
                  <Badge
                    className={cn(score >= 10 ? 'bg-green-600' : 'bg-primary')}
                  >
                    スコア: {score}
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
                <Check className="w-4 h-4" /> 確定
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
