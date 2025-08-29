import { RankingQuizCard } from '@/app/ranking-quiz-card';

const initialOptions = [
  { id: 'opt1', label: 'あじ' },
  { id: 'opt2', label: 'たまご' },
  { id: 'opt3', label: '納豆軍艦' },
  { id: 'opt4', label: 'さば' },
  { id: 'opt5', label: 'サーモン' },
  { id: 'opt6', label: '炙りサーモン' },
  { id: 'opt7', label: 'いくら' },
  { id: 'opt8', label: '中トロ' },
  { id: 'opt9', label: '茶碗蒸し' },
  { id: 'opt10', label: 'ネギトロ' },
];
const correctOrder = ['opt1', 'opt2', 'opt3', 'opt4', 'opt5'];

export default function SushiRankingQuizPage() {
  return (
    <div>
      <main>
        <RankingQuizCard
          title="杉山裕一の好きな寿司ネタ"
          initialOptions={initialOptions}
          correctOrder={correctOrder}
        />
      </main>
    </div>
  );
}
