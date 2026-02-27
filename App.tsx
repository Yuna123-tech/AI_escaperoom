import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputField } from './components/InputField';
import { SelectField } from './components/SelectField';
import { TextAreaField } from './components/TextAreaField';
import { GeneratedPlan } from './components/GeneratedPlan';
import { GuideSection } from './components/GuideSection';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateEscapeRoomPlan } from './services/geminiService';
import type { EscapeRoomPlan, SchoolLevel, EscapeRoomType } from './types';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [learningObjectives, setLearningObjectives] = useState('');
    const [achievementStandards, setAchievementStandards] = useState('');
    const [level, setLevel] = useState<SchoolLevel>('초등');
    const [escapeRoomType, setEscapeRoomType] = useState<EscapeRoomType>('스토리텔링형');
    const [learningContent, setLearningContent] = useState('');
    const [puzzles, setPuzzles] = useState('');
    const [evaluationMethods, setEvaluationMethods] = useState('');

    const [generatedPlan, setGeneratedPlan] = useState<EscapeRoomPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!apiKey) {
            setError('Gemini API 키를 입력해주세요. 상단의 가이드를 참고하세요.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);
        try {
            const plan = await generateEscapeRoomPlan({
                apiKey,
                level,
                escapeRoomType,
                learningObjectives,
                achievementStandards,
                learningContent,
                puzzles,
                evaluationMethods,
            });
            setGeneratedPlan(plan);
        } catch (err) {
            setError('계획 생성에 실패했습니다. API 키가 올바른지 확인 후 다시 시도해 주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, level, escapeRoomType, learningObjectives, achievementStandards, learningContent, puzzles, evaluationMethods]);

    return (
        <div className="min-h-screen bg-slate-100 text-gray-800 font-sans pb-20">
            <Header />
            <main className="container mx-auto p-4 md:p-8 max-w-7xl">
                <GuideSection />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Input Form Section */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-200">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">수업 정보 입력</h2>
                        <div className="space-y-6">
                             <InputField
                                label="Gemini API 키"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="사용자 본인의 Gemini API 키를 입력하세요"
                            />
                             <p className="text-xs text-gray-500 -mt-4 px-1">
                                입력하신 API 키는 브라우저에만 저장되며, 저희 서버에는 절대 전송되거나 저장되지 않습니다. 페이지를 새로고침하면 사라집니다.
                            </p>
                             <SelectField
                                label="수업 수준"
                                value={level}
                                onChange={(e) => setLevel(e.target.value as SchoolLevel)}
                                options={['초등', '중등', '고등']}
                            />
                            <SelectField
                                label="방탈출 유형"
                                value={escapeRoomType}
                                onChange={(e) => setEscapeRoomType(e.target.value as EscapeRoomType)}
                                options={['스토리텔링형', '문제방', '탐사/모험형', '미스터리/추리형', '역사/시대극형']}
                            />
                            <InputField
                                label="학습 목표"
                                value={learningObjectives}
                                onChange={(e) => setLearningObjectives(e.target.value)}
                                placeholder="예: 분수의 나눗셈 원리를 이해하고 계산할 수 있다."
                            />
                            <InputField
                                label="성취 기준"
                                value={achievementStandards}
                                onChange={(e) => setAchievementStandards(e.target.value)}
                                placeholder="예: [6수01-05] ... (비워두면 AI가 자동 생성)"
                            />
                            <TextAreaField
                                label="학습 내용"
                                value={learningContent}
                                onChange={(e) => setLearningContent(e.target.value)}
                                placeholder="방탈출 시나리오에 포함될 핵심 학습 내용을 입력하세요. (비워두면 AI가 자동 생성)"
                                rows={4}
                            />
                            <TextAreaField
                                label="핵심 문제/퍼즐 아이디어"
                                value={puzzles}
                                onChange={(e) => setPuzzles(e.target.value)}
                                placeholder="포함하고 싶은 문제나 퍼즐 아이디어를 자유롭게 작성해주세요. (선택 사항)"
                                rows={3}
                            />
                             <TextAreaField
                                label="평가 방법"
                                value={evaluationMethods}
                                onChange={(e) => setEvaluationMethods(e.target.value)}
                                placeholder="어떻게 학생들을 평가할지 입력하세요. (비워두면 AI가 자동 생성)"
                                rows={3}
                            />
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-300 disabled:bg-primary-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner />
                                        생성 중...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon />
                                        AI로 방탈출 계획 생성하기
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Output Section */}
                    <div className="bg-slate-50 rounded-2xl shadow-md border border-gray-200 sticky top-8">
                         <div className="p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">AI 생성 방탈출 계획</h2>
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-96">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-gray-500">AI가 열심히 계획을 짜고 있어요...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg h-96 flex items-center justify-center">
                                    <p>{error}</p>
                                </div>
                            ) : generatedPlan ? (
                                <GeneratedPlan plan={generatedPlan} level={level} apiKey={apiKey} />
                            ) : (
                                <div className="text-center text-gray-400 h-96 flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <p className="text-sm md:text-base">왼쪽에 정보를 입력하고 생성 버튼을 누르면<br />이곳에 방탈출 계획이 나타납니다.</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </main>
            <footer className="mt-12 pb-8 text-center">
                <p className="text-xs text-gray-400 font-medium tracking-wider">
                    Created by <span className="text-gray-500">i-Scream</span> & <span className="text-gray-500">정윤아</span>
                </p>
            </footer>
        </div>
    );
};

export default App;