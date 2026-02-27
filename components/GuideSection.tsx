import React from 'react';
import { KeyIcon } from './icons/KeyIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';

export const GuideSection: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-8">
            <div className="bg-primary-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <SparklesIcon />
                    시작하기 가이드
                </h2>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* API Key Instructions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <KeyIcon />
                        1. Gemini API 키 발급 및 설정
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            이 서비스는 Google의 최신 AI인 Gemini를 사용하여 수업 계획을 생성합니다. 무료로 API 키를 발급받아 바로 사용하실 수 있습니다.
                        </p>
                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
                            <li>
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 font-medium hover:underline inline-flex items-center gap-1"
                                >
                                    Google AI Studio 접속 <ExternalLinkIcon />
                                </a>
                            </li>
                            <li><strong>'Create API key'</strong> 버튼을 클릭합니다.</li>
                            <li>발급된 키를 복사(Copy)합니다.</li>
                            <li>본 웹앱의 <strong>'Gemini API 키'</strong> 입력란에 붙여넣습니다.</li>
                        </ol>
                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                            ※ 입력하신 키는 서버에 저장되지 않으며, 브라우저 세션 동안만 유지됩니다.
                        </p>
                    </div>
                </div>

                {/* Usage Guide */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BookOpenIcon />
                        2. 웹앱 사용 방법
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                                <span>수업 대상(초/중/고)과 원하는 방탈출 유형을 선택하세요.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                                <span>학습 목표를 입력하세요. 성취 기준이나 내용은 비워두면 AI가 자동으로 채워줍니다.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                                <span><strong>'계획 생성'</strong> 버튼을 누르고 잠시 기다리면 상세 시나리오와 퍼즐이 나타납니다.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                                <span>생성된 퍼즐별로 <strong>이미지, 활동지, 웹 활동</strong> 자료를 추가로 생성하여 수업에 활용하세요!</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
