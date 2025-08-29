import { RankingQuizCard } from '@/app/ranking-quiz-card';

const initialOptions = [
  { id: 'opt1', label: '中トロ' },
  { id: 'opt2', label: 'サーモン' },
  { id: 'opt3', label: '納豆' },
  { id: 'opt4', label: 'えび' },
  { id: 'opt5', label: 'たまご' },
  { id: 'opt6', label: 'あじ' },
  { id: 'opt7', label: 'つぶ貝' },
  { id: 'opt8', label: 'いくら' },
  { id: 'opt9', label: 'いか' },
  { id: 'opt10', label: 'ネギトロ' },
];
const correctOrder = ['opt1', 'opt2', 'opt3', 'opt4', 'opt5'];

export default function SushiRankingQuizPage() {
  return (
    <div>
      <main>
        <RankingQuizCard
          title="寿司ネタ"
          initialOptions={initialOptions}
          correctOrder={correctOrder}
        />
      </main>
    </div>
  );
}
