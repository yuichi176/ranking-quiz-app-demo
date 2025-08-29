import { RankingQuizCard } from '@/app/ranking-quiz-card';

const initialOptions = [
  { id: 'opt1', label: 'モササウルス' },
  { id: 'opt2', label: 'ガリミムス' },
  { id: 'opt3', label: 'テリジノサウルス' },
  { id: 'opt4', label: 'ティラノサウルス' },
  { id: 'opt5', label: 'コンプソグナトゥス' },
  { id: 'opt6', label: 'スピノサウルス' },
  { id: 'opt7', label: 'ギガノトサウルス' },
  { id: 'opt8', label: 'バリオニクス' },
  { id: 'opt9', label: 'ドードー' },
  { id: 'opt10', label: 'ユタラプトル' },
];
const correctOrder = ['opt1', 'opt2', 'opt3', 'opt4', 'opt5'];

export default function DinosaurRankingQuizPage() {
  return (
    <div>
      <main>
        <RankingQuizCard
          title="杉山裕一の好きな恐竜"
          initialOptions={initialOptions}
          correctOrder={correctOrder}
        />
      </main>
    </div>
  );
}
