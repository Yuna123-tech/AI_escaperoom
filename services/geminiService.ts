import { GoogleGenAI, Type } from "@google/genai";
import type { EscapeRoomPlan, EscapeRoomPlanInput, Puzzle, SchoolLevel } from '../types';

const schema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "수업의 주제를 잘 나타내는 흥미로운 방탈출 제목"
        },
        theme: {
            type: Type.STRING,
            description: "방탈출의 전체적인 컨셉 또는 테마 (예: 고대 유적 탐사, 미래 과학 실험실)"
        },
        storyline: {
            type: Type.STRING,
            description: "학생들의 몰입을 유도하는 흥미로운 도입 스토리"
        },
        flow: {
            type: Type.ARRAY,
            description: "방탈출의 전체적인 진행 순서 (3~5단계로 요약)",
            items: {
                type: Type.STRING
            }
        },
        puzzles: {
            type: Type.ARRAY,
            description: "학습 내용과 연계된 3-4개의 구체적인 퍼즐 또는 문제. 각 퍼즐은 서로 연결되어야 함.",
            items: {
                type: Type.OBJECT,
                properties: {
                    puzzleTitle: {
                        type: Type.STRING,
                        description: "퍼즐의 이름"
                    },
                    description: {
                        type: Type.STRING,
                        description: "퍼즐에 대한 상세한 설명과 해결 방법"
                    },
                    connectionToContent: {
                        type: Type.STRING,
                        description: "이 퍼즐이 어떤 학습 내용과 관련되는지에 대한 설명"
                    },
                    reward: {
                        type: Type.STRING,
                        description: "이 퍼즐을 해결했을 때 다음 단계로 넘어가기 위해 얻게 되는 보상(단서, 아이템, 비밀번호 등)에 대한 설명. 이 보상들은 최종 비밀번호를 푸는 데 사용되어야 함."
                    }
                },
                required: ["puzzleTitle", "description", "connectionToContent", "reward"]
            }
        },
        conclusion: {
            type: Type.STRING,
            description: "방탈출 성공 조건 및 학습 목표를 정리하는 마무리 활동"
        },
        materials: {
            type: Type.ARRAY,
            description: "수업에 필요한 준비물 목록",
            items: {
                type: Type.STRING
            }
        },
        finalPasswordHint: {
            type: Type.STRING,
            description: "학생들에게 최종 비밀번호를 어떻게 찾아야 하는지에 대한 명확한 힌트. (예: '지금까지 모은 모든 알파벳 조각을 순서대로 조합하세요.')"
        },
        finalPassword: {
            type: Type.STRING,
            description: "방탈출의 모든 퍼즐을 해결한 후 최종적으로 입력해야 하는 비밀번호. 보통 모든 퍼즐의 보상(reward)을 조합하여 만들 수 있어야 함."
        },
        teacherGuide: {
            type: Type.OBJECT,
            properties: {
                preparation: {
                    type: Type.ARRAY,
                    description: "수업 전 교사가 준비해야 할 구체적인 단계",
                    items: { type: Type.STRING }
                },
                implementationTips: {
                    type: Type.ARRAY,
                    description: "수업 진행 중 교사가 참고할 팁이나 유의사항",
                    items: { type: Type.STRING }
                },
                differentiation: {
                    type: Type.STRING,
                    description: "학습 수준이 다른 학생들을 위한 개별화 지도 방안"
                }
            },
            required: ["preparation", "implementationTips", "differentiation"]
        }
    },
    required: ["title", "theme", "storyline", "flow", "puzzles", "conclusion", "materials", "finalPasswordHint", "finalPassword", "teacherGuide"]
};


export const generateEscapeRoomPlan = async (input: EscapeRoomPlanInput): Promise<EscapeRoomPlan> => {
    const { apiKey, level, escapeRoomType, learningObjectives, achievementStandards, learningContent, puzzles, evaluationMethods } = input;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        사용자가 제공한 정보를 바탕으로 ${level} 학생들을 위한 몰입형 방탈출 수업 계획을 생성해 줘.
        수업 계획은 교육적이고 재미있어야 하며, 주어진 학습 목표를 달성할 수 있도록 설계해야 해.

        **중요 지침:**
        1.  **방탈출 유형 맞춤 설계:** '${escapeRoomType}' 유형의 특징을 잘 살려서 전체 계획을 구성해 줘.
            -   **스토리텔링형:** 흥미진진한 이야기가 중심이 되어 학생들이 주인공이 된 것처럼 느끼게 해줘. 퍼즐은 스토리 진행을 위한 도구야.
            -   **문제방:** 스토리는 최소화하고, 논리적 사고력을 요구하는 다양한 유형의 문제들을 연속적으로 해결하는 데 집중해 줘.
            -   **탐사/모험형:** 미지의 공간을 탐험하고 단서를 발견하는 재미를 강조해 줘. 관찰력과 협동이 중요해.
            -   **미스터리/추리형:** 학생들이 탐정이 되어 사건의 진실을 파헤치는 과정을 중심으로 구성해 줘.
            -   **역사/시대극형:** 특정 역사적 배경 속에서 사건을 해결하며 자연스럽게 시대적 상황을 학습하도록 해줘.
        2.  **연결성 및 최종 비밀번호:** 각 퍼즐은 서로 유기적으로 연결되어야 해. 앞선 퍼즐을 풀어야만 다음 퍼즐을 풀 수 있는 단서(보상)를 얻을 수 있는 구조로 설계해 줘. 모든 퍼즐의 보상(reward)들을 조합하면 풀 수 있는 최종 비밀번호(finalPassword)와 그에 대한 명확한 힌트(finalPasswordHint)를 반드시 만들어야 해.
        3.  **자동 생성:** 만약 '성취 기준', '핵심 학습 내용', '평가 방법' 항목이 비어있거나 '(자동 생성 필요)'라고 되어 있다면, '학습 목표'와 '수업 수준'에 가장 적합한 내용을 창의적으로 생성해서 채워줘.
        4.  **구체성:** 퍼즐과 문제들은 학생들이 바로 활동할 수 있을 정도로 구체적으로 설명해 줘.

        **수업 정보:**
        - **수업 수준:** ${level}
        - **방탈출 유형:** ${escapeRoomType}
        - **학습 목표:** ${learningObjectives}
        - **성취 기준:** ${achievementStandards || '(자동 생성 필요)'}
        - **핵심 학습 내용:** ${learningContent || '(자동 생성 필요)'}
        - **포함하고 싶은 문제/퍼즐 아이디어:** ${puzzles || '특별한 아이디어 없음. 학습 내용과 방탈출 유형에 맞게 창의적으로 제안해줘.'}
        - **평가 방법:** ${evaluationMethods || '(자동 생성 필요)'}

        위 정보와 지침을 활용하여 다음 JSON 스키마에 맞춰 창의적이고 상세한 방탈출 계획을 생성해 줘.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonText = response.text.trim();
        const plan = JSON.parse(jsonText);
        
        return plan as EscapeRoomPlan;

    } catch (error) {
        console.error("Error generating escape room plan:", error);
        throw new Error("Failed to generate plan from Gemini API.");
    }
};

export const generateImagePrompt = async (puzzle: Puzzle, level: SchoolLevel, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Gemini 또는 Midjourney와 같은 이미지 생성 도구를 위한 상세하고 고품질의 이미지 생성 프롬프트를 한국어로 만들어 줘.
        이 이미지는 ${level} 학생들을 위한 교실 퍼즐에 사용될 거야.
        스타일은 시각적으로 매력적이고, 활기차며, 명확한 디지털 일러스트 또는 만화 스타일이어야 해. 어린이/청소년에게 적합해야 하고, 너무 복잡하거나 무서운 비주얼은 피해야 해.
        최상의 결과를 위해 프롬프트는 반드시 한국어로 작성되어야 해.

        퍼즐 제목: "${puzzle.puzzleTitle}"
        퍼즐 설명: "${puzzle.description}"

        이 퍼즐을 바탕으로, 원하는 이미지를 묘사하는 간결하고 상세한 한 단락의 글을 생성해 줘. 핵심적인 시각 요소, 캐릭터, 배경, 분위기에 초점을 맞춰. "프롬프트를 만드세요" 같은 지시 사항이나 따옴표는 포함하지 말고, 프롬프트 내용만 제공해 줘.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating image prompt:", error);
        throw new Error("Failed to generate image prompt from Gemini API.");
    }
};

export const generateWorksheetPrompt = (puzzle: Puzzle, level: SchoolLevel): string => {
    return `
# ${level} 학생용 활동지 생성 프롬프트

## 목표
아래 퍼즐 정보를 바탕으로, 학생들이 흥미를 느끼고 학습 목표에 도달할 수 있도록 잘 구조화된 1페이지 분량의 활동지를 만들어 주세요.

## 활동지 기본 정보
- **대상:** ${level}
- **퍼즐 제목:** ${puzzle.puzzleTitle}
- **퍼즐 내용:** ${puzzle.description}
- **학습 연계:** ${puzzle.connectionToContent}

## 활동지 포함 요소 및 요청사항
1.  **제목:** 퍼즐 제목을 활용하여 흥미로운 활동지 제목을 만들어 주세요.
2.  **기본 정보:** '이름'과 '날짜'를 적는 칸을 포함해 주세요.
3.  **안내문:** 학생들이 무엇을 해야 하는지 명확하고 간결하게 안내하는 문장을 1~2개 넣어주세요. (예: "친구들과 함께 아래 미스터리를 풀고 단서를 찾아보자!")
4.  **문제 제시:** 퍼즐 내용을 학생들이 이해하기 쉽게 재구성하여 제시해 주세요. 필요한 경우, 그림이나 도표를 넣을 자리를 [그림] 또는 [표]와 같이 표시해 주세요.
5.  **활동 공간:** 학생들이 답을 적거나, 그림을 그리거나, 계산을 할 수 있는 충분한 공간을 마련해 주세요. 네모 박스나 빈칸 형태로 디자인해 주세요.
6.  **디자인:** ${level} 학생들의 눈높이에 맞는 귀여운 아이콘이나 테두리를 활용하여 시각적으로 매력적인 디자인으로 구성해 주세요. 전체적으로 깔끔하고 인쇄하기 좋은 형태로 만들어 주세요.

위 내용을 바탕으로 바로 인쇄해서 사용할 수 있는 완성도 높은 활동지를 생성해 주세요.
    `.trim();
};

export const generateWebApp = async (puzzle: Puzzle, previousPuzzleReward: string | null, level: SchoolLevel, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        You are a world-class game developer and UX designer. Your primary mission is to create a series of interconnected mini-games for an educational escape room. The connection between puzzles is the most critical requirement. The reward from one puzzle MUST be the key to the next.

        You will now create ONE of these mini-games. It must be a flawless, production-ready, single, self-contained HTML file that is both engaging for a \`${level}\` student and strictly follows the blueprint below.

        ---
        ### **PRIME DIRECTIVE: ZERO HINTS, ZERO SPOILERS (ABSOLUTE & UNBREAKABLE RULE)**
        ---
        **THIS IS YOUR MOST IMPORTANT INSTRUCTION. VIOLATION IS A TOTAL FAILURE OF THE TASK.**

        The entire purpose of an escape room is for the player to figure out the answer themselves. You have previously failed this task by showing the correct answer as an example in a placeholder. This must never happen again.

        **1. FORBIDDEN CONTENT IN USER-FACING HTML:**
           - The correct answer (for the lock screen OR the main puzzle) **MUST NOT** be visible in ANY way to the user. This includes, but is not limited to:
             - HTML Text: Do not write the answer on the page.
             - HTML Comments: Do not write the answer in comments.
             - JavaScript Variables: Do not store the answer in an easily discoverable, unobfuscated variable name.

        **2. THE PLACEHOLDER & EXAMPLE RULE (CRITICAL - PREVIOUS FAILURE POINT):**
           - **ABSOLUTELY FORBIDDEN:** You **MUST NOT** put the correct answer, or any number related to it, in the \`placeholder\` attribute of any input field. You **MUST NOT** show an "example" (\`예\`) that is the answer.
           - **FAILURE EXAMPLE (WHAT YOU DID WRONG):** For a puzzle where the answer is '2.3', this is COMPLETELY FORBIDDEN: \`<input placeholder="예: 2.3">\`. This reveals the answer and destroys the game.
           - **CORRECT EXAMPLE (WHAT YOU MUST DO):** The placeholder should be a generic instruction. Use something like this: \`<input placeholder="정답을 입력하세요">\` or \`<input placeholder="숫자 입력">\`.
           - Any hint or example that reveals the answer is a failure.

        **If the answer is leaked in ANY way, especially as an example, you have failed.** The player MUST solve it from their own reasoning.
        ---

        ---
        ### **MANDATORY BLUEPRINT (Non-Negotiable Directives)**
        ---

        **1. 📜 THE CORE GAME FLOW: Lock -> Play -> Reward**
           This is the fundamental structure. You must implement all three stages perfectly to maintain the escape room's flow.

           a. **LOCK SCREEN (The Vital Link):**
              - **Purpose:** This screen is the critical link that connects this puzzle to the previous one. Its implementation is MANDATORY if a 'Previous Puzzle's Reward' value is provided below.
              - If a 'Previous Puzzle's Reward' is provided, the game **MUST** begin on this "lock screen".
              - This screen requires a single password to proceed. The input field **MUST** be blank by default, with a generic placeholder like '단서를 입력하세요'.
              - **FOR YOUR JAVASCRIPT LOGIC ONLY:** The correct password is the exact string value: \`'${previousPuzzleReward}'\`.
              - **ABSOLUTE SECURITY DIRECTIVE:** As stated in the PRIME DIRECTIVE, the password value ('${previousPuzzleReward}') **MUST NEVER, EVER** appear in any user-visible HTML, especially not as a placeholder or example.

           b. **PLAY SCREEN (The Challenge):**
              - **Display the Mission:** The first thing the student sees **MUST** be the puzzle's title and description. Use a clear, readable layout.
                \`\`\`html
                <div class="puzzle-container">
                  <h1 class="puzzle-title">${puzzle.puzzleTitle}</h1>
                  <p class="puzzle-description">${puzzle.description}</p>
                </div>
                \`\`\`
              - **Make it an Interactive GAME:** Translate the puzzle's description into a creative, interactive experience below the title/description.
              - **AVOID** simple text inputs if possible. Think bigger: Drag-and-drop, click-to-find, interactive elements (virtual keypads, sliders), logic puzzles (sequences, switches). The gameplay itself must lead the student to discover the answer.

           c. **REWARD SCREEN (The Exit):**
              - Upon success, transition to a "reward" view.
              - **Animate the reveal:** A treasure chest opening, a lock clicking open, etc.
              - **Display the clue:** After the animation, you **MUST** clearly and prominently display the reward for the *current* puzzle using this exact HTML structure and CSS:
                \`\`\`html
                <div class="reward-container">
                  <h1>성공! 다음 단서를 획득했습니다:</h1>
                  <p class="reward-text">${puzzle.reward}</p>
                </div>
                \`\`\`
                And this CSS in your \`<style>\` tag:
                \`\`\`css
                .reward-container { animation: fadeIn 0.5s ease-in-out; }
                .reward-text {
                  font-size: clamp(1.5rem, 5vw, 2.5rem); font-weight: 700; color: #15803d;
                  background-color: #f0fdf4; padding: 1rem 1.5rem; border-radius: 12px;
                  border: 2px dashed #4ade80; margin-top: 1rem; text-align: center;
                  box-shadow: 0 4px 15px rgba(0,0,0,0.1); word-break: keep-all; line-height: 1.5;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                \`\`\`

        **2. ✨ FLAWLESS UI/UX & AESTHETICS.**
           - **Font:** To ensure maximum compatibility and avoid any potential font licensing issues, use a system font stack. Apply this CSS to the \`body\`: \`font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\`. **Do not** import any external fonts.
           - **Layout:** Centered, clean, modern, and **fully responsive (mobile-first)**. Use Flexbox or Grid. Avoid fixed widths.
           - **Interactivity:** Add subtle CSS transitions to interactive elements for smooth feedback. All user-facing text must be in **Korean**.
           - **Feedback:** Use on-page visual cues for interactions. **NEVER use \`alert()\`.** For incorrect answers, provide gentle feedback like a subtle shake animation or a brief color change.

        **3. 🔧 TECHNICAL & FUNCTIONALITY SPECIFICATIONS.**
           - **CODE ONLY:** Your response is the raw HTML code, starting with \`<!DOCTYPE html>\`. No markdown.
           - **HTML Title:** The \`<title>\` tag **MUST** be set to the puzzle's title: \`<title>${puzzle.puzzleTitle}</title>\`.
           - **Single File:** All HTML, CSS (in \`<style>\`), and JavaScript (in \`<script>\`) in one file.
           - **Vanilla JS & FULLY FUNCTIONAL:** No external libraries. **All interactive elements MUST be fully functional.** A button with no \`addEventListener\` is a bug. An input whose value is not checked is a bug. The win condition logic in your JavaScript must be robust, directly correspond to the puzzle's description, and correctly handle the transition between game states (e.g., hiding the lock screen, showing the play screen, then showing the reward screen). For text comparisons, use \`.trim()\` and consider \`.toLowerCase()\` to avoid user frustration.

        ---
        ### **PUZZLE BRIEFING**
        ---
        -   **Title:** ${puzzle.puzzleTitle}
        -   **Description:** ${puzzle.description}
        -   **Learning Connection:** ${puzzle.connectionToContent}
        -   **Final Reward (To be revealed on win):** ${puzzle.reward}
        -   **Previous Puzzle's Reward (The key to unlock this game):** ${previousPuzzleReward || '없음'}

        ---
        Execute this blueprint with precision. The final product must be a bug-free, fully working mini-game.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let htmlContent = response.text.trim();
        if (htmlContent.startsWith("```html")) {
            htmlContent = htmlContent.substring(7);
        }
        if (htmlContent.endsWith("```")) {
            htmlContent = htmlContent.slice(0, -3);
        }
        
        return htmlContent.trim();
    } catch (error) {
        console.error("Error generating web app:", error);
        throw new Error("Failed to generate web app from Gemini API.");
    }
};

export const generateFinalWebApp = async (plan: EscapeRoomPlan, level: SchoolLevel, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        You are a world-class game developer, creating the grand finale for an educational escape room. This is the final challenge where the student enters one final password to win and receive a savable certificate. Your output must be a single, self-contained, production-ready HTML file.

        ---
        ### **PRIME DIRECTIVE: ZERO HINTS, ZERO SPOILERS (ABSOLUTE & UNBREAKABLE RULE)**
        ---
        **THIS IS YOUR MOST IMPORTANT INSTRUCTION. VIOLATION IS A TOTAL FAILURE OF THE TASK.**

        This is the final challenge. The student must use the final password they have figured out. Do not give it away.
        - **FORBIDDEN:** The correct answer (\`'${plan.finalPassword}'\`) **MUST NOT** be visible in ANY way to the user looking at the HTML, CSS, or playing the game.
        - **THE PLACEHOLDER & EXAMPLE RULE:** You **MUST NOT** put the correct answer in a \`placeholder\` attribute or show it as an "example" (\`예\`). This is a critical failure. The input field must have a generic placeholder like "최종 비밀번호 입력".
        
        **If the final password is leaked, you have failed. The user MUST enter it from their own deduction.**
        ---

        ---
        ### **MANDATORY GRAND FINALE BLUEPRINT**
        ---

        **1. 📜 THE GOAL: The Final Lock**
           - The student has solved all puzzles and needs to enter one final password to escape.
           - **Display the Mission:** Clearly state the final mission. The theme is "${plan.theme}", and the title is "${plan.title}".
             \`\`\`html
             <div class="mission-briefing">
               <h1>${plan.title}</h1>
               <p class="final-hint">${plan.finalPasswordHint}</p>
             </div>
             \`\`\`
           - The game requires a single password input. 
           - **FOR YOUR JAVASCRIPT LOGIC ONLY:** The correct password is: \`'${plan.finalPassword}'\`.

        **2. 🎉 THE VICTORY SCREEN & CERTIFICATE: The Grand Reward**
           - Upon entering the correct password, hide the input form and transition to a "VICTORY" view.
           - This view MUST contain a customizable and savable certificate.

           **a. Certificate Structure:**
              - The main container should have a celebratory title like "탈출 성공!".
              - Inside, create a \`<div id="certificate">\` that is styled to look like a formal certificate (e.g., with a nice border, background color, maybe a ribbon icon).
              - The certificate MUST include:
                - A title: "방탈출 성공 인증서 (Certificate of Escape)"
                - An input field for the student's name: \`<input type="text" id="student-name-input" placeholder="이름을 입력하여 인증서 완성하기">\`
                - A space where the student's name will be displayed prominently on the certificate (e.g., \`<h2 id="certificate-name" class="name-display"></h2>\`).
                - The escape room title: \`<h3 class="mission-title">미션: ${plan.title}</h3>\`
                - The date, which MUST be automatically filled with today's date using JavaScript: \`<p id="certificate-date" class="date"></p>\`.
                - A concluding message: \`<p class="conclusion-text">${plan.conclusion}</p>\`

           **b. Interactivity (JavaScript Logic):**
              - The student's name on the certificate (\`#certificate-name\`) MUST update in real-time as they type into the name input field (\`#student-name-input\`). Use an \`input\` event listener.
              - You MUST include a "인증서 이미지로 저장" (Save Certificate as Image) button: \`<button id="save-button">인증서 이미지로 저장</button>\`.

           **c. "Save as Image" Functionality (CRITICAL - VANILLA JS ONLY):**
              - When the save button is clicked, you MUST execute a JavaScript function that performs the following steps precisely:
                1. Get the current student's name from the input field. If it's empty, use a default like "탐험가".
                2. Dynamically create an SVG string. This SVG should replicate the visual appearance of the certificate. Use \`<foreignObject>\` if necessary for complex text wrapping, but simple \`<text>\` elements with x/y coordinates are preferred. Include all certificate text (title, name, date, etc.) and basic styling (font-family, colors, etc.).
                3. Create a \`Blob\` from the SVG string with the type \`'image/svg+xml'\`.
                4. Create an object URL from the Blob using \`URL.createObjectURL()\`.
                5. Create a temporary link (\`<a>\`) element.
                6. Set the link's \`href\` to the object URL.
                7. Set the link's \`download\` attribute to \`방탈출_성공_인증서.svg\`.
                8. Programmatically click the link to trigger the download.
                9. Use \`URL.revokeObjectURL()\` to clean up the object URL after triggering the download.

        **3. ✨ FLAWLESS UI/UX & AESTHETICS (Same rules as before)**
           - **Font:** Use a system font stack for maximum compatibility.
           - **Layout:** Centered, clean, modern, and **fully responsive (mobile-first)**.
           - **Feedback:** On-page feedback. **NEVER use \`alert()\`.** All user-facing text must be in **Korean**.

        **4. 🔧 TECHNICAL & FUNCTIONALITY SPECIFICATIONS (Same rules as before)**
           - **CODE ONLY:** Start with \`<!DOCTYPE html>\`. No markdown.
           - **HTML Title:** The \`<title>\` tag **MUST** be: \`<title>${plan.title} - 최종 도전</title>\`.
           - **Single File:** All HTML, CSS, and JavaScript in one file.
           - **Vanilla JS & FULLY FUNCTIONAL:** All interactive parts **must** work perfectly.

        ---
        ### **FINAL CHALLENGE BRIEFING**
        ---
        -   **Escape Room Title:** ${plan.title}
        -   **Theme:** ${plan.theme}
        -   **Final Password Hint:** ${plan.finalPasswordHint}
        -   **Final Password (for your JS logic ONLY):** ${plan.finalPassword}
        -   **Concluding Lesson:** ${plan.conclusion}
        -   **Target Audience:** ${level} students

        ---
        Create the ultimate, bug-free, fully working final challenge with a savable certificate. Go!
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let htmlContent = response.text.trim();
        if (htmlContent.startsWith("```html")) {
            htmlContent = htmlContent.substring(7);
        }
        if (htmlContent.endsWith("```")) {
            htmlContent = htmlContent.slice(0, -3);
        }
        
        return htmlContent.trim();
    } catch (error) {
        console.error("Error generating final web app:", error);
        throw new Error("Failed to generate final web app from Gemini API.");
    }
};


export const generateZepAdvice = async (plan: EscapeRoomPlan, level: SchoolLevel, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        당신은 ZEP(zep.us) 플랫폼을 활용한 메타버스 기반 학습 설계 전문가입니다.
        아래에 제공된 ${level} 학생들을 위한 방탈출 계획을 바탕으로, 교사가 이 경험을 ZEP에서 어떻게 구축할 수 있는지에 대한 매우 상세하고 구체적인 가이드를 작성해 주세요.

        가이드는 ZEP 초보 사용자도 쉽게 이해할 수 있도록 실용적이고 단계별로 작성되어야 합니다.
        응답은 마크다운 형식으로 구성하고, 전체 응답은 반드시 한국어로 작성되어야 합니다.

        **방탈출 계획 세부 정보:**
        - **제목:** ${plan.title}
        - **테마:** ${plan.theme}
        - **스토리라인:** ${plan.storyline}
        - **퍼즐:**
        ${plan.puzzles.map(p => `  - ${p.puzzleTitle}: ${p.description}\n    - 보상: ${p.reward}`).join('\n')}

        **가이드에는 다음 섹션이 반드시 포함되어야 합니다:**

        ### 1. 전체 맵 컨셉 및 흐름
        - 적합한 맵 레이아웃을 제안해 주세요. 하나의 큰 맵이 좋을지, 여러 개의 연결된 맵이 좋을까요?
        - 테마와 스토리에 맞는 핵심 장소들을 제안하고, 학생들이 퍼즐 순서대로 자연스럽게 이동할 동선을 설명해 주세요.

        ### 2. 시작 및 종료 지점 설정
        - 학생들이 처음 스폰될 시작 지점과 최종 탈출 지점을 어떻게 꾸미면 좋을지 아이디어를 주세요.
        - 도입 스토리를 전달하기 위한 NPC나 오브젝트 배치 팁을 알려주세요.

        ### 3. 방별 상세 구성 (Room-by-Room Breakdown)
        - 각 퍼즐에 해당하는 개별 공간(방)을 어떻게 구현할지 매우 구체적으로 설명해주세요. (퍼즐 수만큼 반복)
        - **(예시) '${plan.puzzles[0].puzzleTitle}' 방:**
            - **시각적 테마 및 레이아웃:** 이 방을 어떤 모습으로 꾸밀지 (예: 낡은 도서관, 미래형 실험실 등) 묘사해주세요.
            - **퍼즐 제시 방법:** ZEP 오브젝트(예: NPC 대화, 표지판, 암호문이 적힌 오브젝트)를 사용해서 퍼즐을 어떻게 제시할지 설명해주세요.
            - **상호작용 오브젝트:** 정답을 입력하거나 단서를 조합할 오브젝트(예: 비밀번호 입력 도어, 특정 위치에 아이템을 놓는 트리거)와 설정 방법을 상세히 알려주세요.
            - **흐름 연결:** 이 방의 퍼즐을 풀면 얻는 '${plan.puzzles[0].reward}'를 어떻게 다음 방으로 가져가는지 설명해주세요. (예: NPC가 다음 방 비밀번호를 알려줌, 다음 방으로 가는 포탈이 열림 등)
        
        ### 4. 몰입감 향상을 위한 팁
        - 테마에 맞는 배경 음악, 음향 효과, 시각적 장식물을 추천해주세요.
        - 스토리를 더욱 풍부하게 만들어 줄 NPC 대사 작성 팁을 알려주세요.

        위 지침에 따라 매우 구체적이고 실용적인 가이드를 한국어로 작성해주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating ZEP advice:", error);
        throw new Error("Failed to generate ZEP advice from Gemini API.");
    }
};

export const generateZepBackgroundPrompt = async (theme: string, storyline: string, level: SchoolLevel, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Gemini와 같은 이미지 생성 도구를 위한 상세하고 고품질의 이미지 생성 프롬프트를 한국어로 만들어 줘.
        이 이미지는 ${level} 학생들을 위한 ZEP 메타버스 교실의 탑다운 또는 아이소메트릭 뷰 배경 맵으로 사용될 거야.
        스타일은 ZEP의 미학에 어울리는 활기차고, 명확하며, 약간 만화 같은 디지털 아트 또는 픽셀 아트 스타일이어야 해. 어린이/청소년 친화적이어야 해.
        최상의 결과를 위해 프롬프트는 반드시 한국어로 작성되어야 해.

        **테마:** "${theme}"
        **스토리라인 일부:** "${storyline}"

        테마와 스토리를 바탕으로, 원하는 맵을 묘사하는 간결하고 상세한 한 단락의 글을 생성해 줘.
        핵심 구역, 랜드마크, 전체적인 색상 팔레트, 분위기에 초점을 맞춰. 시점은 탑다운 또는 아이소메트릭 뷰여야 해.
        "프롬프트를 만드세요" 같은 지시 사항이나 따옴표는 포함하지 말고, 프롬프트 내용만 제공해 줘.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating ZEP background prompt:", error);
        throw new Error("Failed to generate ZEP background prompt from Gemini API.");
    }
};
