import { RankingQuizCard } from '@/app/ranking-quiz-card';

const initialOptions = [
  { id: 'opt1', label: 'モササウルス' },
  { id: 'opt2', label: 'テリジノサウルス' },
  { id: 'opt3', label: 'スピノサウルス' },
  { id: 'opt4', label: 'ケツァルコアトルス' },
  { id: 'opt5', label: 'ドードー' },
  { id: 'opt6', label: 'ブラキオサウルス' },
  { id: 'opt7', label: 'ティラノサウルス' },
  { id: 'opt8', label: 'ギガノトサウルス' },
  { id: 'opt9', label: 'トリケラトプス' },
  { id: 'opt10', label: 'ヴェロキラプトル' },
];
const correctOrder = ['opt1', 'opt2', 'opt3', 'opt4', 'opt5'];

export default function DinosaurRankingQuizPage() {
  return (
    <div>
      <main>
        <RankingQuizCard
          title="恐竜編"
          initialOptions={initialOptions}
          correctOrder={correctOrder}
        />
      </main>
    </div>
  );
}
