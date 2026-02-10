export interface MatchData{
    matchId:        string,
    p1:             string,
    p2:             string,
    questionText:   string,
    correctAnswer:  number,
    status:         string
}

export interface MatchResult{
    p1: string,
    p2: string,
    matchId: string,
    winner: string,
    loser: string,
    p1Answer: number,
    p2Answer: number,
    correctAnswer: number,
    message: string
}

export interface MatchDataToDB{
    id: string,
    users: string[],
    winner?:string,
    loser?:string,
    p1Answer?:number,
    p2Answer?:number,
    correctAnswer?:number
}

export interface AnswerData{
    userId: string,
    answer: number,
    isCorrect: boolean,
    //timeSpent
}