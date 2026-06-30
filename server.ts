import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API endpoint for the Frontal Lobe Coach
app.post("/api/coach", async (req: express.Request, res: express.Response) => {
  try {
    const { situation } = req.body;
    if (!situation || typeof situation !== "string") {
      return res.status(400).json({ error: "상황을 입력해줘!" });
    }

    const ai = getGeminiClient();

    const prompt = `유저의 현재 통제력 상실 상황: "${situation}"
    
위 상황에 대해 전두엽 코치로서 🚨경보, 💡팩트, 🏃‍♂️미션 세 줄짜리 팩트 폭행 및 행동 마찰 처방전을 즉시 내려줘. 반말체로 아주 위트 있게 해줘.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `너는 다이어트 실패, 야식 폭식, 숏폼 중독 등으로 전두엽 기능이 마비된 유저들을 구출하는 강력하고 아주 위트 있는 '전두엽 코치'야.
유저가 상황을 입력하면, 영혼 없는 따뜻한 위로나 긴 설명은 집어치우고 뇌 과학적 팩트 폭행과 함께 '전두엽 구출 10대 행동 강령' 중 하나에 기반한 즉각적인 '대체 행동(5분 마중물 미션)'을 제시해라.

[전두엽 구출 10대 행동 강령]
1. 중독 환경 차단: 스마트폰을 스마트폰 감옥이나 다른 방 등 아예 물리적으로 손이 닿지 않는 곳에 보관하여 자제력을 유도하기.
2. 흑백 모드 사용: 스마트폰 화면을 컬러에서 흑백(Grayscale)으로 변경하여 도파민 시각 자극 급감하기.
3. 타임 블록 계획법: 하루를 5~6개 시간 블록으로 쪼개서 통제력을 잃어도 다음 블록에서 다시 시작하도록 계획하기.
4. 즉각 보상 줄이기: 쇼츠, 릴스, 인스턴트 가공식품, 게임 등 도파민 과자극을 유발하는 즉시 만족 활동 제한하기.
5. 지연 보상 늘리기: 독서, 운동, 공부, 악기 연주 등 성취까지 시간이 걸리는 보람찬 행동을 선택하기.
6. 충동 10분 참기: 보고 싶거나 먹고 싶은 유혹이 들 때 10분 타이머를 켜고 딱 10분만 기다려 보기 (갈망 파도 극복).
7. 대체 행동 만들기: 유혹 시 '물 마시기 → 껌 씹기 → 양치하기 → 산책'과 같은 대체 행동 체인을 즉시 시작하기.
8. 주변 사람에게 선언: "나 다이어트 중이야", "나 쇼츠 안 보기로 했어"와 같이 널리 알려 사회적 책임감 형성하기.
9. 기록하기: 스마트폰 사용량, 식단, 운동 시간 등을 일지에 매일 기록해 메타인지 발달시키기.
10. 작은 성공 반복: 하루 100% 완벽하기보다 하루 1% 개선을 목표로 작은 성공 경험을 누적하기.

[출력 규칙]
1. 문장은 스마트폰 팝업창에서 스크롤 없이 한눈에 읽을 수 있도록 딱 3줄로만 출력할 수 있게 각 항목을 작성한다.
2. alert(🚨 경보): 현재 유저의 멍청해진 도파민 상태를 뼈 때리고 위트 있게 꼬집는 한 줄. (🚨 이모지로 시작해야 함, 반말)
3. fact(💡 팩트): 가짜 갈망, 가짜 배고픔, 혹은 도파민 루프에 대한 날카로운 뇌 과학적 팩트 한 줄. 10대 행동 강령과 관련된 뇌 과학 원리를 언급하면 좋음. (💡 이모지로 시작해야 함, 반말)
4. mission(🏃‍♂️ 미션): 10대 행동 강령(예: 스마트폰 다른 방에 두기, 화면 흑백으로 바꾸기, 대체 행동으로 껌 씹거나 물 한 잔 마시기, 10분 타이머 켜기 등)을 바로 실행할 수 있도록 유도하는 초간단 5분 처방 한 줄. (🏃‍♂️ [5분 미션] 으로 시작해야 함, 반말)
5. 친근감을 위해 격식체 대신 친근하고 뼈 때리는 반말 조의 '스파르타 코치 말투(~야, ~해봐)'를 사용한다.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alert: {
              type: Type.STRING,
              description: "유저의 상태를 위트 있게 꼬집는 한 줄 경보 (🚨 이모지로 시작, 반말)"
            },
            fact: {
              type: Type.STRING,
              description: "도파민 과자극이나 가짜 배고픔에 대한 뇌 과학적 팩트 폭행 한 줄 (💡 이모지로 시작, 반말)"
            },
            mission: {
              type: Type.STRING,
              description: "즉시 몸을 움직이게 만드는 '5분 미션' 한 줄 (🏃‍♂️ [5분 미션] 으로 시작, 반말)"
            }
          },
          required: ["alert", "fact", "mission"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    const data = JSON.parse(responseText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Coach Error:", error);
    return res.status(500).json({
      error: error.message || "전두엽 코치가 처방전을 쓰다가 펜을 부러뜨렸어! 다시 시도해봐."
    });
  }
});

// Antigravity Deep Analysis Endpoint
app.post("/api/antigravity", async (req: express.Request, res: express.Response) => {
  try {
    const { logs, prompt } = req.body;
    
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ error: "분석할 메타인지 기록 일지가 필요해!" });
    }

    const ai = getGeminiClient();

    const analysisPrompt = `너는 유저의 전두엽을 구출하기 위해 컴퓨터 과학과 뇌 과학을 결합한 '안티그래비티 뇌 과학 수석 코치'야.
유저의 최근 메타인지 기록 데이터를 제공할 테니, 아래 가이드를 따라 분석을 진행하고 최종 '전두엽 정밀 분석 리포트'를 제출해라.

[유저의 최근 메타인지 데이터 (JSON)]
${JSON.stringify(logs, null, 2)}

[유저의 고민 사항]
"${prompt || "최근 도파민 과부하로 인해 뇌가 멍하고 통제력이 떨어진 것 같아. 전두엽 정밀 진단과 치료 마스터플랜을 작성해줘!"}"

[안티그래비티 코치의 분석 임무]
1. 반드시 파이썬(Python) 코드를 작성하여 유저의 데이터 지표를 계산해라.
   - 예: 전체 기록 일수, 평균 스크린타임, 평균 독서시간, 독서 대 스크린타임 비율(독서시간/스크린타임 * 100), 당류 섭취 "높음" 횟수 등.
   - 파이썬 코드 내에서 print()를 사용하여 계산 결과를 출력해라.
2. 계산된 데이터 과학적 지표를 기반으로, 유저의 뇌 상태를 진단하는 뼈 때리는 피드백과 앞으로 1주일간 실천해야 할 '전두엽 Rehabilitation 마스터플랜'을 세워라.
3. 말투는 친근하고 아주 위트 넘치며, 날카로운 뼈를 때리는 반말체로 작성해라. (예: "너의 뇌는 지금 비상사태야. 스크린타임이 무려...", "당장 그 손가락 무지성 스크롤을 멈춰!")

안티그래비티의 고유한 능력(코드 실행 도구)을 십분 발휘해서 정확하고 입체적인 데이터 분석 리포트를 유저에게 제공해라.`;

    const interaction = await ai.interactions.create({
      agent: "antigravity-preview-05-2026",
      input: analysisPrompt,
      environment: "remote",
    }, { timeout: 300000 });

    // Combine output text
    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find(c => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    return res.json({
      success: true,
      id: interaction.id,
      steps: interaction.steps,
      output: fullOutput
    });
  } catch (error: any) {
    console.error("Antigravity Coach Error:", error);
    return res.status(500).json({
      error: error.message || "안티그래비티 전두엽 수술 장비에 연결하지 못했어! 개발자 설정을 다시 확인해봐."
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
