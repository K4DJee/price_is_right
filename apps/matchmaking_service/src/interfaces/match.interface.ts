export interface MatchData{
    matchId: string,
    p1: string,
    p2: string,
    questionText: string,
    correctAnswer: string,
    status: string
}

export interface AnswerData{
    userId: string,
    answer: string,
    isCorrect: boolean,
    //timeSpent
}