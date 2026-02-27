export type SchoolLevel = '초등' | '중등' | '고등';

export type EscapeRoomType = '스토리텔링형' | '문제방' | '탐사/모험형' | '미스터리/추리형' | '역사/시대극형';

export interface EscapeRoomPlanInput {
    apiKey: string;
    level: SchoolLevel;
    escapeRoomType: EscapeRoomType;
    learningObjectives: string;
    achievementStandards: string;
    learningContent: string;
    puzzles: string;
    evaluationMethods: string;
}

export interface Puzzle {
    puzzleTitle: string;
    description: string;
    connectionToContent: string;
    reward: string;
}

export interface EscapeRoomPlan {
    title: string;
    theme: string;
    storyline: string;
    flow: string[];
    puzzles: Puzzle[];
    conclusion: string;
    materials: string[];
    finalPasswordHint: string;
    finalPassword: string;
    teacherGuide: {
        preparation: string[];
        implementationTips: string[];
        differentiation: string;
    };
}
