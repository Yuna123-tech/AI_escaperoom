import React, { useState, useCallback } from 'react';
import type { EscapeRoomPlan, Puzzle, SchoolLevel } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { SmallSpinner } from './SmallSpinner';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CubeIcon } from './icons/CubeIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { MapIcon } from './icons/MapIcon';
import { PuzzlePieceIcon } from './icons/PuzzlePieceIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { KeyIcon } from './icons/KeyIcon';
// Fix: Import the SparklesIcon component to resolve a 'Cannot find name' error.
import { SparklesIcon } from './icons/SparklesIcon';
import {
    generateImagePrompt,
    generateWorksheetPrompt,
    generateWebApp,
    generateZepAdvice,
    generateZepBackgroundPrompt,
    generateFinalWebApp,
} from '../services/geminiService';


interface GeneratedPlanProps {
    plan: EscapeRoomPlan;
    level: SchoolLevel;
    apiKey: string;
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onCopy?: () => void; isCopied?: boolean; copyTooltip?: string }> = ({ title, icon, children, onCopy, isCopied, copyTooltip = "내용 복사" }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-6 relative group">
        <div className="flex items-center gap-3 mb-4">
            <span className="flex-shrink-0 bg-primary-100 text-primary-600 p-2.5 rounded-xl">
                {icon}
            </span>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {onCopy && (
                <button
                    onClick={onCopy}
                    className="absolute top-4 right-4 p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                    aria-label={copyTooltip}
                >
                    {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                </button>
            )}
        </div>
        <div className="pl-1.5">
            {children}
        </div>
    </div>
);

type AssetType = 'image' | 'worksheet' | 'webapp' | 'zepAdvice' | 'zepBackground';

type PromptContent = { prompt: string; copied: boolean };
type WebAppContent = { html: string; copied: boolean };
type ZepAdviceContent = { content: string; copied: boolean };

type PuzzleAssets = Record<number, {
    image?: PromptContent;
    worksheet?: PromptContent;
    webapp?: WebAppContent;
    error?: string;
}>;
type LoadingStates = Record<number, Partial<Record<AssetType, boolean>>>;


const PromptDisplay: React.FC<{
    prompt: string;
    isCopied: boolean;
    onCopy: () => void;
    assetType: AssetType;
}> = ({ prompt, isCopied, onCopy, assetType }) => (
    <div className="mt-4 space-y-2">
        <textarea
            readOnly
            className="w-full h-32 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono focus:ring-2 focus:ring-primary-300 transition-shadow"
            value={prompt}
        />
        <div className="flex gap-2 items-center flex-wrap">
            <button
                onClick={onCopy}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100"
            >
                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                {isCopied ? '복사 완료!' : '프롬프트 복사'}
            </button>
            {(assetType === 'image' || assetType === 'zepBackground') && (
                <a
                    href="https://gemini.google/overview/image-generation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-green-500 text-white hover:bg-green-600 shadow-sm"
                >
                    Gemini 이미지 생성 <ExternalLinkIcon />
                </a>
            )}
        </div>
        {assetType === 'image' && <p className="text-xs text-gray-500">팁: 위 프롬프트를 복사하여 Gemini 이미지 생성 도구에 붙여넣어 이미지를 생성하세요.</p>}
    </div>
);

const WebAppDisplay: React.FC<{
    html: string;
    isCopied: boolean;
    onCopy: () => void;
    title?: string;
}> = ({ html, isCopied, onCopy, title = '✅ 인터랙티브 웹 활동이 생성되었습니다.' }) => {
    const openInNewTab = () => {
        try {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const newTab = window.open(url, '_blank');
            if (newTab) {
                newTab.focus();
            }
        } catch (e) {
            console.error("Failed to open new tab:", e);
            alert("새 탭을 여는 데 실패했습니다. 팝업 차단 기능이 활성화되어 있는지 확인해주세요.");
        }
    };

    return (
        <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50/80">
             <p className="text-sm font-medium text-gray-800 mb-3">{title}</p>
             <div className="flex gap-2 items-center flex-wrap">
                 <button
                     onClick={openInNewTab}
                     className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-green-500 text-white hover:bg-green-600 shadow-sm"
                 >
                     새 탭에서 활동 열기 <ExternalLinkIcon />
                 </button>
                 <button
                     onClick={onCopy}
                     className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100"
                 >
                     {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                     {isCopied ? '코드 복사 완료!' : 'HTML 코드 복사'}
                 </button>
            </div>
             <p className="text-xs text-gray-500 mt-2">팁: 생성된 활동에 오류가 있거나 수정하고 싶다면 코드를 복사하여 직접 수정할 수 있습니다.</p>
        </div>
    );
};


const PuzzleCard: React.FC<{
    puzzle: Puzzle;
    assets: PuzzleAssets[number];
    loading: LoadingStates[number];
    onGenerateAsset: (type: AssetType) => void;
    onCopyPuzzle: () => void;
    isPuzzleCopied: boolean;
    onCopyAsset: (type: AssetType, content: string) => void;
}> = ({ puzzle, assets, loading, onGenerateAsset, onCopyPuzzle, isPuzzleCopied, onCopyAsset }) => {

    const actionButtons: { type: AssetType; icon: React.ReactNode; label: string }[] = [
        { type: 'image', icon: <ImageIcon />, label: '이미지 프롬프트' },
        { type: 'worksheet', icon: <DocumentTextIcon />, label: '활동지 프롬프트' },
        { type: 'webapp', icon: <CodeBracketIcon />, label: '웹 활동' },
    ];

    return (
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm group transition-all duration-300 hover:shadow-md">
            <div className="relative">
                <h4 className="text-lg font-bold text-gray-800 pr-10">{puzzle.puzzleTitle}</h4>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{puzzle.description}</p>
                <p className="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded mt-3 inline-block">
                    <strong>학습 연계:</strong> {puzzle.connectionToContent}
                </p>
                
                <div className="mt-3 pt-3 border-t border-dashed border-gray-300 flex items-start gap-2 text-amber-700">
                    <div className="flex-shrink-0 mt-0.5"><KeyIcon /></div>
                    <p className="text-sm"><strong className="font-semibold">획득 보상:</strong> {puzzle.reward}</p>
                </div>

                <button
                    onClick={onCopyPuzzle}
                    className="absolute top-0 right-0 p-1.5 rounded-full bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 border border-gray-300"
                    aria-label="퍼즐 내용 복사"
                >
                    {isPuzzleCopied ? <CheckIcon /> : <ClipboardIcon />}
                </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-500 mb-2">수업 자료 만들기</h5>
                <div className="flex items-center gap-2 flex-wrap">
                    {actionButtons.map(({ type, icon, label }) => (
                        <button
                            key={type}
                            onClick={() => onGenerateAsset(type)}
                            disabled={loading?.[type] || !!assets?.[type]}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            {loading?.[type] ? <SmallSpinner /> : icon}
                            {label} 생성
                        </button>
                    ))}
                </div>
            </div>


            {assets?.error && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{assets.error}</p>}
            
            {assets?.image?.prompt && (
                <PromptDisplay
                    key="image"
                    prompt={assets.image.prompt}
                    isCopied={assets.image.copied}
                    onCopy={() => onCopyAsset('image', assets.image!.prompt)}
                    assetType="image"
                />
            )}
            {assets?.worksheet?.prompt && (
                <PromptDisplay
                    key="worksheet"
                    prompt={assets.worksheet.prompt}
                    isCopied={assets.worksheet.copied}
                    onCopy={() => onCopyAsset('worksheet', assets.worksheet!.prompt)}
                    assetType="worksheet"
                />
            )}
            {assets?.webapp?.html && (
                <WebAppDisplay
                    key="webapp"
                    html={assets.webapp.html}
                    isCopied={assets.webapp.copied}
                    onCopy={() => onCopyAsset('webapp', assets.webapp!.html)}
                />
            )}
        </div>
    );
};


export const GeneratedPlan: React.FC<GeneratedPlanProps> = ({ plan, level, apiKey }) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [puzzleAssets, setPuzzleAssets] = useState<PuzzleAssets>({});
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

    const [zepAdvice, setZepAdvice] = useState<ZepAdviceContent | null>(null);
    const [zepBackgroundPrompt, setZepBackgroundPrompt] = useState<PromptContent | null>(null);
    const [isZepLoading, setIsZepLoading] = useState({ advice: false, background: false });
    const [zepError, setZepError] = useState<string | null>(null);

    const [finalWebApp, setFinalWebApp] = useState<WebAppContent | null>(null);
    const [isFinalAppLoading, setIsFinalAppLoading] = useState(false);
    const [finalAppError, setFinalAppError] = useState<string | null>(null);


    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(err => console.error("Copy failed: ", err));
    };

    const handleCopyAsset = useCallback((puzzleIndex: number, type: AssetType, content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            setPuzzleAssets(prev => {
                const puzzleAsset = prev[puzzleIndex];
                if (!puzzleAsset || !puzzleAsset[type]) return prev;

                const assetContent = puzzleAsset[type]!;
                const updatedContent = { ...assetContent, copied: true };

                return {
                    ...prev,
                    [puzzleIndex]: { ...puzzleAsset, [type]: updatedContent }
                };
            });
            setTimeout(() => {
                 setPuzzleAssets(prev => {
                    const puzzleAsset = prev[puzzleIndex];
                    if (!puzzleAsset || !puzzleAsset[type]) return prev;

                    const assetContent = puzzleAsset[type]!;
                    const updatedContent = { ...assetContent, copied: false };

                    return {
                        ...prev,
                        [puzzleIndex]: { ...puzzleAsset, [type]: updatedContent }
                    };
                 });
            }, 2000);
        });
    }, []);

    const handleGenerateAsset = useCallback(async (puzzleIndex: number, type: AssetType) => {
        const puzzle = plan.puzzles[puzzleIndex];
        if (!puzzle) return;

        setPuzzleAssets(prev => {
            const { error, ...rest } = prev[puzzleIndex] || {};
            return { ...prev, [puzzleIndex]: rest };
        });

        if (type === 'image') {
            setLoadingStates(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], image: true } }));
            try {
                const prompt = await generateImagePrompt(puzzle, level, apiKey);
                setPuzzleAssets(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], image: { prompt, copied: false } } }));
            } catch(err) {
                console.error(`Failed to generate ${type}`, err);
                setPuzzleAssets(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], error: `[이미지 프롬프트] 생성에 실패했습니다. 다시 시도해 주세요.` }}));
            } finally {
                setLoadingStates(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], image: false } }));
            }
        } else if (type === 'webapp') {
            setLoadingStates(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], webapp: true } }));
            try {
                const previousPuzzleReward = puzzleIndex > 0 ? plan.puzzles[puzzleIndex - 1].reward : null;
                const html = await generateWebApp(puzzle, previousPuzzleReward, level, apiKey);
                setPuzzleAssets(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], webapp: { html, copied: false } } }));
            } catch(err) {
                console.error(`Failed to generate ${type}`, err);
                setPuzzleAssets(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], error: `[웹 활동] 생성에 실패했습니다. 다시 시도해 주세요.` }}));
            } finally {
                setLoadingStates(prev => ({ ...prev, [puzzleIndex]: { ...prev[puzzleIndex], webapp: false } }));
            }
        } else { // worksheet
            const prompt = generateWorksheetPrompt(puzzle, level);
            setPuzzleAssets(prev => ({
                ...prev,
                [puzzleIndex]: { ...prev[puzzleIndex], worksheet: { prompt, copied: false } }
            }));
        }
    }, [plan.puzzles, level, apiKey]);

    const handleGenerateZep = useCallback(async (type: 'advice' | 'background') => {
        setZepError(null);
        if (type === 'advice') {
            setIsZepLoading(prev => ({...prev, advice: true}));
            try {
                const content = await generateZepAdvice(plan, level, apiKey);
                setZepAdvice({ content, copied: false });
            } catch (err) {
                console.error("Failed to generate ZEP advice", err);
                setZepError("ZEP 제작 조언 생성에 실패했습니다.");
            } finally {
                setIsZepLoading(prev => ({...prev, advice: false}));
            }
        } else { // background
            setIsZepLoading(prev => ({...prev, background: true}));
             try {
                const prompt = await generateZepBackgroundPrompt(plan.theme, plan.storyline, level, apiKey);
                setZepBackgroundPrompt({ prompt, copied: false });
            } catch (err) {
                console.error("Failed to generate ZEP background prompt", err);
                setZepError("ZEP 배경 이미지 프롬프트 생성에 실패했습니다.");
            } finally {
                setIsZepLoading(prev => ({...prev, background: false}));
            }
        }
    }, [plan, level, apiKey]);

     const handleCopyZepAsset = useCallback((type: 'advice' | 'background') => {
        if (type === 'advice' && zepAdvice) {
            navigator.clipboard.writeText(zepAdvice.content).then(() => {
                setZepAdvice(z => z ? { ...z, copied: true } : null);
                setTimeout(() => setZepAdvice(z => z ? { ...z, copied: false } : null), 2000);
            });
        } else if (type === 'background' && zepBackgroundPrompt) {
            navigator.clipboard.writeText(zepBackgroundPrompt.prompt).then(() => {
                setZepBackgroundPrompt(z => z ? { ...z, copied: true } : null);
                setTimeout(() => setZepBackgroundPrompt(z => z ? { ...z, copied: false } : null), 2000);
            });
        }
    }, [zepAdvice, zepBackgroundPrompt]);

    const handleGenerateFinalWebApp = useCallback(async () => {
        setFinalAppError(null);
        setIsFinalAppLoading(true);
        try {
            const html = await generateFinalWebApp(plan, level, apiKey);
            setFinalWebApp({ html, copied: false });
        } catch (err) {
            console.error("Failed to generate final web app", err);
            setFinalAppError("최종 웹 활동 생성에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setIsFinalAppLoading(false);
        }
    }, [plan, level, apiKey]);

    const handleCopyFinalWebApp = useCallback(() => {
        if (finalWebApp) {
            navigator.clipboard.writeText(finalWebApp.html).then(() => {
                setFinalWebApp(fw => fw ? { ...fw, copied: true } : null);
                setTimeout(() => setFinalWebApp(fw => fw ? { ...fw, copied: false } : null), 2000);
            });
        }
    }, [finalWebApp]);

    return (
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-1 space-y-4">
            <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                    <span className="text-sm font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">{plan.theme}</span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{plan.title}</h2>
                </div>
                <button
                    onClick={() => {
                        const fullText = `
제목: ${plan.title}
테마: ${plan.theme}
도입 스토리: ${plan.storyline}

[교사용 가이드]
준비사항: ${plan.teacherGuide.preparation.join(', ')}
진행팁: ${plan.teacherGuide.implementationTips.join(', ')}
수준별 지도: ${plan.teacherGuide.differentiation}

[진행 순서]
${plan.flow.map((f, i) => `${i + 1}. ${f}`).join('\n')}

[퍼즐 상세]
${plan.puzzles.map((p, i) => `퍼즐 ${i + 1}: ${p.puzzleTitle}\n설명: ${p.description}\n보상: ${p.reward}`).join('\n\n')}

[마무리]
${plan.conclusion}
최종 비밀번호 힌트: ${plan.finalPasswordHint}
최종 비밀번호: ${plan.finalPassword}

[준비물]
${plan.materials.join(', ')}
                        `.trim();
                        handleCopy(fullText, 'full-plan');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-all"
                >
                    {copiedId === 'full-plan' ? <CheckIcon /> : <ClipboardIcon />}
                    {copiedId === 'full-plan' ? '복사됨' : '전체 계획 복사'}
                </button>
            </div>
            
            <Section title="도입 스토리" icon={<BookOpenIcon />}>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{plan.storyline}</p>
            </Section>

            <Section title="교사용 수업 가이드" icon={<SparklesIcon />}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <CheckIcon />
                            수업 전 준비 사항
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {plan.teacherGuide.preparation.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <SparklesIcon />
                            수업 진행 팁
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {plan.teacherGuide.implementationTips.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                        <h4 className="font-bold text-primary-800 mb-1">💡 수준별 지도 방안</h4>
                        <p className="text-sm text-primary-700 leading-relaxed">{plan.teacherGuide.differentiation}</p>
                    </div>
                </div>
            </Section>

            <Section title="진행 순서" icon={<MapIcon />}>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    {plan.flow.map((step, index) => <li key={index}>{step}</li>)}
                </ol>
            </Section>

            <Section title="핵심 퍼즐" icon={<PuzzlePieceIcon />}>
                <div className="space-y-4">
                    {plan.puzzles.map((puzzle, index) => {
                        const puzzleId = `puzzle-${index}`;
                        const textToCopy = `${puzzle.puzzleTitle}\n\n${puzzle.description}\n\n[학습 연계]: ${puzzle.connectionToContent}\n\n[획득 보상]: ${puzzle.reward}`;
                        return (
                            <PuzzleCard 
                                key={index} 
                                puzzle={puzzle}
                                assets={puzzleAssets[index]}
                                loading={loadingStates[index]}
                                onGenerateAsset={(type) => handleGenerateAsset(index, type)}
                                onCopyPuzzle={() => handleCopy(textToCopy, puzzleId)}
                                isPuzzleCopied={copiedId === puzzleId}
                                onCopyAsset={(type, content) => handleCopyAsset(index, type, content)}
                            />
                        );
                    })}
                </div>
            </Section>
            
            <Section title="탈출 조건 및 마무리" icon={<TrophyIcon />} onCopy={() => handleCopy(`${plan.conclusion}\n\n[최종 비밀번호 힌트]: ${plan.finalPasswordHint}`, 'conclusion')} isCopied={copiedId === 'conclusion'}>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{plan.conclusion}</p>
                
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                        <KeyIcon />
                        최종 비밀번호 힌트
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{plan.finalPasswordHint}</p>
                </div>

                 <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
                    <h4 className="text-md font-bold text-gray-800 flex items-center gap-2">
                        <CodeBracketIcon />
                        최종 탈출 웹 활동
                    </h4>
                    <p className="text-sm text-gray-600 my-2">
                        모든 퍼즐에서 얻은 단서들을 사용하여 최종 비밀번호를 풀어 탈출하는 인터랙티브 웹 활동을 생성합니다. 성공 시 저장 가능한 인증서가 제공됩니다.
                    </p>
                    
                    {!finalWebApp && (
                        <button
                            onClick={handleGenerateFinalWebApp}
                            disabled={isFinalAppLoading}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-green-100 border border-green-200 text-green-800 hover:bg-green-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            {isFinalAppLoading ? <SmallSpinner /> : <SparklesIcon />}
                            최종 활동 생성하기
                        </button>
                    )}
                    
                    {finalAppError && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{finalAppError}</p>}

                    {finalWebApp?.html && (
                        <WebAppDisplay
                            key="finalwebapp"
                            html={finalWebApp.html}
                            isCopied={finalWebApp.copied}
                            onCopy={handleCopyFinalWebApp}
                            title="✅ 최종 탈출 활동이 생성되었습니다."
                        />
                    )}
                </div>
            </Section>

            <Section title="필요한 준비물" icon={<ClipboardDocumentListIcon />}>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {plan.materials.map((material, index) => <li key={index}>{material}</li>)}
                </ul>
            </Section>

             <Section title="ZEP 메타버스 교실 제작 가이드" icon={<CubeIcon />}>
                <div className="space-y-6">
                    {/* ZEP Advice Generation */}
                    <div>
                        <h4 className="font-semibold text-gray-800">1. 제작 조언 생성하기</h4>
                        <p className="text-sm text-gray-600 my-2">
                            생성된 방탈출 계획을 ZEP 메타버스 맵으로 만드는 방법에 대한 AI의 조언을 받아보세요. 맵 레이아웃, 오브젝트 상호작용, 방별 상세 구성 팁 등이 제공됩니다.
                        </p>
                        {!zepAdvice && (
                            <button
                                onClick={() => handleGenerateZep('advice')}
                                disabled={isZepLoading.advice}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                                {isZepLoading.advice ? <SmallSpinner /> : <SparklesIcon />}
                                ZEP 제작 조언 생성
                            </button>
                        )}
                        
                        {zepAdvice && (
                            <div className="mt-4 space-y-2">
                                <div
                                    className="prose prose-sm max-w-none p-4 border border-gray-200 rounded-md bg-gray-50 h-60 overflow-y-auto"
                                    dangerouslySetInnerHTML={{ __html: zepAdvice.content.replace(/\n/g, '<br />') }} 
                                />
                                <button
                                    onClick={() => handleCopyZepAsset('advice')}
                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100"
                                >
                                    {zepAdvice.copied ? <CheckIcon /> : <ClipboardIcon />}
                                    {zepAdvice.copied ? '복사 완료!' : '조언 내용 복사'}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* ZEP Background Prompt Generation */}
                    <div className="pt-4 border-t border-gray-200">
                         <h4 className="font-semibold text-gray-800">2. 배경 이미지 프롬프트 생성</h4>
                         <p className="text-sm text-gray-600 my-2">
                            ZEP 맵에 사용할 배경 이미지를 만들기 위한 AI 프롬프트를 생성합니다. 생성된 한글 프롬프트를 Gemini 등에서 활용해 보세요.
                         </p>
                         {!zepBackgroundPrompt && (
                             <button
                                 onClick={() => handleGenerateZep('background')}
                                 disabled={isZepLoading.background}
                                 className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                             >
                                 {isZepLoading.background ? <SmallSpinner /> : <ImageIcon />}
                                 배경 프롬프트 생성
                             </button>
                         )}
                         {zepBackgroundPrompt && (
                            <PromptDisplay
                                prompt={zepBackgroundPrompt.prompt}
                                isCopied={zepBackgroundPrompt.copied}
                                onCopy={() => handleCopyZepAsset('background')}
                                assetType="zepBackground"
                            />
                         )}
                    </div>
                     {zepError && <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{zepError}</p>}
                </div>
            </Section>
        </div>
    );
};
