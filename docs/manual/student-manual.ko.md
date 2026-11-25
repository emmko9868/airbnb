# 학생 매뉴얼 — 내 디자인 시스템과 웹사이트 만들기

> 그림이 있는 슬라이드판: <https://blah-01.tail46233e.ts.net/manual/ko> · 크레딧 한도 같은 조건은 바뀔 수 있으니 콘솔에서 다시 확인해요. `(미검증)`은 아직 직접 확인하지 못한 화면 문구예요.

이 매뉴얼은 위에서부터 차례로 따라 하면 되게 썼어요. 단계마다 **"성공하면 보이는 것"** 이 있어요. 그게 보이면 다음 단계로 넘어가요.

전체 흐름

1. 구독한 Token Plan 에서 API 키 받기
2. VS Code에 Qwen Code 확장 설치하고 키 연결하기
3. 스타터킷 받아서 설치하기
4. Figma와 AI 연결하기 (Figma MCP)
5. AI와 함께 디자인 시스템(토큰 + 컴포넌트) 만들기
6. 그 부품으로 웹사이트 3~4페이지 만들기
7. 인터넷에 올리기(배포)

---

## 0. 준비물

| 준비물 | 메모 |
|---|---|
| 개인 컴퓨터 (Mac 또는 Windows) | 학교·회사 컴퓨터는 설치가 막혀 있을 수 있어요. 설치할 때 컴퓨터 비밀번호(관리자 권한)가 필요해요. |
| Figma 계정 + 학생 인증 (Education 플랜) | 승인까지 며칠 걸릴 수 있어요. 가장 먼저 신청해요. |
| GitHub 계정 | **수업 전에는 필요 없어요.** 6-3 에서 배포 1안(GitHub 방식)을 고를 때만 써요. 그때 수업에서 함께 준비해요. |
| Vercel 계정 | **수업 전에 가입해요.** Vercel 은 내 웹사이트를 인터넷에 올려 줘요. 이메일로 가입할 수 있어요. Vercel 이 6자리 일회용 코드를 보내 줘요. 무료 Hobby 요금제면 충분해요. |
| VS Code | 1.96.0 이상이어야 해요. |
| **이미 구독한 알리바바 클라우드 Model Studio Token Plan 개인판 Standard(국제판)** | 학생마다 각자 구독해 둔 계정이에요. 아래를 꼭 읽어요. |

### Token Plan 에서 알아 둘 것

- **월 45,000 크레딧**이 있어요. AI에게 일을 시킬 때마다 크레딧이 줄어요.
- 구독한 날부터 **30일이 한 달**이에요(달력의 1일이 아니에요). 새 달이 되면 크레딧이 다시 채워져요.
- **남은 크레딧은 다음 달로 넘어가지 않아요.**
- **크레딧을 다 쓰면 AI가 멈춰요.** 추가 요금이 몰래 나가지는 않아요. 다음 달이 시작될 때까지 기다려야 하니, 막히면 강사에게 알려요.
- 동시에 돌릴 수 있는 AI 작업(에이전트)은 3~4개예요. 수업에서는 **한 번에 하나만** 써요.
- **1인 1구독이에요. 계정이나 API 키를 친구와 나눠 쓰면 안 돼요.** 공유가 확인되면 구독이 정지되거나 키가 막힐 수 있어요.
- **사람이 직접 대화하면서 쓰는 용도만 허용돼요.** 스크립트로 AI를 자동으로 반복 호출하면 규칙 위반이에요.

> **이 매뉴얼의 목표:** Standard 한 달 크레딧 안에서 디자인 시스템과 3~4페이지를 끝내는 것. 그래서 [7. 크레딧 아끼는 법](#7-크레딧-아끼는-법)을 꼭 지켜 주세요.

### 처음 보는 말

| 낱말 | 뜻 |
|---|---|
| agent (AI 에이전트) | 답만 하지 않고 일을 하는 AI 예요. 내 파일을 읽고, 고치고, 명령을 실행해요. Qwen Code 가 AI 에이전트예요. 그래서 허락 창으로 먼저 물어봐요(2-6). |
| MCP | Model Context Protocol. AI 가 다른 프로그램과 이야기하는 방법을 정한 약속이에요. 플러그 모양 하나로 여러 기기에 꽂는 것과 비슷해요. 이 수업은 Figma MCP 하나만 써요. AI 가 내 Figma 디자인을 읽게 해 줘요(4절). |
| model (모델) | AI 두뇌의 종류예요. 가볍고 빠른 것도, 더 큰 것도 있어요. `/model` 로 바꿔요(2-4). |
| Thinking | AI 가 답하기 전에 더 오래 생각하는 기능이에요. 생각에도 크레딧이 들어요(2-5). |
| credit (크레딧) | Token Plan 의 한 달 AI 사용량이에요. AI 가 일할 때마다 줄어요. |
| token (토큰) | 뜻이 세 가지예요. **디자인 토큰:** 색이나 크기에 붙인 이름표(예: `primary`). **AI 토큰:** AI 가 읽고 쓰는 글자 조각. 많을수록 크레딧이 더 들어요. **Vercel 토큰:** 프로그램용 비밀번호. 배포할 때 저절로 열리는 브라우저 창에 한 번 붙여 넣어요(6-3). AI 대화창에는 절대 붙여 넣지 않아요. |

---

## 1. 구독한 Token Plan 에서 API 키 발급

Token Plan 은 이미 구독해 둔 상태예요. 여기서는 Qwen Code 와 연결할 **API 키만** 복사해요.

1. 구독한 계정으로 알리바바 클라우드 국제판(alibabacloud.com)에 로그인해요.
2. Model Studio 콘솔에서 **Token Plan → My Subscriptions(내 구독)** 를 열어요 — [My Subscriptions 열고 Token Plan API 키 복사하기](https://modelstudio.console.alibabacloud.com/ap-southeast-1/subscription/token-plan). 가운데에 **Standard Plan(Active)** 과 **Plan Quota**(이번 달 사용량)가 보여요.
3. 오른쪽 **Plan-Specific API Key** 칸에서 **키를 복사해요.** 키는 `sk-sp-` 로 시작하고 화면에서는 일부가 가려져 있어요. 처음 구독한 계정이라 칸이 비어 있으면 화면 안내를 따라요(미검증).
4. 복사한 키는 안전한 곳(비밀번호 관리 앱 등)에 저장해요.

그 아래의 Plan Exclusive Base URL, Quick Access to AI Tools(Qwen Code 등)는 지금 쓰지 않아요. 키 연결은 2-3 에서 `/auth` 로 해요.

**성공하면 보이는 것:** My Subscriptions 페이지에 Standard Plan 과 남은 날짜가 보이고, 복사해 둔 API 키가 있어요.

꼭 지켜요

- ⚠️ **API 키 칸의 Reset 은 누르지 마요.** 누르면 지금 키가 바로 쓸 수 없게 되어 연결된 Qwen Code 가 멈춰요. **키가 유출됐을 때만** 누르고, 누른 뒤에는 Qwen Code 에서 `/auth` 로 새 키를 다시 연결해요(2-3).
- 이 키는 **Token Plan 전용 키**(`sk-sp-…`)예요. Model Studio 의 일반 API 키와 다르고 서로 바꿔 쓸 수 없어요. 화면에서 복사한 키를 그대로 써요.
- **키 전체가 화면 캡처나 채팅에 보이지 않게 해요.** 채팅방·스크린샷·GitHub 에 올리지 말고, 제출용 캡처를 찍을 때도 키를 가려요.
- 같은 키를 내 컴퓨터 여러 대(집·학교)에 넣는 건 괜찮아요.

---

## 2. VS Code + Qwen Code 확장 설치·연결

### 2-1. VS Code 설치

<https://code.visualstudio.com/> 에서 받아 설치해요. 이미 있다면 **도움말 → 업데이트 확인**으로 최신 버전으로 올려요(1.96.0 이상 필요).

**성공하면 보이는 것:** VS Code 가 열리고, 메뉴의 **Code(Windows 는 도움말) → 정보**에서 버전이 1.96 이상이에요.

### 2-2. Qwen Code 확장 설치

1. VS Code 왼쪽의 **확장(Extensions)** 아이콘을 눌러요.
2. `Qwen Code Companion` 을 검색해요. 게시자가 **qwenlm** 인 것을 설치해요.
   (마켓플레이스 주소: <https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion>)
3. 확장 안에 Qwen Code 가 들어 있어서 **따로 설치할 프로그램은 없어요.**
4. 3장의 설치 스크립트도 이 확장을 설치하려고 해요. 터미널에서 `code` 명령을 쓸 수 없는 컴퓨터에서는 "VS Code 확장 화면에서 수동 설치하세요"라는 안내만 나와요. 그래서 여기서 먼저 직접 설치해 두는 게 가장 확실해요.
5. **Figma 관련 VS Code 확장(예: "Figma MCP Server")은 설치하지 마요.** 우리는 Figma 데스크톱 앱에 들어 있는 MCP 를 써요(4장). 확장을 더 넣으면 AI 가 쓸 도구가 늘어나 요청마다 크레딧이 더 들어요.

**성공하면 보이는 것:** VS Code 옆 막대에 Qwen 아이콘이 생기고, 누르면 Qwen Code 대화 패널이 열려요.

### 2-3. Token Plan 키 연결

> 키는 VS Code 확장에서만 설정해요. 스타터킷 설치 스크립트는 키를 묻거나 저장하지 않아요.

**기본 방법 — 대화창에서 `/auth` 로 연결**

1. Qwen Code 패널을 처음 열면 연결 설정 창이 떠요. 안 뜨면 대화 입력칸에 `/auth` 를 입력해요.
2. 선택지(Coding Plan · Token Plan · Standard API Key …) 중에서 **Token Plan** 을 골라요. Coding Plan 이나 Standard API Key 가 아니에요.
3. 지역을 물으면 **Singapore (International)** 를 골라요.
4. 1단계에서 저장한 API 키를 붙여 넣어요.
5. 쓸 모델 목록을 고르라고 하면 [7번](#7-크레딧-아끼는-법)에서 쓰는 모델(가벼운 모델 하나 + 기본 모델 하나)을 골라요.

**성공하면 보이는 것:** Qwen Code 대화창에 `안녕?` 을 보내면 답이 와요.

**대체 방법 — 설정 파일에 직접 쓰기**

`/auth` 로 연결이 안 될 때만 써요. 내 컴퓨터의 **사용자 설정 파일**에 알리바바 공식 예시를 넣어요.

| OS | 파일 위치 |
|---|---|
| Mac | `~/.qwen/settings.json` |
| Windows | `C:\Users\<내 사용자 이름>\.qwen\settings.json` |

알리바바 공식 문서의 Token Plan 개인판 예시(모델 2개만 남긴 줄임판). `YOUR_API_KEY` 자리에 내 키를 넣어요.

```json
{
  "env": {
    "BAILIAN_TOKEN_PLAN_API_KEY": "YOUR_API_KEY"
  },
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.8-flash",
        "name": "[Token Plan Personal] qwen3.8-flash",
        "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "envKey": "BAILIAN_TOKEN_PLAN_API_KEY",
        "generationConfig": { "extra_body": { "enable_thinking": true } }
      },
      {
        "id": "qwen3.8-max",
        "name": "[Token Plan Personal] qwen3.8-max",
        "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "envKey": "BAILIAN_TOKEN_PLAN_API_KEY",
        "generationConfig": { "extra_body": { "enable_thinking": true } }
      }
    ]
  },
  "security": { "auth": { "selectedType": "openai" } },
  "tokenPlan": { "region": "global" },
  "model": { "name": "qwen3.8-flash" },
  "$version": 3
}
```

- 키는 **사용자 설정 파일(`~/.qwen/settings.json`)에만** 넣어요. 프로젝트 폴더 안의 `.qwen/settings.json` 에는 절대 넣지 마요. 프로젝트 폴더는 GitHub 에 올라가요.
- 주소의 `ap-southeast-1` 은 싱가포르(국제판)예요. 중국판(`cn-beijing`)과 섞으면 `401` 오류가 나요.

**성공하면 보이는 것:** Qwen Code 대화창에 `안녕?` 을 보내면 답이 와요. 그리고 콘솔 **Token Plan → My Subscriptions** 에서 사용량이 0 보다 커져요(반영까지 시간이 걸릴 수 있어요, 미검증).

### 2-4. 모델 바꾸는 법

모델은 AI 두뇌의 종류예요. 가볍고 빠른 모델도 있고, 더 큰 모델도 있어요.

대화 입력칸에 `/model` 을 입력하면 모델 선택 창이 열려요. Token Plan 모델(예: `qwen3.7-plus`, `qwen3.6-plus`, `qwen3.7-max`, `qwen3.8-max`, `qwen3.6-flash`, `deepseek-v4-pro`) 중에서 골라요. 어떤 작업에 어떤 모델을 쓸지는 사용량을 측정한 뒤 정해 줘요 (수업에서 알려 줘요).

**성공하면 보이는 것:** 고른 모델 이름이 대화 패널에 표시돼요. (표시 위치는 미검증)

### 2-5. 승인 모드와 Thinking

입력창 아래에 **승인 모드**와 **Thinking** 이 있어요.

왜 알아야 하나요: Qwen Code 는 AI 에이전트예요. 파일을 고치고 명령을 실행할 수 있어요. 그래서 묻지 않고 어디까지 하게 할지 내가 정해요.

- **승인 모드:** 스타터킷은 처음부터 **Ask Approval (default)**(명령을 실행하거나 파일을 고치기 전에 나에게 물어봄)로 맞춰 두었어요. 수업에서는 이 모드를 권장해요. 승인 모드 메뉴에는 모드가 4가지 있어요(아래 표).
  - `Shift + Tab` 을 누르면 모드가 바뀌어요. 바뀌었으면 다시 **Ask Approval (default)** 로 돌려요.
- **Thinking:** 켜면 AI 가 답하기 전에 더 오래 생각해요. **생각에 쓴 토큰도 크레딧이 나가요.** 언제 켜고 끌지 권장값은 사용량을 측정한 뒤 알려 줘요 (수업에서 알려 줘요).
  - 다른 AI 도구에는 "Effort" 라는 비슷한 설정이 있어요. AI 가 얼마나 깊이 생각할지 정해요.
- 스타터킷은 Qwen 의 백그라운드 기능(대화 기억 정리·스킬 검토)을 꺼 두었어요. 내가 요청하지 않은 일에 크레딧이 쓰이지 않게 하려는 거예요. 다시 켜지 마요.

| 승인 모드 (메뉴 이름) | 하는 일 | 수업에서 |
|---|---|---|
| **Ask Approval (default)** | 명령 실행·파일 수정·바깥 자료 사용 전에 나에게 물어요. | **권장해요.** 키트가 처음부터 맞춰 둔 모드예요. |
| Auto Edit (auto-edit) | 파일은 묻지 않고 바로 고쳐요. 명령 실행 같은 일만 물어요. | 권장하지 않아요. 계획서·코드가 내가 읽기 전에 바뀌어요. |
| Classifier Approval (auto) | 다른 AI 가 위험한지 판단해요. 안전해 보이면 바로 하고, 위험해 보이면 물어요. | 권장하지 않아요. 판단하는 AI 를 한 번 더 불러서 **크레딧을 더 써요.** |
| Full Access (yolo) | 모든 일을 묻지 않고 바로 해요(신뢰한 폴더에서). | **쓰지 마요.** 내가 원하지 않은 수정·명령이 확인 없이 들어가요. |

- 어떤 모드든 **질문의 선택과 계획 승인("Approve revision N")은 내가 직접 골라요.** 승인 모드는 명령 실행·파일 수정을 물을지만 정해요. AI 가 내 선택 없이 계획을 승인하려고 하면 키트가 막고, AI 가 다시 물어요.

**성공하면 보이는 것:** 승인 모드 메뉴에서 **Ask Approval (default)** 옆에 ✓ 가 있어요.

### 2-6. 수정·명령 허락 창

승인 모드가 default 라서, AI 가 파일을 쓰거나 고치거나 명령을 실행하려 할 때마다 Qwen Code 패널에 **허락 창**이 떠요. 버튼은 세 개예요.

| 버튼 | 언제 누르나요 |
|---|---|
| **`Yes, allow once`** | AI 가 파일을 쓰거나 명령을 실행하려 할 때, **파일 이름이나 명령이 맞는지 보고** 눌러요. 이번 한 번만 허락해요. 계획서는 파일을 읽지 않아도 돼요. AI 가 대화창에 짧게 요약해 줘요. |
| `Allow All Edits` | **누르지 마요.** 그 대화에서 이후 수정은 묻지 않고 모두 허락돼요. 수업에서는 권장하지 않아요. |
| `Reject` | 내용이 이상하면 눌러요. 그다음 대화창에 무엇이 이상한지 이유를 적어 줘요. |

꼭 구분해요

- **허락 창의 "허락"과 계획서의 "승인"은 달라요.** AI 가 계획서 파일을 쓰도록 `Yes, allow once` 를 누른 것은 계획을 **승인한 것이 아니에요.** 그냥 파일을 쓰게 한 거예요.
- **AI 는 선택지로 물어요.** 질문이 있으면 대화창에 고를 수 있는 답 몇 개가 떠요(미검증: Qwen 확장에서 보이는 실제 모양). 하나를 골라요. 맞는 게 없으면 **Other** 를 고르고 내 답을 직접 써요. 한 번에 4개까지 묻고, 나머지는 다음에 이어서 물어요.
- **승인도 선택지로 해요.** 만들기 전에 AI 가 대화창에 짧은 요약을 보여 줘요: 무엇을 만드는지, 정한 값(예: 색 역할 → 색), 하지 않을 것, 남은 질문 0개. 읽어 보고 **"Approve revision N"**(N 은 버전 번호)을 골라요. 고칠 게 있으면 **"Change something"** 을 고르고 대화창에 말로 알려 줘요. 부품·색 계획·글자 계획·페이지 모두 같아요. 계획서 파일은 열지 않아요. AI 가 대신 써요.
- 선택지가 안 뜨면 문장으로 써요: **"revision 1 승인. 이 계획대로 진행해 주세요."**
- 아무 말 안 하기, "좋아요", "괜찮네" 는 승인이 아니에요. AI 가 남은 질문이 없다고 해도 **그대로 믿지 마요.** 요약의 역할·근거를 하나씩 읽고, 모르는 곳은 질문해요.

**성공하면 보이는 것:** AI 가 파일을 쓰기 전마다 허락 창이 뜨고, 내가 `Yes, allow once` 를 눌러야 진행돼요. 만들기 전에는 요약과 **"Approve revision N"** 선택지가 떠요.

### 2-7. Qwen 이 중국어 등 다른 언어로 답할 때

Qwen Code 에는 **화면 언어**(메뉴·버튼 글자)와 **답변 언어**(AI 가 답하는 언어)가 따로 있어요. 화면 언어 목록에는 한국어가 없어서 영어 등으로 보일 수 있지만, 답변 언어는 따로 정할 수 있어요.

한국어로 물었는데 중국어 등 다른 언어로 답하면:

1. Qwen 대화 입력칸에 아래 둘 중 하나를 입력해요.
   - `/language output auto` — **내가 입력한 언어로** 답해요(한국어로 물으면 한국어로).
   - `/language output Korean` — **항상 한국어로** 답해요.
2. **새 대화**를 열고 다시 물어봐요.

**성공하면 보이는 것:** 한국어로 물으면 한국어로 답해요. (명령을 입력한 뒤 나오는 확인 문구는 미검증)

- **화면 언어를 바꾼 뒤**(예: `/language ui …`)에는 답변 언어가 함께 바뀔 수 있어요. 그러면 위 1~2번을 다시 해요.
- 확장 대화창에서 명령이 먹지 않으면, VS Code 에서 `DS-Starter` 폴더를 열고 새 터미널에서 `qwen` 을 직접 실행해(3-1) 같은 명령을 입력한 뒤, 터미널의 Qwen 을 닫고 확장 패널을 다시 열어요. 이 설정은 확장과 터미널이 함께 쓰는 사용자 설정에 저장돼요.
- 이 설정은 내 컴퓨터 전체에 적용돼요. 프로젝트 설정으로는 항상 덮어쓸 수 없어서 학생이 직접 지정해요.

### Mac 과 Windows 차이

- 확장 설치와 사용 방법은 같아요.
- **Mac: 터미널에서 `code` 명령 쓰게 하기.** Mac 의 VS Code 는 처음에 터미널의 `code` 명령이 꺼져 있을 수 있어요. VS Code 에서 `⌘ + Shift + P` 로 명령 팔레트를 열고 `Shell Command: Install 'code' command in PATH` 를 실행해요. 그러면 3장의 설치 스크립트가 Qwen Code 확장도 자동으로 설치할 수 있어요. 2-2 에서 확장을 이미 설치했다면 이 단계는 건너뛰어도 돼요.
  - **성공하면 보이는 것:** 새 터미널에서 `code --version` 을 실행하면 버전 숫자가 나와요.
- 다른 점은 사용자 설정 파일 위치(위 표)와 내가 터미널에 직접 치는 몇 가지 명령이에요. Windows 에서 `pnpm` 같은 명령이 "스크립트를 실행할 수 없습니다"로 막히면 `pnpm.cmd` 처럼 `.cmd` 를 붙여요.

---

## 3. 스타터킷 받기와 설치

VS Code 를 먼저 설치해 두세요(2-1). 설치 스크립트는 VS Code 를 설치하지 않아요.

1. 스타터킷 ZIP 을 받아요: <https://github.com/DearKim/DS-Starter-Kit/releases/latest/download/DS-Starter.zip>
2. 압축을 풀고, `DS-Starter` 폴더를 **OneDrive·iCloud 같은 동기화 폴더 밖**으로 옮겨요. 동기화 폴더(예: OneDrive 안의 바탕 화면·문서) 안에 두면 설치가 느려지거나 파일이 잠겨 실패할 수 있어요.
   - Mac: Finder 에서 `⌘ + Shift + H` 로 홈 폴더를 열고 끌어다 놓아요 → `~/DS-Starter`
   - Windows: 파일 탐색기 주소창에 `%USERPROFILE%` 을 입력해 홈 폴더를 열고, 압축을 푼 폴더 **안쪽의** `DS-Starter` 를 끌어다 놓아요 → `C:\Users\<내 이름>\DS-Starter`. 홈 폴더 바로 아래는 OneDrive 밖이에요. `C:\DS-Starter` 에 두어도 돼요. 홈 폴더 안의 `OneDrive` 폴더나, OneDrive 로 동기화되는 바탕 화면·문서에는 두지 마요.
   - 동기화 폴더 안에서 설치하면 `Warning: OneDrive sync can slow the install down or lock files. …` 가 나와요([오류 대처 안내서 A](troubleshooting.ko.md)).
3. VS Code 에서 **파일 → 폴더 열기**로 `DS-Starter` 를 열어요.
   - **성공하면 보이는 것:** 왼쪽 탐색기에 `package.json` 과 `setup-local.sh` 가 바로 보여요.
   - VS Code 가 "이 폴더의 작성자를 신뢰하나요?"라고 물으면 **신뢰**를 눌러요. 이 창에서 신뢰해야 프로젝트의 Qwen Code 설정(규칙 검사·Figma 연결·승인 모드)이 적용돼요.
4. **터미널 → 새 터미널**을 열고 내 컴퓨터에 맞는 명령을 붙여 넣은 뒤 Enter 를 눌러요.

   Mac:

   ```bash
   bash setup-local.sh
   ```

   Windows:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1
   ```

5. 설치 스크립트가 알아서 하는 일이에요. 이미 있는 프로그램은 다시 설치하지 않아요. 터미널에 단계 번호가 나와요(Mac `[1/6]`~`[6/6]`, Windows `[1/5]`~`[5/5]`).

   | Mac | Windows | 하는 일 |
   |---|---|---|
   | `[1/6] Installing Homebrew` (없을 때만 보여요) | — | Mac 프로그램 설치 도구 |
   | `[2/6] Node.js · pnpm` | `[1/5] Git · Node.js · pnpm` | Node.js 22 이상과 **pnpm 10.27.0** 준비 (Windows 는 Git 이 없으면 함께 설치). 버전이 다르면 `Installing pnpm 10.27.0 (current: …)` 가 나오고, 끝에 **`pnpm 10.27.0 OK (matches package.json)`** 가 나오면 됐어요. 멈추면 [오류 대처 안내서 A 의 pnpm 버전](troubleshooting.ko.md)을 봐요 |
   | `[3/6] Qwen Code CLI` | `[2/5] Qwen Code CLI` | 터미널용 Qwen Code(`@qwen-code/qwen-code@0.25.1`) 설치. 이미 있으면 `Qwen Code CLI is already installed. Skipping it and keeping your version.` |
   | `[4/6] Figma Desktop · Qwen Code extension` | `[3/5] Figma Desktop · Qwen Code extension` | Figma 데스크톱 앱(없을 때), Qwen Code 확장(`code` 명령을 쓸 수 있을 때만. 아니면 수동 설치 안내 → 2-2) |
   | `[5/6] Project packages · Chromium for checks` | `[4/5] …` | 프로젝트 패키지와 검사용 브라우저 |
   | `[6/6] Figma MCP · starting Storybook` | `[5/5] …` | Figma MCP 연결 설정, `qwen --version` 확인, Storybook 열기 |

6. 설치 프로그램의 메시지는 영어로 나와요. 단계 번호와 아래 표를 보면 어디까지 왔는지 알 수 있어요. Mac 은 비밀번호를 물을 수 있어요. 입력해도 화면에 안 보이는 게 정상이에요. Windows 는 "이 앱이 디바이스를 변경하도록 허용하시겠어요?"가 나오면 "예"를 눌러요.
7. 스크립트는 **Token Plan 키를 묻지도, 저장하지도 않아요.** 키는 2-3 에서 VS Code 확장에 연결해요.
8. 마지막 단계에서 터미널용 Qwen Code 버전을 확인해요. `Qwen Code CLI version OK. Run qwen yourself, by hand, in this project folder.` 가 나오면 됐어요.
   - **CLI 설치가 실패해도 나머지 설치는 계속돼요.** `Qwen Code CLI install failed. The rest of the install continues.` 나 `Qwen Code CLI did not run. Check your PATH in a new terminal. …` 가 나오면, 설치가 끝난 뒤 새 터미널에서 직접 설치해요.
     - Mac: `npm install -g @qwen-code/qwen-code@0.25.1`
     - Windows: `npm.cmd install -g @qwen-code/qwen-code@0.25.1`
   - 수업 기본은 **VS Code 확장**이라서, CLI 가 없어도 수업은 그대로 할 수 있어요.
9. 마지막 단계에서 설치가 **키트 검사(hook)를 켜요.** AI 가 규칙을 지키게 돕는 자동 검사예요.
   - `The kit's checks are turned on for this folder (Qwen hooks approved).` 가 나오면 됐어요.
   - Qwen 이 **"This project wants to run hooks"** 라고 물으면 **Approve hooks** 를 눌러요. **Keep disabled** 는 고르지 마요.
   - 확인하는 법: Qwen 대화창에 `/hooks` 를 입력해요. 키트 검사 옆에 `approved` 가 보이면 켜진 거예요. `disabled (not approved)` 가 보이면 [오류 대처 안내서 C 의 "키트 검사가 꺼졌어요"](troubleshooting.ko.md#키트-검사가-꺼졌어요)를 봐요.
   - 스타터킷을 새로 받았거나 키트가 바뀌었으면 **설치 명령을 다시 실행**해요. 다시 켜 줘요.

**성공하면 보이는 것:** 브라우저에 Storybook 이 열려요. 안 열리면 주소창에 `http://localhost:6006` 을 입력해요. 설치 마지막에 `In Qwen Code, type /auth and connect your Token Plan API key.` 와 `Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops.` 안내도 나와요.

- Storybook 이 돌아가는 터미널은 닫지 마요. 다른 명령은 터미널 오른쪽 위 **+** 로 새 터미널을 열어서 해요.
- 중간에 멈췄으면 같은 명령을 다시 실행해요. 이미 설치된 것은 다시 쓰고 나머지를 이어서 해요.
- 다른 날 Storybook 을 다시 열 때는 `DS-Starter` 폴더를 VS Code 로 열고 AI 에게 **"Storybook 열어 줘"** 라고 해요. AI 가 뒤에서 켜고 주소를 알려 줘요(미검증). 안 되면 예비책으로 새 터미널에서 실행해요: Mac `pnpm storybook`, Windows `pnpm.cmd storybook` (끌 때는 그 터미널에서 `Ctrl + C`).

### 3-1. 확장 대신 터미널에서 Qwen Code 쓰기 (선택)

**수업 기본은 VS Code 확장(2장)이에요.** 터미널이 편한 사람만 이 방법을 써요. 같은 Token Plan 크레딧을 써요.

> ⚠️ **`qwen -p` 나 스크립트로 Qwen 을 자동으로 부르는 것은 Token Plan 약관상 금지예요.** 사람이 터미널에서 직접 대화할 때만 써요. 어기면 구독이 정지될 수 있어요.

1. **설치 확인.** VS Code 에서 `DS-Starter` 폴더를 열고 새 터미널에서 실행해요.

   ```bash
   qwen --version
   ```

   **성공하면 보이는 것:** 버전 숫자(예: `0.25.1`). 명령을 찾지 못하면 위 8번의 수동 설치 명령을 실행하고 새 터미널을 열어요.
2. **내가 직접 실행.** 같은 프로젝트 폴더에서 `qwen` 을 입력해요(Windows 에서 막히면 `qwen.cmd`). 터미널 안에 대화 화면이 열려요(화면 문구는 미검증).
3. **키 연결.** 2-3 과 같아요. 대화 입력칸에 `/auth` → **Token Plan** → 지역을 물으면 **Singapore (International)** → 1장에서 복사한 키. 확장에서 이미 연결했다면 같은 사용자 설정(`~/.qwen/settings.json`)을 쓰기 때문에 다시 하지 않아도 될 수 있어요(미검증).
4. **폴더 신뢰·hook·MCP 확인.**
   - 이 폴더를 신뢰할지 물으면 **신뢰**해요. 그래야 프로젝트 규칙 검사(hook)와 Figma 연결 설정이 적용돼요(묻는 화면은 미검증).
   - `/mcp` 를 입력해 `figma-desktop` 이 **"Needs approval"** 이면 승인해요(4장).
5. **승인 모드는 default 그대로.** 프로젝트 설정이 default(고치기 전에 물어봄)로 되어 있어요. 수정·명령 허락은 2-6 과 같은 원칙으로 해요: 내용을 보고 한 번만 허락하고, 모든 수정을 자동으로 허락하는 선택은 고르지 마요(CLI 의 버튼·선택지 이름은 미검증).
6. 계획서 → 질문·답 → **"revision N 승인"** → 만들기 → 검사 순서는 5장과 같아요.

### 3-2. 내 폴더 3개와 AI 에게 하는 말

내가 쓰는 폴더는 이름이 `my-` 로 시작하는 셋뿐이에요. 폴더마다 쉬운 영어 안내(`README.md`)가 들어 있어요.

| 폴더 | 넣는 것 | AI 에게 이렇게 말해요 |
|---|---|---|
| `my-docs/inbox/` | 내 기획서: PRD·사용자 이야기·메모. 문서가 없으면 `my-docs/inbox/brief.md` 양식을 채워요. AI 가 이것을 `my-docs/specs/` 로 정리해요. | "기획서 정리해 줘." |
| `my-assets/` | 아이콘·그림·글꼴을 여기에 던져 둬요. AI 가 `icons/`·`images/`·`typo/` 로 나눠 옮겨요. | "my-assets 에 넣은 파일 정리해 줘." |
| `my-website/` | 내 웹사이트 페이지(`my-website/pages/`). 내가 승인한 페이지 계획으로 만들어요([6장](#6-페이지-34개-만들기)). | "내 기획서로 웹사이트 만들어 줘." |

- **내 말로 부탁하면 돼요.** 명령은 내가 치지 않아요. 키트의 명령은 AI 가 실행해요.
- **AI 가 명령을 실행할 때마다 허락 창이 떠요** → 무엇을 실행하는지 보고 `Yes, allow once` 를 눌러요(2-6).
- **지름길:** 말로 했는데 AI 가 다른 일을 하면, 메시지 맨 앞에 대화창 명령을 붙여요: `/my-docs`·`/my-assets`·`/my-website`·`/my-deploy` (예: `/my-docs 1. 네`). AI 가 키트의 순서를 그대로 따라요.
- AI 는 `my-docs/inbox/` 와 `my-assets/` 를 읽기만 해요. 거기 있는 내 원본 파일은 고치지 않아요.

**내 기획서 (`my-docs`)**

왜 하나요: AI 는 적힌 것만 만들어요. 빠진 내용은 지어내지 않고 나에게 물어봐요.

**PRD**(Product Requirements Document, 제품 요구사항 문서)는 무엇을, 누구를 위해, 왜 만드는지 적은 문서예요. 키트에서는 `my-docs/inbox/brief.md` 가 **내 PRD 초안**이에요. `my-docs/specs/` 는 **AI 가 정리한 PRD** 예요. 내 PRD 문서가 따로 있으면 `my-docs/inbox/` 에 넣어요.

```
내 메모(inbox/) → AI 가 계획서 4장(specs/)으로 정리 → 빠진 것은 질문으로 → 내가 답 → 질문 0개 → 다음 단계
```

1. 메모를 `my-docs/inbox/` 에 넣어요. `.md`·`.txt` 가 가장 좋아요. Word·PowerPoint·Excel·HWP 는 AI 가 읽지 못하니 `.md` 나 `.txt` 로 저장해요. PDF·그림은 내 AI 모델이 읽을 수 있을 때만 돼요. 메모가 없으면 `my-docs/inbox/brief.md` 양식을 채워요.
2. AI 에게 **"기획서 정리해 줘"** 라고 해요. AI 가 키트 명령을 실행하고(허락 창 → `Yes, allow once`) `my-docs/specs/` 에 파일 4개(`constitution.md`·`spec.md`·`plan.md`·`tasks.md`)를 써요. 그리고 빠진 것을 대화창에서 **선택지로** 물어봐요(한 번에 4개까지). 파일에는 AI 가 빠진 내용마다 `[NEEDS CLARIFICATION: …]` 를 표시해 둬요.
3. 질문마다 답을 골라요. 맞는 게 없으면 **Other** 를 고르고 직접 써요. 답은 AI 가 파일에 적어요. `specs/` 에서 바꾸고 싶은 게 있으면 AI 에게 말로 해요. 예: "메뉴 페이지 제목을 Our Drinks 로 바꿔 줘." 선택지가 안 뜨면 같은 번호로 답해요. 예: `1. 지금은 예약 주문 안 해요. 2. Our Menu`.
4. AI 에게 **"남은 질문 있어?"** 라고 물어요. AI 가 확인 명령(`pnpm specs`)을 실행하고(허락 창 → `Yes, allow once`) inbox 의 새 파일·바뀐 파일과 남은 질문을 보여 줘요.

**성공하면 보이는 것:** AI 가 `Open questions [NEEDS CLARIFICATION]: 0` 과 `Specs are ready. Next: ask the AI in your own words to make your website from these specs.` 를 보여 줘요.

- 나중에 메모를 더하거나 고쳤으면 **"기획서 정리해 줘"** 라고 다시 말해요. 새 파일·바뀐 파일만 읽어요.

작은 예시(가상의 카페예요. 실제 AI 질문은 말이 조금 달라요):

1. `my-docs/inbox/notes.md` 에 두 줄을 써요.

   ```
   Bean There is a small café. Visitors should see our menu and find us.
   Maybe online pre-order later?
   ```

2. "기획서 정리해 줘" 라고 말해요. AI 가 파일 4개를 쓰고 선택지로 물어요. 예: `Online pre-order: build it now, or leave it out?`(선택지 `Leave it out for now` / `Build it now`), `What is the exact title of the menu page?`
3. 첫 질문은 `Leave it out for now` 를 고르고, 제목은 **Other** 를 골라 `Our Menu` 라고 써요. AI 가 답을 파일에 넣고, `spec.md` 의 "Clarifications" 에도 적어 둬요.

사용자 이야기와 정책은 누가 쓰나요? AI 가 초안을 써요. 정하는 건 나예요.

- **사용자 이야기(User Story)** 는 누가, 무엇을, 왜 원하는지 한 문장으로 쓴 거예요. 예: "As a visitor, I want to see the menu with prices so that I know what to order." P1·P2·P3 은 중요한 순서예요.
- **정책(Policy)** 은 서비스의 규칙이에요. 예: 예약 취소 규칙. `spec.md` 의 요구사항(`FR-001` …)으로 들어가요. 내 규칙은 내 메모에 적어요.
- 빠진 것은 AI 가 지어내지 않아요. `[NEEDS CLARIFICATION: …]` 로 적고 나에게 물어요. 내가 답해요.

`my-docs` 에서 보게 될 낱말:

| 낱말 | 뜻 |
|---|---|
| PRD | 제품 요구사항 문서예요. 무엇을, 누구를 위해, 왜 만드는지 적어요. `inbox/brief.md` 가 내 초안이고, `specs/` 가 AI 가 정리한 PRD 예요. |
| Spec Kit | AI 가 써 주는 짧은 계획서예요. `my-docs/specs/` 의 파일 4개예요. |
| inbox | `my-docs/inbox/`, 내 메모예요. AI 는 읽기만 하고 고치지 않아요. |
| specs | `my-docs/specs/`, 정리된 계획서예요. AI 가 써요. 바꾸고 싶으면 AI 에게 말해요. |
| `constitution.md` | 모든 단계가 지킬 규칙이에요: 목표·사용자·원칙·말투·분위기, 그리고 이번에 하지 않을 것(out of scope). |
| `spec.md` | 사이트가 **무엇**을 하고 **왜** 하는지예요: 사용자 이야기·요구사항·성공 기준. |
| `plan.md` | **어떻게** 만들지예요: Storybook 부품, 그다음 페이지 3~4개의 주소와 정확한 문구. |
| `tasks.md` | 내가 할 일을 순서대로 적은 목록이에요. 하나 끝내면 AI 에게 그 칸을 체크해 달라고 해요. |
| user story (사용자 이야기) | 방문자가 원하는 것 하나를 한 문장으로 쓴 거예요: "As a USER, I want TO DO SOMETHING so that REASON." |
| P1 / P2 / P3 | 이야기의 중요도예요. P1 = 꼭 있어야 해요. P2, P3 은 그다음 순서로 덜 중요해요. |
| requirement (`FR-001`) | 사이트가 꼭 지킬 규칙이에요. 예: "The site MUST …". FR 은 "기능 요구사항(functional requirement)"이에요. |
| policy (정책) | 서비스의 규칙이에요. 예: 예약 취소 규칙. `spec.md` 에서 요구사항(`FR-…`)이 돼요. |
| success criteria (`SC-001`) | 사이트가 잘 되는지 아는 방법이에요. 내 메모에 있는 목표만, 확인할 수 있게 써요. |
| edge case | 뭔가 잘못되거나 비어 있을 때 어떻게 되는지예요. |
| Given / When / Then | 이야기 하나를 확인하는 짧은 시험이에요: Given(처음 상태), When(방문자가 한 일), Then(일어나는 일). |
| `[NEEDS CLARIFICATION: …]` | 나에게 묻는 질문이에요. AI 가 추측하는 대신 빠진 자리에 써 둬요. |
| Clarifications | `spec.md` 끝의 목록이에요. 답한 질문이 `Q: … → A: …` 로 쌓여요. |
| `sources.md` | AI 가 이미 읽은 inbox 파일 목록이에요. AI 가 기획서를 정리할 때 키트가 써요. 고치지 마요. |

**아이콘·그림·글꼴 (`my-assets`)**

1. 파일을 하위 폴더가 아니라 `my-assets/` 바로 아래에 저장해요. 아이콘은 Figma 에서 SVG 로 내보내요. 그림은 `.png`·`.jpg`·`.webp`·`.gif`·`.avif`·`.svg`, 글꼴은 `.woff2`·`.woff`·`.ttf`·`.otf` 예요.
2. AI 에게 **"my-assets 에 넣은 파일 정리해 줘"** 라고 해요. AI 가 정리 명령(`pnpm assets`)을 실행해요(허락 창 → `Yes, allow once`). 파일마다 `icons/`·`images/`·`typo/` 로 옮기고 이름을 정리해요(예: `Hero Photo.PNG` → `hero-photo.png`). 내 파일을 지우지는 않아요.
3. SVG 가 아이콘인지 그림인지 헷갈리면 옮기지 않고 AI 가 나에게 물어요. 말로 답해요. 예: **"logo.svg 는 아이콘이야."** AI 가 옮겨요(허락 창 → `Yes, allow once`).

**성공하면 보이는 것:** AI 가 보여 주는 마지막 줄에 `All good. Icons: <개수> · Images: <개수> · Fonts: <개수> file(s). See Storybook → Foundation → Icons / Images / Typography.` 가 나오고, Storybook 의 **Foundation → Icons**·**Foundation → Images**·**Foundation → Typography** 에서 내 파일이 보여요.

- `✗` 표시가 붙은 파일은 고쳐야 해요. 같은 줄에 고치는 법이 나와요([오류 대처 안내서 L](troubleshooting.ko.md)).
- 아이콘은 부품을 만들 때 파일 이름을 말해요. 예: "Use my-assets/icons/cart.svg". 그림은 넣어도 되고 안 넣어도 돼요. 쓰려면 페이지를 계획할 때 `my-assets/images/` 의 파일 이름과 그림 설명(alt 글)을 말해요. 그림이 없으면 그림 없이 계획해요.
- `my-assets/typo/` 의 글꼴은 Storybook 과 내 웹사이트에 저절로 등록돼요. 부품이 그 글꼴을 쓰게 하려면 [5-2](#5-2-글자글꼴크기줄-간격-바꾸기--선택)를 봐요.
- ⚠️ `my-assets/typo/` 의 글꼴 파일은 쓰지 않아도 내 웹사이트·Storybook 과 함께 인터넷에 올라가요. 주소를 알면 누구나 내려받을 수 있어요. 라이선스가 웹사이트 사용을 허락하는 글꼴만 넣어요. 잘 모르겠으면 넣지 않아요. 글꼴이 있으면 정리 결과에 `! Fonts in my-assets/typo go online with your website and Storybook, so anyone can download them.` 라고 알려 줘요.

---

## 4. Figma MCP 연결

Figma MCP 는 AI 가 내 Figma 디자인을 읽게 해 주는 다리예요. **순서가 중요해요.** 이 순서를 바꾸면 AI 가 Figma 를 읽지 못해요.

1. **Figma 데스크톱 앱에서 파일을 열어요.** 웹 브라우저의 Figma 로는 안 돼요. 인증받은 학생 계정으로 로그인하고, 작업할 디자인이 있는 파일을 열어요.
2. **Dev Mode 로 바꿔요.** `Shift + D` 를 눌러요.
3. **MCP 를 켜요.** 오른쪽 패널의 MCP server 영역에서 **Enable desktop MCP server** 를 켜요.
4. **연결을 확인해요.**
   - AI 에게 **"Figma 연결 확인해 줘"** 라고 해요. AI 가 확인 명령(`pnpm mcp:setup`)을 실행해요(허락 창 → `Yes, allow once`).
   - **성공하면 보이는 것:** AI 가 `figma-desktop connected` 를 보여 줘요.
5. **Qwen Code 에서 한 번 승인해요.** 대화 입력칸에 `/mcp` 를 입력하면 `figma-desktop` 이 처음에는 **"Needs approval"** 로 보여요. 골라서 승인해요. 처음 한 번만 하면 돼요.
   - **성공하면 보이는 것:** `figma-desktop` 이 더 이상 "Needs approval" 이 아니고 연결된 상태로 보여요. (연결 후 표시 문구는 미검증)
6. **그다음 AI 와 대화를 시작해요.** Figma 를 켜기 전에 열어 둔 대화가 있으면 **새 대화**를 열어요. 그래도 안 되면 VS Code 를 껐다 켜요(미검증).

작업하는 동안 **Figma 파일은 계속 열어 둬요.** VS Code 에 Figma 관련 확장은 설치하지 않아요(2-2).

---

## 5. AI 와 일하는 순서

AI 는 바로 만들지 않아요. 언제나 **질문을 선택지로 묻고, 대화창에 짧게 요약한 뒤, 내가 "Approve revision N" 을 골라야** 만들어요.

### 5-0. 내 Figma 색 가져오기 — AI 가 먼저 해요

처음 Figma 링크를 보내면 AI 가 **부품보다 먼저 내 색을 가져와요.** 부품 링크를 보내도 되고, "내 Figma 색 가져와 줘"라고 링크와 함께 말해도 돼요. 나는 명령을 치지 않아요.

| 단계 | 내가 할 일 | 성공하면 보이는 것 |
|---|---|---|
| ① 링크 보내기 | Figma 링크와 부탁 한 줄을 보내요. | AI 가 "색을 먼저 가져올게요" 같은 말을 해요. |
| ② 허락 | 허락 창이 뜨면 `Yes, allow once` 를 눌러요. AI 가 색 가져오기 명령을 실행해요. | AI 가 가져온 색을 한두 줄로 알려 줘요(예: 추가된 색, 바뀐 색). |
| ③ 색 역할 한 번에 고르기 | 역할(배경·글자·주 색 등)이 비어 있으면 AI 가 **추천 표**(역할 → 색, 이유)를 보여 주고 한 번만 물어요. 괜찮으면 **"Use these roles (Recommended)"** 를 골라요. 바꾸고 싶으면 **"Change some roles"** 를 고르면 AI 가 그 역할만 다시 물어요. | AI 가 짧은 요약을 보여 줘요. |
| ④ 승인 | 요약이 맞으면 **"Approve revision N"** 을 골라요. 허락 창이 뜨면 `Yes, allow once`. | AI 가 색을 적용하고 부품 계획으로 넘어가요. |

- **새 색이 들어간 부품 링크를 나중에 보내도 돼요.** AI 가 다시 색을 가져와서 차이(새로 추가된 색, 값이 바뀐 색)를 짧게 알려 줘요. 예전에 가져온 색은 지워지지 않아요.
- **Figma 에서 색 값을 바꿨다면** 그 색을 쓰는 부품 링크를 보내거나 "Figma 색 다시 가져와 줘"라고 링크와 함께 말해요. 역할은 그대로이고 값만 바뀌어요.
- **AI 가 "명령을 입력해 주세요", "파일을 고쳐 주세요", "보호를 꺼 주세요"라고 하면 따르지 마요.** 그런 일은 AI 가 직접 하거나, 할 수 없는 일이에요. 화면을 캡처해 강사에게 보여 줘요.
- AI 가 `Type /mcp in the chat, approve figma-desktop, then start a new chat.` 라고 하면 대화창에 `/mcp` 를 입력해 `figma-desktop` 을 승인하고 **새 대화**를 열어요(4장).

### 5-1. 부품 만드는 순서

**부품마다 새 대화**를 열어요. 정한 내용은 계획 파일에 남고, 짧은 대화가 크레딧을 훨씬 덜 써요.

| 단계 | 내가 할 일 | 성공하면 보이는 것 |
|---|---|---|
| ① 부탁하기 | 대화창에 부탁 한 줄과 Figma 링크를 보내요. | AI 가 Figma 를 읽기 시작해요. |
| ② 질문 받기 | 기다려요. | AI 가 대화창에 질문을 선택지로 보여 줘요. |
| ③ 답하기 | 질문마다 답을 골라요(맞는 게 없으면 Other 에 직접 써요). 틀린 곳은 말로 고쳐 달라고 해요. | 질문이 없어지고 AI 가 대화창에 짧은 요약을 보여 줘요. |
| ④ 승인 | 요약을 읽고 맞으면 **"Approve revision N"** 을 골라요. (선택지가 안 뜨면 "revision 1 승인. 이 계획대로 진행해 주세요." 라고 써요.) 허락 창의 `Yes, allow once` 는 승인이 아니에요(2-6). | AI 가 파일을 만들기 시작해요. |
| ⑤ 검사 | AI 가 검사(`pnpm ai:check <이름>`, `pnpm ai:verify <이름>`)를 직접 돌려요(허락 창 → `Yes, allow once`). 안 돌리면 "검사해 줘"라고 해요. 결과를 같이 봐요. | AI 가 검사 통과 메시지를 보여 줘요. |
| ⑥ 눈으로 확인 | Storybook 에서 모양과 움직임을 Figma 와 비교해요. 이상하면 다시 부탁해요. | Figma 와 같아 보여요. |

부탁 예시

```
이 Figma 노드를 이 프로젝트의 Storybook 컴포넌트로 만들어 줘.
https://www.figma.com/design/...?node-id=...
```

주의

- 승인 모드는 **default**(고치기 전에 물어봄)를 권장해요. 자동 승인 모드로 바꾸면 원치 않는 수정이 들어가거나 크레딧이 더 들 수 있어요(2-5).
- 순서: 먼저 **토큰(색·글자·간격)** → 그다음 **컴포넌트**(버튼, 입력칸 등) 하나씩.
- Figma 부품의 종류(변형) 중 일부만 만들고 싶으면 링크와 함께 말해요. 예: "Only the Default Card type for now." AI 는 고른 종류만 만들어요.

**AI 가 이렇게 말하면 (Figma 읽기·검사 시간 안내)**

Qwen Code 는 Figma 를 읽거나 검사하는 일을 1분 안에 끝내야 해요. 그래서 오래 걸리면 아래처럼 안내하고 멈춰요. **오류가 아니에요.**

| AI 가 하는 말 | 뜻 | 내가 할 일 |
|---|---|---|
| `Still reading the Figma design. Send the same request again in 1–2 minutes.` | Figma 를 뒤에서 계속 읽고 있어요. | 1~2분 기다렸다가 **똑같은 요청(같은 링크)** 을 다시 보내요. 다른 요청이나 새 링크로 바꾸지 마요. 다시 보내면 읽어 둔 결과를 쓰고 Figma 를 다시 읽지 않아요. |
| `Figma did not answer. Make sure the Figma desktop app is open with this file, then send the same message again.` | Figma 가 디자인을 보내 주지 않아서 AI 가 멈췄어요(계획·아이콘 그리기 없음). | Figma 데스크톱 앱에서 이 파일을 열고(MCP 켜짐) **똑같은 메시지**를 다시 보내요 — 그러면 다시 읽어요. 그래도 같으면 AI 에게 "Figma 연결 확인해 줘" → `figma-desktop connected` 를 확인해요(4장). |
| `This link is a big frame or a whole page. Please send the link to the one part you want to build.` | 링크가 화면 전체나 큰 프레임을 가리켜요. | **웹사이트**라면 링크와 함께 말해요. 예: "이 Figma 화면으로 내 웹사이트 만들어 줘 Home: <링크>". AI 가 알아서 사진을 저장해요(6-2). **부품**이라면 Figma 에서 만들 부품(컴포넌트 세트) 하나를 선택하고 **링크 복사**로 받은 주소를 보내요. |
| `Some checks did not run in time — run pnpm ai:check <이름> … again yourself with the shell tool now. …` | 시간 안에 검사를 다 하지 못했어요. 아직 "검사 통과"가 아니에요. | AI 가 같은 검사를 스스로 다시 실행해요(허락 창 → `Yes, allow once`). 그래도 끝나지 않을 때만 AI 가 새 터미널에서 명령(예: `pnpm ai:check Button`, 페이지면 `pnpm ai:check-page <이름>`)을 직접 치라고 알려 줘요. 그다음 결과를 봐요. |

- 화면에 `Request timed out waiting for hook-execution-response` 가 보이면 예전 스타터킷일 수 있어요. 사전 준비 페이지의 버전 날짜보다 먼저 받은 ZIP 이면 3장의 링크로 최신 ZIP 을 다시 받아요([오류 대처 안내서 C](troubleshooting.ko.md#c-qwen-code-패널-ai-대화창)).

### 5-2. 글자(글꼴·크기·줄 간격) 바꾸기 — 선택

**기본은 바꾸지 않는 거예요.** 글자는 스타터킷 기본값을 그대로 써요. 할 일도 없고, 크레딧도 들지 않아요. AI 가 Figma 색을 가져올 때(AI 가 `pnpm ds:figma` 를 실행해요) 아래 줄이 보이면 그대로 두면 돼요.

```text
Text: the starter defaults stay. If you do not change them, you need no text plan and no extra steps.
```

**내 Figma 글자로 바꾸고 싶을 때만** 이 순서로 해요.

1. **색 역할 적용을 먼저 끝내요.** 색 계획(`docs/plans/tokens.md`)을 승인하고 적용한 다음에 해요.
2. AI 에게 글자 계획을 부탁해요. 예: "내 Figma 글자로 바꾸고 싶어. 글자 계획(`docs/plans/typography.md`)을 만들어 줘." AI 는 `docs/templates/typography-plan.md` 양식으로 계획서를 써요. 파일을 쓸 때 허락 창이 뜨면 `Yes, allow once`(2-6).
3. AI 의 질문에 선택지를 골라 답해요(맞는 게 없으면 Other 에 직접 써요). 예: 여러 글꼴 중 **대표 글꼴** 하나, 단위가 없는 **줄높이의 단위**(percent·px·배수). 숫자만 보고 단위를 짐작하지 말고 Figma 원본에서 확인해요.
4. **고른 글꼴을 확인해요.** Storybook → Foundation → Typography 에서 **Loaded** 로 보이거나(파일은 `my-assets/typo/` 에 있어요, [3-2](#3-2-내-폴더-3개와-ai-에게-하는-말) 참고) 컴퓨터 기본 글꼴이어야 해요. AI 가 그 글꼴이 Loaded 로 보이는지 선택지로 물으면 **예** 를 골라요. (준비 명령은 이 확인이 있어야 통과해요.)
5. AI 가 계획을 준비해요. 안 하면 **"글자 계획 준비해 줘"** 라고 해요. AI 가 준비 명령(`pnpm ds:apply-token-plan docs/plans/typography.md --prepare`)을 실행해요(허락 창 → `Yes, allow once`). 이 명령은 승인하지 않고 바뀔 값만 보여 줘요.

   **성공하면 보이는 것:** AI 가 보여 주는 `Updated the text style plan's source, base token and content hashes. status is review-required. Summarize the changes for the student in the chat and ask them to approve with a choice (Approve revision N / Change something).` 와, 바뀔 토큰 목록(`--font-sans → …` 같은 줄)
6. AI 가 대화창에 바뀔 값을 보여 줘요. 맞으면 **"Approve revision N"** 을 골라요. 고칠 곳이 있으면 **"Change something"** 을 고르고 말로 알려 줘요. AI 가 계획을 고치고 5번부터 다시 해요.
7. 승인하면 AI 가 같은 명령을 `--prepare` 없이 실행해요(허락 창 → `Yes, allow once`). 그 전에 멈추면 **"글자 계획 적용해 줘"** 라고 해요.

   **성공하면 보이는 것:** AI 가 보여 주는 `Applied the approved text style plan and regenerated with ds:tokens. Tokens changed: <개수>. All other tokens stay the same.`
8. Storybook 에서 글자가 어떻게 보이는지 확인하고, 글자 때문에 모양이 바뀐 부품은 **시각 검수를 다시** 해요.

알아 둘 것

- 바꿀 수 있는 것은 **이미 있는 글자 토큰 값뿐**이에요: 글꼴(`--font-sans`), 글자 크기(`--text-body-2`·`--text-body-1`·`--text-title`), 굵기(`--font-weight-*`), 줄 간격(`--leading-tight`·`--leading-normal`). 새 글자 이름을 만들지는 않아요.
- 내 글꼴 파일을 쓰려면 `my-assets/` 에 넣고 AI 에게 정리해 달라고 해요(3-2). 그러면 Storybook 과 내 웹사이트에 저절로 등록돼요. `my-assets/typo/` 에 파일이 없고 컴퓨터에도 없는 글꼴은 브라우저가 **다른 글꼴로 대신 보여 줘요.**
- 라이선스가 웹사이트 사용을 허락하는 글꼴만 써요. 글꼴 파일은 인터넷에 올라가서 누구나 내려받을 수 있어요(3-2).
- **다시 승인해야 할 때:** 글자를 바꾼 뒤 AI 가 Figma 를 다시 가져오면 토큰 단계(AI 가 실행하는 `pnpm ds:tokens`)가 `Text style plan: The source or base tokens behind the saved text style choices changed. Approve the text style plan again.` 로 멈출 수 있어요. 고장이 아니에요. AI 에게 **"글자 계획 다시 승인할게"** 라고 해요. AI 가 새 revision 을 만들고, 5~7번(준비 → "Approve revision N" 고르기 → 적용)을 다시 하면 돼요. 적용할 때 `The text style source or base token hash does not match. Review it as a new revision.` 가 나와도 같은 방법으로 해요.
- **기본 글자로 되돌리고 싶으면** 아래 명령을 **내가 직접** 터미널에서 실행해요. 내가 승인한 선택을 지우는 일이라 내 손으로 확인해야 해요. ⚠️ **AI 에게 시키지 마요** — AI 의 셸이나 파이프로 실행하면 거부돼요.

  ```bash
  pnpm ds:reset-typography
  ```

  1. 무엇을 하는지 안내가 나와요: `This removes all approved text style choices and regenerates the project's default font, sizes, weights and line heights.` / `Color roles, the Figma source and existing plans are kept. …`
  2. `If you checked this yourself and agree, type "reset text styles" (anything else cancels):` 에 **`reset text styles`** 를 영어 소문자 그대로 입력하고 Enter. 다른 것을 입력하면 `Text style reset canceled. Nothing was changed.` 가 나오고 아무것도 바뀌지 않아요.

  **성공하면 보이는 것:** `The student confirmed. Text styles are back to the defaults and were regenerated with ds:tokens.` / `The old text style plan was kept. …`
  - **색 역할, Figma 원본, 계획서(`docs/plans/typography.md` 포함)는 그대로 남아요.** 바뀌는 것은 글자 토큰뿐이에요.
  - 되돌린 뒤 Storybook 에서 화면을 보고, 글자 때문에 모양이 바뀐 부품은 시각 검수를 다시 해요.
  - 원래 기본값을 쓰고 있었다면 `Text styles already use the defaults. Nothing was changed.` 가 나와요. 할 일이 없어요.
  - 다시 내 글자로 바꾸려면 위 1~8번을 다시 해요(AI 가 새 revision 을 만들고 준비부터 해요).

---

## 6. 페이지 3~4개 만들기

페이지도 부품과 같아요. **계획서 → 질문·답 → 내가 승인 → 만들기 → 검사 → 눈으로 확인** 순서예요. 다른 점은 페이지 뼈대를 AI 가 쓰는 게 아니라 **AI 가 실행하는 키트 명령(`pnpm ds:page`)이 만든다**는 거예요. 그래서 크레딧이 덜 들어요.

### 6-1. 지켜야 할 것

- 페이지는 **부품 목록에 있는 부품으로만** 만들어요. 페이지에서 새 버튼·새 스타일을 따로 만들지 않아요.
- **내가 고치지 않은 스타터 부품은 바로 페이지에 쓸 수 있어요.** AI 에게 **"Button 을 페이지에 쓸 수 있는지 확인해 줘"** 라고 해요. AI 가 부품 목록(`pnpm ds:catalog Button`)을 찾아보고(허락 창 → `Yes, allow once`) `Status: starter`, `Page use: full public API`, `Reason: Starter part, unchanged` 를 보여 줘요.
- **내가 고치거나 AI 와 새로 만든 부품은 내가 직접 확인하기 전까지 막혀 있어요.** 부품 목록에 `Page use: blocked` 와 함께 예를 들어 `Reason: Starter part changed: …` 가 나와요.
  1. Storybook 에서 그 부품의 모든 모양·마우스 올리기·누르기·Tab·비활성을 직접 봐요.
  2. 새 터미널에서 `pnpm ds:review <이름>` 을 **내가 직접** 실행해요(예: `pnpm ds:review Button`). 내가 눈으로 확인했다는 기록이라 AI 가 대신하면 안 돼요 — AI 의 셸에서는 거부돼요.
  3. 질문에 답해요: 내 이름, 확인한 예시 번호, 확인 항목마다 예/아니요. 마지막 `선택한 범위와 답변을 저장할까요?` 에 `예` 로 답해요.
  - **성공하면 보이는 것:** `검수 기록 저장: <이름> (승인) / Review saved: <이름> (approved)`. 그러면 페이지는 내가 확인한 모양·상태만 쓸 수 있어요. 확인 항목에 `아니요` 로 답하면 반려로 저장되고, 그 부품은 계속 막혀 있어요.
- 막힌 부품이나 확인하지 않은 모양(예: Button 의 아이콘 붙은 모양)을 쓰려고 하면 `BLOCKED_CATALOG: …` 로 멈춰요([오류 대처 안내서 H](troubleshooting.ko.md)).
- 실제 이름·전화번호 같은 개인 정보는 넣지 마요. 배포하면 링크가 있는 누구나 볼 수 있어요.

### 6-2. 순서

1. **기획서를 먼저 끝내요.** AI 에게 **"남은 질문 있어?"** 라고 물어서 남은 질문이 없어야 해요([3-2](#3-2-내-폴더-3개와-ai-에게-하는-말)).
2. **AI 에게 웹사이트를 부탁해요. Figma 화면이 있으면 링크도 함께 보내요.** 페이지마다 Figma 에서 화면 프레임을 선택하고 **Copy link to selection** 으로 링크를 복사해요. 예: **"이 Figma 화면으로 내 웹사이트 만들어 줘 Home: <링크> Menu: <링크>"**. 명령은 내가 치지 않아요 — AI 가 먼저 Figma 연결을 확인하고 화면 사진을 저장해요(허락 창 → `Yes, allow once`).

   **성공하면** AI 가 `Figma MCP: connected.` 와 `Saved: my-website/figma/Home.png` 를 보여 줘요. 이 사진은 마지막에 비교할 때만 써요. 페이지에 넣는 그림이 아니에요. 화면 하나에 Figma MCP 를 2번 써요(Starter 는 한 달 20번).
   - AI 가 연결할 수 없다고 알려 주면 먼저 연결을 확인해요([4장](#4-figma-mcp-연결)): Figma 앱에서 파일을 열고 Dev Mode → Enable desktop MCP server 를 켠 뒤 같은 메시지를 다시 보내요.
   - 그래도 안 되면 예비책으로 직접 내보내요: 프레임 선택 → 오른쪽 패널 **Export** → **PNG**, **1x** → **Export**, 그리고 `my-website/figma/Home.png` 로 저장해요([오류 대처 안내서 I](troubleshooting.ko.md#i-페이지-만들기빌드-dspage--aicheck-page--webbuild)).
3. **AI 가 페이지 계획을 써요.** AI 가 `my-docs/specs/plan.md` 와 `my-docs/specs/spec.md` 를 읽고, 필요한 부품만 찾아본 뒤, `docs/templates/page-plan.md` 양식으로 영어 페이지 계획 `docs/plans/pages/<사이트 이름>.md` 를 써요(파일을 쓸 때 허락 창 → `Yes, allow once`, 2-6). 그리고 질문을 선택지로 묻고 기다려요.
   - 기획서에 아직 질문이 남아 있으면 기획서부터 끝내자고 알려 줘요(3-2).
   - 계획에는 사이트 제목·언어, 페이지 목록과 주소(첫 페이지는 `/`), 페이지마다 섹션 → 쓸 부품 → 문구, 페이지 사이 이동, 화면 크기별 배치가 들어가요. AI 가 요약에서 알려 줘요.
4. **질문에 답하고 틀린 곳을 고쳐 달라고 해요.** 질문마다 선택지를 골라요(맞는 게 없으면 Other 에 직접 써요). 문구·이동·배치를 내가 정해요. 질문이 다 풀려야 승인할 수 있어요.
5. **승인해요.** 대화창의 짧은 요약(페이지·주소·문구·하지 않을 것·남은 질문 0개)을 읽고 맞으면 **"Approve revision N"** 을 골라요. (선택지가 안 뜨면 "revision 1 승인. 이 계획대로 진행해 주세요." 라고 써요.)
6. **AI 가 페이지 뼈대를 만들어요.** 승인하면 AI 가 키트의 페이지 명령(`pnpm ds:page`)을 실행해요(허락 창 → `Yes, allow once`).

   **성공하면 보이는 것:** AI 가 보여 주는 `Made the page skeleton from the approved plan: <만든 파일들>. Connect the data/event slots you declared, then check with ai:check-page. The human review is a separate step.` — `my-website/pages/<이름>Page.tsx`·`.css` 파일과 사이트 설정(`web.config.json`)이 생겨요. 이미 있는 파일은 덮어쓰지 않아요.
7. **AI 가 빈칸을 채워요.** 뼈대에는 버튼을 눌렀을 때 할 일 같은 빈칸(`PAGE_SLOT`)이 있어요. AI 는 계획에서 정한 동작만 채워요. 그 전에 멈추면 **"계획에 있는 것만 페이지 빈칸 채워 줘"** 라고 해요.
8. **AI 가 페이지마다 검사해요.** 페이지 검사, 그다음 타입·규칙·빌드 검사(`pnpm ai:check-page`, `pnpm typecheck`, `pnpm ds:guard`, `pnpm web:build`)를 실행하고(허락 창마다 `Yes, allow once`) 결과를 보여 줘요.

   **성공하면 보이는 것:** 페이지마다 AI 가 `<이름>: static check passed, READY_FOR_REVIEW. A person must still check the real screen, events and responsive layout, and compare it with the original.` 를 보여 줘요. 오류가 나오면 [오류 대처 안내서 I](troubleshooting.ko.md)를 봐요.
   - `Check the visuals again (the behavior review and page use still count): …` 가 함께 나오면 오류가 아니라 안내예요. 페이지는 계속 만들고, 그 부품의 색·모양을 나중에 다시 봐요.
9. **눈으로 확인해요.** AI 에게 **"내 사이트 열어 줘"** 라고 해요. AI 가 뒤에서 켜고 주소를 알려 줘요(미검증). 안 되면 예비책으로 새 터미널에서 `pnpm web:dev`(Windows `pnpm.cmd web:dev`)를 실행해요. 페이지마다 주소창에 주소를 직접 입력해 들어가 보고(예: `/`, `/menu`) 새로고침해요. 링크 이동·뒤로/앞으로 가기, 버튼·입력, 화면을 좁혔을 때 배치를 확인해요. **검사 통과(READY_FOR_REVIEW)는 사람 확인을 마쳤다는 뜻이 아니에요.**
   - Figma 사진이 있으면 AI 가 마지막에 `pnpm web:compare` 를 실행하고 비교 페이지 경로(`var/compare/<Page>/index.html`)를 알려 줘요(허락 창 → `Yes, allow once`). 그 파일을 브라우저로 열어 봐요. 왼쪽에 Figma, 오른쪽에 내 사이트가 나오고, **Overlay** 를 누르면 두 그림을 겹쳐 볼 수 있어요. 섹션·순서·문구·색·간격·그림·빠진 부품을 봐요. 점수는 없어요. 다른 곳을 고치려면 AI 에게 계획 revision 을 요청해요.
   - 완벽히 같지 않아도 정상이에요. 글꼴과 브라우저가 조금씩 다르게 그리기 때문이에요.

- 계획을 바꾸고 싶으면 AI 에게 무엇을 바꿀지 말해요. AI 가 새 revision 을 만들어 요약을 다시 보여 주면 다시 승인해요. 이미 만든 페이지 파일은 자동으로 바뀌지 않으니, AI 와 함께 계획과 대조해 고쳐요.

### 6-3. 인터넷에 올리기(배포)

왜 하나요: 지금 내 사이트는 내 컴퓨터에서만 열려요. 배포하면 인터넷에 올라가서, 링크만 있으면 누구나 열 수 있어요. 배포는 수업에서 함께 해요. 자세한 내용은 [배포 안내](../vercel-deployment.md)에 있어요.

보게 될 낱말:

- **Preview** — 시험용 주소예요. 먼저 여기서 확인해요.
- **Production** — 누구나 여는 진짜 주소예요.
- **token (토큰)** — 프로그램용 비밀번호 같은 비밀 열쇠예요. Vercel 에서 받아요(2안만).
- **repository (저장소)** — GitHub 에 저장한 프로젝트 폴더예요(1안만).
- **commit** — 바꾼 내용을 짧은 메모와 함께 저장한 기록이에요(1안만).
- **branch (브랜치)** — 저장소 안의 따로 떨어진 작업 줄기예요(1안만).
- **Production Branch** — Vercel 이 진짜 주소에 올리는 브랜치 하나예요(1안만).

**수업은 2안으로 해요**

**수업에서는 2안(Vercel 방식)으로 해요.** 1안(GitHub 방식)은 원하는 사람만 하는 선택이에요. 이 절 끝의 "선택: 1안 — GitHub 방식"에 있어요.

처음 한 번 하나를 골라요. 어느 쪽이든 웹사이트는 똑같아요. 한 프로젝트는 한 방식만 써요.

| | 1안 — GitHub 방식 | 2안 — Vercel 방식 |
|---|---|---|
| AI 선택지 | "GitHub + Vercel" | "Vercel only (Recommended)" |
| 필요한 것 | GitHub 계정, 내 저장소, 내 컴퓨터의 GitHub 로그인, 그 저장소와 연결한 Vercel | Vercel 계정과 Vercel 토큰만 |
| 좋은 점 | 올린 변경 기록이 GitHub 에 남아요 | 준비가 적어요. 토큰은 한 번만 붙여 넣으면 이 컴퓨터가 기억해요 |
| 아쉬운 점 | 수업에서 준비할 것이 많아요. 터미널에서 GitHub 로그인을 한 번 해요 | 먼저 Vercel 에서 토큰을 만들어야 해요 |
| Preview | 작업 브랜치에서 만들어요 | 바로 만들어요 |
| Production | Production Branch 에서 만들어요(옮기는 건 수업에서 함께) | 내가 고르면 만들어요 |

고르기 어려우면 **2안**을 추천해요. 수업 전에 Vercel 가입을 끝냈으니 바로 시작할 수 있어요.

**시작하기 전에**

- 페이지가 먼저 만들어지고 연결돼 있어야 해요(6-2).
- `my-assets/typo/` 의 글꼴도 함께 올라가요. 웹사이트에 올려도 된다고 허락된 글꼴만 남겨요(3-2).
- 2안: Vercel 토큰을 만들어요. Vercel 에서 **Account Settings → Tokens → Create** 를 열어요. **Expiration**(만료일)은 수업이 끝나는 날쯤으로 정해요. 토큰을 복사해서 비밀번호처럼 보관해요. 나중에 브라우저 창에 붙여 넣어요. 대화창에는 절대 넣지 않아요.

**2안 — Vercel 방식 (수업에서 쓰는 방식)**

1. AI 에게 **"내 사이트 올려 줘."** 라고 해요. (줄임 명령: `/my-deploy`)
2. 처음에는 AI 가 선택지로 물어요. 답을 눌러요.
   - 방식: **Vercel only (Recommended)**
   - 무엇을: **My website (Recommended)**. Storybook 을 올리려면 **My Storybook**.
   - 프로젝트 이름: AI 가 추천한 이름 중 하나를 고르거나, **Other** 에 직접 써요. 영어 소문자·숫자·`.`·`_`·`-` 만 써요. **새** 이름을 써요. GitHub 와 연결된 Vercel 프로젝트를 다시 쓰지 마요.

   다음부터는 AI 가 같은 답을 그대로 쓰고 다시 묻지 않아요.
3. 단계마다 허락 창이 떠요. 읽고 **Yes, allow once** 를 눌러요. 배포 명령은 AI 가 직접 실행해요. 나는 터미널에 아무것도 치지 않아요.
   - AI 가 먼저 내 컴퓨터에서 사이트를 검사해요. 이때는 아무것도 올리지 않아요. **성공하면 보이는 것:** `Local deploy check passed: web → dist/. Check the screen and behavior separately.` 문제가 있으면 AI 가 쉬운 말로 설명하고, 어느 단계로 돌아갈지 알려 줘요.
4. 처음 한 번만 브라우저 창이 저절로 열려요. 제목은 **"Paste your Vercel token"** 이에요. 거기에 토큰을 붙여 넣고 **Save** 를 눌러요.
   - `Saved. Go back to VS Code.` 가 나오면 성공이에요. VS Code 로 돌아가요. 대화창에 `Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. …` 가 나와요.
   - `This token does not work. Make a new one in Vercel and paste it again.` 가 나오면 토큰이 틀린 거예요. Vercel 에서 새 토큰을 만들어 다시 붙여 넣어요.
   - 창이 안 열리면 대화창에 `The browser did not open by itself. Open this address in your browser: http://127.0.0.1:…` 가 나와요. 그 주소를 복사해서 브라우저 주소창에 넣어요. 이 주소는 이 컴퓨터에서, 한 번만 열려요.
   - 8분 안에 붙여 넣어요. 늦으면 `No token was entered. Ask the AI to deploy again.` 가 나와요.
5. AI 가 **Preview** 주소(`Vercel Preview deploy Ready: https://…`)를 보여 줘요. 열어 봐요. 페이지마다 새로고침·글꼴·아이콘·클릭·입력을 확인해요.
6. AI 가 **Put it online for everyone (Production)** / **Not yet** 중에서 고르라고 물어요. Preview 가 괜찮을 때만 Production 을 골라요.
7. **성공하면 보이는 것:** `Vercel Production deploy Ready: https://…`. 이게 내 진짜 주소예요. 열어서 다시 확인해요.

다음에 사이트를 고친 뒤에도 **"내 사이트 올려 줘."** 라고만 하면 돼요. 이번에는 토큰을 묻지 않아요.

토큰 규칙

- ⚠️ **토큰은 AI 대화창에 절대 붙여 넣지 마요.** 키트가 여는 브라우저 창에만 붙여 넣어요.
- 실수로 대화창에 붙여 넣었다면: 지금 바로 Vercel(**Account Settings → Tokens**)에서 그 토큰을 지워요. 새 토큰을 만들어요. 새 토큰은 브라우저 창에만 붙여 넣어요.
- 토큰을 파일·캡처·GitHub 에 넣지 마요.
- 저장된 토큰이 안 되면(만료됐거나 Vercel 에서 지웠으면) `The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.` 가 나오고 브라우저 창이 다시 열려요. 새 토큰을 만들어 거기에 붙여 넣어요.
- 이 컴퓨터에서 토큰을 지우려면(예: 수업이 끝난 뒤) AI 에게 **"Vercel 토큰 지워 줘"** 라고 해요. `Your saved Vercel token was deleted from this computer.` (또는 `There is no saved Vercel token on this computer.`)가 나와요. 더 쓰지 않을 거면 Vercel → Account Settings → Tokens 에서도 지워요.

두 방식 공통 (2안·1안)

- 배포 한 번은 최대 9분쯤 걸릴 수 있어요. 기다려요. Vercel 이 느리면 `Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.` 가 나와요. Vercel 에서 내 프로젝트 → **Deployments** 를 열고 **Ready** 가 되는지 봐요.
- `Ask the student: …` 로 시작하는 줄이 보여도 괜찮아요. AI 가 선택지로 묻고 다시 실행해요.
- AI 에게 언제든 다시 검사해 달라고 해도 돼요("배포 준비 검사해 줘"). 검사만 하고 아무것도 올리지 않아요. 결과 첫 줄에 지금 설정이 나와요. 예: `Deployment method: Vercel REST API · target: web`
- 올린 것으로 끝이 아니에요. **Ready** 를 기다려요. 그다음 그 주소에서 페이지마다 새로고침·글꼴·아이콘·클릭·입력을 직접 확인해요.
- 오류가 나오면 [오류 대처 안내서 J](troubleshooting.ko.md)를 봐요.

**선택: 1안 — GitHub 방식**

2안 대신 1안을 고른 사람만 해요.

준비(수업에서 함께): GitHub 에 가입해요. 거기에 내 빈 저장소를 만들어요(강사 저장소가 아니에요). Git 에 내 이름과 이메일을 정해요. Vercel 이 내 GitHub 저장소를 쓸 수 있게 허락해요.

GitHub 에 한 번 로그인해요. **1안에서 내가 직접 치는 것은 이것뿐이에요.** VS Code 에서 **Terminal → New Terminal** 을 열고 아래 두 명령을 하나씩 실행해요.

```bash
gh auth login
gh auth setup-git
```

1. AI 에게 **"내 사이트 올려 줘."** 라고 해요. 처음에는 **GitHub + Vercel** 을 골라요. 그다음 무엇을 올릴지 골라요. **Other** 에 내 GitHub 저장소 주소를 써요(예: `https://github.com/<내아이디>/<내저장소>.git`).
2. 단계마다 **Yes, allow once** 를 눌러요. AI 가 처음 한 번 연결해요. 브라우저에 Vercel 로그인 화면이 열릴 수 있어요(미검증). **성공하면 보이는 것:** `Connected. Current branch: <브랜치>; production branch: <브랜치>. …`
3. Preview: Production Branch 가 아닌 작업 브랜치에서 해요. AI 가 commit 을 만들어 내 GitHub 저장소에 올리고 Vercel 을 기다려요. **성공하면 보이는 것:** `Vercel Preview deploy Ready: https://…`
4. Production: 먼저 Preview 를 확인해요. 그다음 바뀐 내용을 Production Branch 로 옮겨요(수업에서 함께 해요). 그 브랜치에서 **Put it online for everyone (Production)** 을 골라요. **성공하면 보이는 것:** `Vercel Production deploy Ready: https://…`

- `GitHub needs you to sign in once. …` 가 나오면 위의 로그인을 해요. 그다음 AI 에게 다시 올려 달라고 해요([오류 대처 안내서 J](troubleshooting.ko.md)).
- 키트는 브랜치를 바꾸지 않고, GitHub 를 강제로 덮어쓰지(force push) 않아요. Preview 는 Production Branch 에서 멈춰요. Production 은 다른 브랜치에서 멈춰요.

---

## 7. 크레딧 아끼는 법

AI 에게 요청을 한 번 보낼 때마다 **보이지 않는 기본 내용(규칙·도구 설명 등, 약 2만 토큰)과 지금까지의 대화 전체**가 함께 보내져요. 그래서 대화가 길수록, 요청이 많을수록 크레딧이 빨리 줄어요.

1. **가벼운 모델부터.** 간단한 질문·설명·작은 수정은 가벼운 모델(예: `qwen3.8-flash`, `qwen3.6-flash`)로 해요. `/model` 로 바꿔요. 어떤 작업에 어떤 모델을 쓸지는 사용량을 측정한 뒤 정해 줘요. (수업에서 알려 줘요)
2. **Thinking 은 필요할 때만.** 생각에 쓴 토큰도 크레딧이 나가요(2-5). 권장값은 (수업에서 알려 줘요).
3. **승인 모드는 Ask Approval (default) 로.** Classifier Approval (auto) 모드는 판단용 AI 를 한 번 더 불러 크레딧을 더 써요(2-5).
4. **대화가 길어지면 새 대화.** 컴포넌트 하나가 끝나면 새 대화를 열어요. 계획서(MD 파일)에 내용이 남아 있으니 새 대화에서 이어서 할 수 있어요.
5. **같은 요청을 반복하지 않기.** 답이 느려도 같은 요청을 여러 번 보내지 마요. 보낼 때마다 크레딧이 나가요.
6. **한 번에 하나.** 대화 창(세션)을 여러 개 동시에 돌리지 마요. VS Code 확장도 꼭 필요한 것만 둬요(Figma 확장 설치 금지, 2-2).
7. **글자는 기본값 그대로.** 글자(글꼴·크기)를 바꾸지 않으면 할 일도, 드는 크레딧도 없어요(5-2).
8. **사용량 확인.** Model Studio 콘솔 **Token Plan → My Subscriptions** 에서 봐요: <https://modelstudio.console.alibabacloud.com/ap-southeast-1/subscription/token-plan>
   - **My Subscriptions → Plan Quota → Monthly Usage** 에 이번 달 사용량이 **한 달 크레딧(45,000) 중 몇 %** 로 나와요. **1% ≈ 450 크레딧, 0.01% ≈ 4.5 크레딧**이에요. 소수 둘째 자리까지만 나와서 아주 작은 차이는 보이지 않아요.
   - 작업 전후로 % 를 적어 두면 그 작업에 얼마나 들었는지 알 수 있어요. 예: 0.20% → 0.57% 면 0.37%p ≈ 167 크레딧.
   - 내 컴퓨터에서는 AI 에게 **"내 사용량 표 보여 줘"** 라고 해요. AI 가 사용량 명령(`pnpm ai:usage`)을 실행하고(허락 창 → `Yes, allow once`) 날짜·대화·모델별 요청 수와 토큰 수를 표로 보여 줘요. 날짜를 붙여도 돼요: "2026-11-01 부터 내 사용량 표 보여 줘."
   - 이 표의 토큰 수와 콘솔 크레딧은 달라요(토큰당 크레딧은 공개되지 않았어요). 같은 요청이 두 번 세어지던 문제는 고쳐져서, 측정 때 콘솔 토큰과 비슷하게 나왔어요. 중복이 의심되는 기록은 더하지 않고 경고로 알려 줘요([오류 대처 안내서 F](troubleshooting.ko.md)). **남은 크레딧은 콘솔이 정확해요.**
9. **얼마나 드는지 감 잡기.** 2026-10-19 에 학생과 같은 순서로 한 번 재 본 값이에요(모델 `qwen3.7-plus`, 표본 1개라 참고용).

   | 한 일 | 든 크레딧 | 한 달 크레딧 중 |
   |---|---|---|
   | Figma 색 가져오기·토큰 만들기 같은 **AI 가 실행하는 키트 명령** | 명령 자체는 AI 를 쓰지 않지만, AI 가 실행하고 결과를 설명하는 대화 한 번만큼 들어요 | 아직 측정 전 |
   | **색 역할 계획** 만들기 → 질문·답 → 오류 1번 고침 → 승인·적용 | 약 27 | 약 0.06% |
   | **복잡한 부품 1개**(Pagination) 계획 → 질문·답 → 승인 → 만들기 → 검사 통과 | 약 167 | 약 0.4% |
   | 페이지 만들기 | 아직 측정 전 | — |

   - 부품 하나에 약 0.4% 라서, 수정을 몇 번 더 해도 한 달 크레딧 안에서 디자인 시스템과 페이지를 끝낼 여유가 있어요. 그래도 같은 부탁을 여러 번 되풀이하면 금방 늘어나요.
   - 일주일에 한 번 콘솔 % 를 보고, 예상보다 빨리 늘면 강사에게 알려요.

---

## 8. 자주 막히는 곳 (FAQ)

> 여기 없는 오류 문구는 [오류 대처 안내서](troubleshooting.ko.md)에서 찾아봐요. 설치·Storybook·AI·Figma·검사·검수·페이지·배포에서 실제로 나오는 문구를 어디서 났는지별로 모아 두었어요.

### AI 답이 너무 오래 걸리거나 오류(`429`, 504 등)가 나요

사람이 많은 시간에는 줄을 서느라 느려질 수 있어요. 1분쯤 기다렸다가 다시 보내요. **같은 요청을 연달아 여러 번 보내지 마요** — 보낼 때마다 크레딧이 나가요. 그래도 멈춰 있으면 Qwen Code 패널에서 **새 대화**를 열어 다시 시작해요.

- `429 insufficient_quota` 가 나오면 이번 달 크레딧을 다 쓴 거예요. 콘솔에서 확인하고 채널에 알려 줘요.

### AI 가 Figma 디자인을 읽지 못해요

순서가 중요해요.

1. Figma 데스크톱 앱에서 링크한 노드가 있는 파일을 열어요.
2. `Shift + D` 로 Dev Mode 로 바꾸고 **Enable desktop MCP server** 를 켜요.
3. AI 에게 **"Figma 연결 확인해 줘"** 라고 해서 `figma-desktop connected` 가 나오는지 확인해요(허락 창 → `Yes, allow once`).
4. Qwen Code 대화창에서 `/mcp` 를 입력해요. `figma-desktop` 이 **"Needs approval"** 이면 승인해요.
5. 그다음 **새 대화**를 열고 링크와 함께 부탁해요.

Figma 를 켜기 전에 연 대화라면 새 대화를 열어요. 작업하는 동안 Figma 파일은 계속 열어 둬요.

### AI 가 `/mcp` 를 입력하라고 해요

AI 가 `Type /mcp in the chat, approve figma-desktop, then start a new chat.` 라고 하면, 이 폴더에서 아직 Figma 연결을 허락하지 않은 거예요. 대화창에 `/mcp` 를 입력하고 `figma-desktop` 을 골라 승인한 뒤 **새 대화**를 열어 같은 부탁을 다시 보내요. AI 는 그동안 샘플 색으로 진행하지 않아요.

### Figma 호출 한도가 걱정돼요

Figma 는 AI 가 디자인을 읽는 횟수에 한도가 있어요. Starter 플랜이나 View·Collab 좌석은 **한 달에 20번**, Education 플랜과 Professional Full·Dev 좌석은 **하루 200번**까지예요. 그래서 **Education 플랜(학생 인증)** 을 권장해요(0장). 같은 링크를 몇 분 안에 다시 보내면 AI 가 이미 읽은 내용을 다시 쓰고 Figma 를 또 부르지 않아요. 같은 부탁을 연달아 보내지 마요.

### AI 가 "The kit's checks are off." 라고 해요

키트 검사(hook)가 꺼져 있어서 AI 가 멈춘 거예요. 설치 명령을 다시 실행하고, VS Code 에서 **Developer: Reload Window** 를 실행한 뒤 **새 대화**를 열어요([오류 대처 안내서 C](troubleshooting.ko.md#키트-검사가-꺼졌어요)).

### AI 가 "Please show this screen to the instructor." 라고 해요

키트 명령이 오류로 멈췄거나, 같은 곳에서 두 번 막혔거나, 같은 검사가 3번 실패했다는(`The same check failed 3 times: …`) 뜻이에요. AI 는 더 돌아가지 않고 멈춰요. 강사가 본 뒤 새 메시지를 보내면 AI 가 다시 할 수 있어요. **화면을 캡처해 강사에게 보여 줘요.** 직접 명령을 치거나 파일을 고치지 마요.

### AI 가 명령을 치라거나, 파일을 고치라거나, 보호를 끄라고 해요

따르지 마요. 키트 명령은 AI 가 직접 실행하고 나는 허락 창만 눌러요. `.ds` 폴더나 토큰 파일, 키트 파일은 내가 고치는 곳이 아니에요. 화면을 캡처해 강사에게 보여 줘요.

### `401` 오류가 나요 (InvalidApiKey, invalid access token)

- Token Plan 키가 맞는지 확인해요. Model Studio 일반 키(다른 페이지에서 만든 키)는 안 돼요.
- 주소가 싱가포르(`token-plan.ap-southeast-1...`)인지 확인해요.
- 키를 다시 붙여 넣을 때 앞뒤 공백이 들어가지 않게 해요.

### `404 model_not_found` 또는 `403 AccessDenied.Unpurchased` 가 나요

모델 이름이 틀렸거나 Token Plan 개인판에서 쓸 수 없는 모델이에요. `/model` 에서 목록에 있는 모델로 바꿔요.

### 콘솔에서 사용량이 계속 0 이에요

아직 사용하지 않았거나, Token Plan 키가 아닌 다른 키로 연결된 거예요. 다른 키로 쓰면 **구독과 별도로 요금이 청구**될 수 있어요. 바로 2-3 단계를 다시 확인해요.

### 설치 후 새 터미널에서 프로그램을 못 찾아요 (`command not found`, "인식되지 않습니다")

설치 프로그램은 설치됐지만 새 터미널이 그 위치를 모르는 경우예요.

1. 먼저 같은 설치 명령(3장 4단계)을 다시 실행해요.
2. 새 터미널에서 버전을 확인해요. 모두 숫자가 나오면 아래 3번은 건너뛰어요.
   - Mac: `node --version`, `pnpm --version`
   - Windows: `node --version`, `pnpm.cmd --version`
3. pnpm 을 못 찾을 때만 npm 전역 경로를 등록해요.
   - Mac (한 번만 실행):

     ```bash
     cat >> ~/.zshrc <<'EOF'

     # DS-Starter: Homebrew와 npm 실행 경로
     if [ -x /opt/homebrew/bin/brew ]; then
       eval "$(/opt/homebrew/bin/brew shellenv)"
     elif [ -x /usr/local/bin/brew ]; then
       eval "$(/usr/local/bin/brew shellenv)"
     fi

     if command -v npm >/dev/null 2>&1; then
       if ds_npm_prefix="$(npm prefix -g 2>/dev/null)" && [ -n "$ds_npm_prefix" ]; then
         export PATH="$ds_npm_prefix/bin:$PATH"
       fi
       unset ds_npm_prefix
     fi
     EOF

     source ~/.zshrc
     ```

   - Windows (PowerShell):

     ```powershell
     $dsMachinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
     $dsUserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
     $env:Path = "$dsMachinePath;$dsUserPath;$env:Path"

     $dsNpmPrefix = npm.cmd prefix -g
     if ($LASTEXITCODE -ne 0 -or -not $dsNpmPrefix) {
         throw 'npm 경로를 확인하지 못했습니다. Node.js/npm 설치 상태를 확인하세요.'
     }
     $dsNpmPrefix = $dsNpmPrefix.Trim()

     if (($dsUserPath -split ';') -notcontains $dsNpmPrefix) {
         [Environment]::SetEnvironmentVariable(
             'Path', "$dsNpmPrefix;$dsUserPath", 'User'
         )
     }

     $env:Path = "$dsNpmPrefix;$env:Path"
     ```

4. 그래도 안 되면 VS Code 를 완전히 껐다 켠 뒤 2번을 다시 해 봐요. 그래도 안 되면 오류 화면 전체를 캡처해 채널에 물어봐요.

### 설치 스크립트가 "Node.js 22 이상"이 필요하다고 해요

Node.js 를 설치한 직후에는 새 터미널이 필요할 때가 있어요. 새 터미널에서 같은 설치 명령을 다시 실행해요.

### 설치 스크립트가 "The code command is missing"이라고 해요

오류가 아니에요. VS Code 확장 화면에서 `Qwen Code Companion`(게시자 qwenlm)을 직접 설치해요(2-2). 나머지 설치는 계속 진행돼요. Mac 이라면 2장 "Mac 과 Windows 차이"의 `Shell Command: Install 'code' command in PATH` 를 실행한 뒤 새 터미널에서 설치 명령을 다시 실행해도 돼요.

### Windows: "이 시스템에서 스크립트를 실행할 수 없습니다"

명령어 이름 뒤에 `.cmd` 를 붙여요. 예: `pnpm` → `pnpm.cmd`

### Figma 학생 인증이 아직 안 끝났어요

승인까지 며칠 걸릴 수 있어요. 다른 설치를 먼저 하고, 승인되면 4번(Figma MCP)을 해요.

### Dev Mode 는 되는데 Enable desktop MCP server 가 안 보여요

① 브라우저가 아니라 Figma 데스크톱 앱인지 ② 앱이 최신 버전인지 확인해요. 그래도 없으면 계정 종류 때문일 수 있어요. 화면을 캡처해서 채널에 물어봐요.

---

## 출처

- Token Plan 개요(국제판): <https://www.alibabacloud.com/help/en/model-studio/token-plan-overview>
- Token Plan 개인판 빠른 시작(국제판): <https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-quick-start>
- Token Plan 개인판 FAQ(국제판): <https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-faq>
- Token Plan 개인판 개요(중국판 영문): <https://help.aliyun.com/en/model-studio/token-plan-personal-overview>
- Token Plan 개인판 FAQ(중국판 영문): <https://help.aliyun.com/en/model-studio/token-plan-personal-faq>
- Qwen Code 설정(알리바바): <https://www.alibabacloud.com/help/en/model-studio/qwen-code>
- Qwen Code VS Code 확장: <https://qwenlm.github.io/qwen-code-docs/en/users/integration-vscode/>, <https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion>
- Qwen Code 설정 파일: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/>
- Qwen Code 인증: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/>
- Qwen Code MCP: <https://qwenlm.github.io/qwen-code-docs/en/users/features/mcp/>
- Qwen Code 신뢰 폴더: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/trusted-folders/>
