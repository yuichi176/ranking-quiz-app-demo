export async function POST(request: Request) {
  const res = await request.json();

  // const doc = db.doc('ranking-quiz/score');
  // await doc.set({
  //   quizTitle: res.quizTitle,
  //   user: res.user,
  //   score: res.score,
  // });

  return new Response(JSON.stringify({ message: 'Score saved' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
