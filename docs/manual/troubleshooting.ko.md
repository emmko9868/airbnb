# 오류 대처 안내서 — 화면에 이런 문구가 나오면

> "보이는 문구"는 스타터킷 코드에 실제로 들어 있는 문장이에요(`< >` 부분은 상황에 따라 바뀌어요). 프로그램 문구는 대부분 영어로 나와요(`ds:review` 명령의 일부 문구만 한국어이고, 많은 문구는 ` / ` 뒤에 영어가 함께 나와요). Qwen Code 패널의 오류는 알리바바 공식 FAQ 에 나온 문구예요.

## 먼저 읽어 주세요

### 오류가 어디서 났는지부터 봐요

| 어디서 | 이런 곳 |
|---|---|
| A. 설치 스크립트 | 처음 설치할 때 실행한 `setup-local` 명령의 터미널 |
| B. Storybook | 브라우저의 `localhost:6006` 화면이나 그 터미널 |
| C. Qwen Code 패널 | VS Code 오른쪽(또는 옆)의 AI 대화창 |
| D. Figma 연결·색과 글자 | Figma 연결 확인(AI 가 `pnpm mcp:setup` 실행), `/mcp` 화면, Figma 색 가져오기(AI 가 `pnpm ds:figma` 실행), 색·글자 계획 적용(`ds:apply-token-plan`), 토큰 만들기(`ds:tokens`) |
| E. AI 의 "Blocked:" 메시지 | AI 대화창 안에 "Blocked:" 로 시작하는 문장 |
| F. 검사 명령 | `ai:check` · `ai:verify` · `ds:guard` 를 실행한 터미널 |
| G. 검수 명령 | `ds:review` 를 실행한 터미널 |
| H. 카탈로그 "페이지 사용 차단" | 부품 목록(카탈로그)이나 페이지 검사 결과 |
| I. 페이지 만들기·빌드 | `ds:page` · `ai:check-page` · `web:build` · `web:figma` · `web:compare` |
| J. 배포 | "내 사이트 올려 줘"(AI 가 `node scripts/deploy.mjs` 실행), 또는 브라우저의 "Paste your Vercel token" 페이지 |
| K. 내 기획서 | "기획서 정리해 줘"(AI 가 `pnpm specs` 실행) |
| L. 아이콘·그림·글꼴 | "my-assets 에 넣은 파일 정리해 줘"(AI 가 `pnpm assets` 실행) |

### 그래도 안 되면 이렇게 보내 주세요

1. 컴퓨터 종류: Mac / Windows
2. 실행한 명령(또는 AI 에게 보낸 부탁) 그대로
3. 오류 화면 **전체** 캡처 (일부만 자르지 말기)
4. **API 키나 Vercel 토큰이 화면에 보이면 꼭 가리기**

### 강사용 — 학생 문의를 받으면 먼저 확인할 4가지

1. **폴더:** VS Code 에서 연 폴더가 `DS-Starter` 이고, 왼쪽에 `package.json` 이 바로 보이나요? (아니면 대부분의 명령이 실패해요) 그 폴더가 **OneDrive 같은 동기화 폴더 밖**(예: Windows `C:\DS-Starter`, Mac `~/DS-Starter`)에 있나요?
2. **pnpm 버전:** 새 터미널에서 `pnpm --version`(Windows `pnpm.cmd --version`)이 **`10.27.0`** 인가요? 다르면 아래 A 의 `ERR_PNPM_BAD_PM_VERSION` 항목을 봐요.
3. **어디서 난 오류인지:** 위 표의 A~L 중 어디인가요? 터미널인지, AI 대화창인지, 브라우저인지부터 나눠요.
4. **AI 연결과 크레딧:** AI 관련이면 Qwen Code 에서 "안녕?"에 답이 오는지, 콘솔(Token Plan → My Subscriptions)에 크레딧이 남아 있는지 봐요.

> Windows 에서는 아래 명령의 `pnpm` 을 `pnpm.cmd` 로 바꿔 입력해요.

---

## A. 설치 스크립트

**보이는 문구:** `The code command is missing. …`
- **뜻:** 터미널에서 VS Code 를 부르는 `code` 명령을 못 찾아, Qwen Code 확장을 자동으로 설치하지 못했어요. 오류는 아니고 나머지 설치는 계속돼요.
- **해 볼 것:** VS Code 확장 화면에서 `Qwen Code Companion`(게시자 qwenlm)을 직접 설치해요. Mac 은 `⌘ + Shift + P` → `Shell Command: Install 'code' command in PATH` 를 실행한 뒤 새 터미널에서 설치 명령을 다시 실행해도 돼요.

**보이는 문구:** `No working Node.js 22 or later was found. …` (Mac) / `Node.js 22 or later is required. Run this script again in a new terminal.` · `Node.js was just installed. Run this script again in a new terminal.` (Windows)
- **뜻:** 필요한 Node.js(프로그램을 돌리는 바탕 프로그램)가 아직 준비되지 않았어요. 방금 설치했는데 이 터미널이 모르는 경우가 많아요.
- **해 볼 것:** 터미널 오른쪽 위 **+** 로 새 터미널을 열고 같은 설치 명령을 다시 실행해요. 그래도 나오면 VS Code 를 완전히 껐다 켠 뒤 다시 해요.

**보이는 문구:** `npm prefix -g failed. …` (Windows 는 `npm.cmd prefix -g failed. …`)
- **뜻:** npm(Node.js 와 함께 오는 설치 도구)이 제대로 준비되지 않았거나, 터미널이 위치를 몰라요.
- **해 볼 것:** 새 터미널에서 다시 실행해요. 그래도 안 되면 [학생 매뉴얼 8장](student-manual.ko.md#8-자주-막히는-곳-faq)의 "설치 후 새 터미널에서 프로그램을 못 찾아요"를 따라 해요.

### pnpm 버전

이 프로젝트는 pnpm **10.27.0** 을 써요(`package.json` 의 `packageManager`). 설치 스크립트가 버전을 확인하고, 다르면 이 버전을 설치해요.

**보이는 문구 (안내):** `Installing pnpm 10.27.0 (current: <예전 버전, 또는 none or failed to run>)` → `pnpm 10.27.0 OK (matches package.json)`
- **뜻:** 필요한 pnpm 버전을 설치했고 맞는지 확인했어요. 잘된 거예요.

**보이는 문구:** `ERR_PNPM_BAD_PM_VERSION` … `configured to use v10.27.0` … `current pnpm is v9.0.0` (끝의 버전 숫자는 컴퓨터마다 달라요)
- **뜻:** 컴퓨터에 예전 pnpm(예: 9.0.0)이 먼저 있어서, 이 프로젝트가 정한 10.27.0 과 달라 멈췄어요. 예전 스타터킷이나 다른 수업에서 깔아 둔 pnpm 이 남아 있으면 생겨요.
- **해 볼 것:**
  1. 새 터미널에서 실행해요 — Windows `npm.cmd install -g pnpm@10.27.0`, Mac `npm install -g pnpm@10.27.0`
  2. **새 터미널**을 열고 `pnpm --version`(Windows `pnpm.cmd --version`)이 `10.27.0` 인지 확인해요.
  3. 맞으면 설치 스크립트를 다시 실행해요.
  4. 그래도 예전 버전이 나오면 Windows 는 `where.exe pnpm`, Mac 은 `type -a pnpm` 결과를 캡처해 강사에게 보내요. **다른 pnpm 을 직접 지우지는 마요.**

**보이는 문구:** `pnpm install failed. Run npm.cmd install -g pnpm@10.27.0, then run this script again.` (Mac 은 `npm install -g pnpm@10.27.0`)
- **해 볼 것:** 안내된 명령을 새 터미널에서 직접 실행한 뒤 설치 스크립트를 다시 실행해요. 권한 오류(EACCES)가 나면 `sudo` 를 붙이지 말고 캡처해 강사에게 보내요.

**보이는 문구:** `pnpm version mismatch: need 10.27.0 / current <버전>` + `pnpm in use: …` + 경로 목록 + `Make sure the npm global folder … comes before the paths above in PATH, then run this script again in a new terminal. Do not delete the other pnpm installs.`
- **뜻:** 10.27.0 을 설치했지만, 컴퓨터가 다른 곳에 있는 예전 pnpm 을 먼저 찾아 써요(경로 충돌). 설치는 멈췄어요.
- **해 볼 것:** 화면 전체(특히 경로 목록)를 캡처해 강사에게 보내요. 다른 pnpm 은 지우지 마요.

**보이는 문구:** `Could not read packageManager in package.json. Unzip the project again and run this script again.`
- **뜻:** 프로젝트 파일이 깨졌거나 다른 폴더에서 실행했어요.
- **해 볼 것:** ZIP 을 다시 받아 동기화 폴더 밖에 풀고, 그 폴더에서 실행해요.

### OneDrive·동기화 폴더

**보이는 문구 (경고, 설치는 계속):** `Warning: OneDrive sync can slow the install down or lock files. Move the project to a folder outside OneDrive (for example C:\DS-Starter) if you can. The install continues.` (Mac 은 예시가 `~/DS-Starter`)
- **뜻:** 프로젝트가 OneDrive 안에 있어요. 동기화 때문에 설치가 느리거나 파일이 잠겨 실패할 수 있어요.
- **해 볼 것:** 끝까지 됐다면 그대로 써도 되지만, 문제가 생기면 Storybook 을 끄고(`Ctrl + C`) 폴더를 `C:\DS-Starter`(Mac `~/DS-Starter`)로 옮긴 뒤 VS Code 로 다시 열고 설치 스크립트를 다시 실행해요.

**보이는 문구 (Windows):** `WinGet was not found. Install App Installer from the Microsoft Store, then run this script again.`
- **뜻:** Windows 에서 프로그램을 설치하는 도구가 없어요.
- **해 볼 것:** Microsoft Store 에서 "App Installer" 를 설치한 뒤 다시 실행해요.

**보이는 문구 (Windows):** `<프로그램> install failed. Check whether you need administrator rights or a restart, then run the same script again.`
- **뜻:** 설치 중 권한이 부족했거나 재부팅이 필요해요.
- **해 볼 것:** "이 앱이 디바이스를 변경하도록 허용…" 창이 뜨면 "예"를 눌러요. 재부팅하라고 하면 재부팅하고 다시 실행해요.

**보이는 문구:** `Project package install failed.` / `Chromium (used for checks) failed to install. Check your network, then run the same script again.`
- **뜻:** 인터넷에서 필요한 파일을 받지 못했어요.
- **해 볼 것:** 인터넷 연결을 확인하고 같은 명령을 다시 실행해요. 이미 받은 것은 다시 쓰고 이어서 해요.

**보이는 문구:** `This script is for macOS. On Windows, run setup-local.ps1 instead.`
- **뜻:** Windows 에서 Mac 용 명령을 실행했어요.
- **해 볼 것:** `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1` 을 실행해요.

### 터미널용 Qwen Code(CLI) 설치

수업 기본은 VS Code 확장이라, 아래 문제가 있어도 **나머지 설치와 수업은 그대로 진행돼요.** 터미널에서 쓰는 방법은 [학생 매뉴얼 3-1](student-manual.ko.md#3-1-확장-대신-터미널에서-qwen-code-쓰기-선택)을 봐요.

**보이는 문구 (안내):** `Qwen Code CLI is already installed. Skipping it and keeping your version.`
- **뜻:** 이미 설치돼 있어서 다시 설치하지 않았어요. 오류가 아니에요.

**보이는 문구:** `Qwen Code CLI install failed. The rest of the install continues.` + `Manual install: npm install -g @qwen-code/qwen-code@0.25.1` (Windows 는 `npm.cmd install -g …`)
- **뜻:** 터미널용 Qwen Code 를 내려받지 못했어요(인터넷·권한 문제일 수 있어요).
- **해 볼 것:** 설치가 끝난 뒤 새 터미널에서 안내된 수동 설치 명령을 그대로 실행해요. 권한 오류(EACCES)가 나와도 `sudo` 를 붙이지 말고 화면을 캡처해 강사에게 보내요.

**보이는 문구:** `Qwen Code CLI did not run. Check your PATH in a new terminal. The rest of the install continues.` + `Manual install: npm install -g @qwen-code/qwen-code@0.25.1`
- **뜻:** 설치는 됐을 수 있지만 이 터미널이 `qwen` 명령의 위치를 몰라요.
- **해 볼 것:** 새 터미널을 열고 `qwen --version` 을 실행해요(Windows 에서 막히면 `qwen.cmd --version`). 그래도 못 찾으면 [학생 매뉴얼 8장](student-manual.ko.md#8-자주-막히는-곳-faq)의 "설치 후 새 터미널에서 프로그램을 못 찾아요"를 따라 하고, 수동 설치 명령을 실행해요.

**보이는 문구 (안내):** `Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops.`
- **뜻:** 설치 끝에 항상 나오는 주의 안내예요. `qwen -p` 나 스크립트·반복 실행으로 AI 를 자동으로 부르지 마요. 사람이 직접 대화할 때만 써요.

---

## B. Storybook

**보이는 것:** 브라우저에 Storybook 이 안 열려요.
- **해 볼 것:** 주소창에 `http://localhost:6006` 을 입력해요. 켜져 있지 않으면 AI 에게 "Storybook 열어 줘"라고 해요. AI 가 뒤에서 켜고 주소를 알려 줘요(미검증). 그래도 안 되면 예비책으로 `DS-Starter` 폴더에서 새 터미널을 열고 `pnpm storybook` 을 실행해요.

**보이는 문구:** `Project packages are not installed yet. For the first install, run bash setup-local.sh in this folder.` (Windows 는 `setup-local.ps1` 안내)
- **뜻:** 설치 스크립트를 아직 끝까지 실행하지 않았어요.
- **해 볼 것:** 안내된 설치 명령을 먼저 실행해요.

**보이는 것:** 명령을 찾을 수 없다는 pnpm 오류(예: `mcp:setup`·`storybook` 이 없다는 내용)
- **뜻:** 터미널이 `DS-Starter` 폴더가 아닌 곳에서 열렸어요.
- **해 볼 것:** VS Code 에서 **파일 → 폴더 열기**로 `DS-Starter` 를 열고 새 터미널에서 다시 해요.

---

## C. Qwen Code 패널 (AI 대화창)

**보이는 문구:** `401` … `InvalidApiKey` / `invalid access token`
- **뜻:** API 키나 연결 주소가 맞지 않아요.
- **해 볼 것:** 대화창에 `/auth` 를 입력하고 **Token Plan** 을 골랐는지(Coding Plan·Standard API Key 아님), 지역이 **Singapore (International)** 인지, 키를 앞뒤 공백 없이 전부 붙여 넣었는지 확인해요.

**보이는 문구:** `429` … `insufficient_quota`
- **뜻:** 이번 달 크레딧을 다 썼어요. 다음 달이 시작될 때까지 AI 가 멈춰요.
- **해 볼 것:** Model Studio 콘솔의 **Token Plan → My Subscriptions** 에서 남은 크레딧을 확인하고 강사에게 알려요.

### 키트 검사가 꺼졌어요

**보이는 것:** AI 가 `The kit's checks are off. Run the install command again (it turns them on), reload VS Code, then start a new chat.` 라고 하고 멈춰요. 또는 Qwen 대화창에 `/hooks` 를 입력했더니 키트 검사 옆에 `disabled (not approved)` 가 보여요.
- **뜻:** 키트 검사(hook)가 꺼져 있어요. 꺼진 채로 AI 가 일하면 규칙을 건너뛸 수 있어서, AI 가 먼저 멈춘 거예요.
- **해 볼 것:**
  1. VS Code 의 새 터미널에서 설치 명령을 다시 실행해요(Mac `bash setup-local.sh`, Windows `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1`). `The kit's checks are turned on for this folder (Qwen hooks approved).` 가 나오면 됐어요.
  2. 명령 팔레트에서 **Developer: Reload Window** 를 실행해요.
  3. Qwen 에서 **새 대화**를 열어요. Qwen 이 "This project wants to run hooks" 라고 물으면 **Approve hooks** 를 눌러요.
  4. `/hooks` 를 다시 입력해 `approved` 인지 확인해요.
- 설치가 `You chose Keep disabled for the kit's checks. …` 라고 하면, 예전에 **Keep disabled** 를 골랐던 거예요. Qwen 에서 **Approve hooks** 를 고르거나 강사에게 알려요.
- 설치가 `Could not turn on the kit's checks automatically. …` 라고 하면 화면을 캡처해 강사에게 보내요.
- (강사용) 원인: Qwen Code 0.27.x 확장은 VS Code 에서 **신뢰한 폴더**에는 훅 승인 카드를 띄우지 않고, 승인 기록(`~/.qwen/hookApprovals.json`)이 없으면 훅을 켜지 않아요. 그래서 설치 스크립트가 같은 지문으로 승인을 등록해요(`scripts/qwen-hooks-approve.mjs`). AI 는 이 스크립트를 실행하지 못하게 막혀 있어요.

### 그 밖의 AI 오류

**보이는 문구:** `504` / `overloaded` 같은 문구, 또는 답이 아주 오래 안 와요
- **뜻:** 서버가 붐벼요. 내 잘못이 아니에요.
- **해 볼 것:** 1분쯤 기다렸다가 다시 보내요. **같은 부탁을 연달아 여러 번 보내지 마요** — 보낼 때마다 크레딧을 써요. 계속 멈춰 있으면 새 대화를 열어요.

**보이는 문구:** `404 model_not_found` / `403`
- **뜻:** 모델 이름이 틀렸거나 내 키로 쓸 수 없는 모델이에요.
- **해 볼 것:** `/model` 에서 목록에 있는 다른 모델로 바꿔요. 그래도 안 되면 강사에게 알려요.

**보이는 문구:** `Request timed out waiting for hook-execution-response`
- **뜻:** 예전 스타터킷일 수 있어요. 최신 스타터킷은 Figma 읽기·검사가 길어지면 이 오류 대신 "Still reading the Figma design"·"Some checks did not run" 안내를 보여 줘요([E](#figma-읽기검사-시간-안내-오류-아님)).
- **해 볼 것:** 언제 받은 ZIP 인지 확인해요. 사전 준비 페이지에 적힌 버전 날짜보다 먼저 받았다면 최신 ZIP(<https://github.com/DearKim/DS-Starter-Kit/releases/latest/download/DS-Starter.zip>)을 다시 받아 새 폴더에 풀고 설치해요. 최신인데도 보이면 화면을 캡처해 강사에게 보내요.

**보이는 것:** 한국어로 물었는데 **중국어 등 다른 언어로 답해요.**
- **뜻:** 고장이 아니에요. Qwen Code 의 **답변 언어**가 다른 언어로 정해져 있어요. 답변 언어는 화면 언어(메뉴 글자)와 따로 정해지고, 화면 언어를 바꾸면 함께 바뀔 수 있어요. 화면 언어 목록에는 한국어가 없어요.
- **해 볼 것:**
  1. 대화 입력칸에 `/language output auto`(입력한 언어로 답함) 또는 `/language output Korean`(항상 한국어)을 입력해요.
  2. **새 대화**를 열고 다시 물어봐요.
  3. 화면 언어를 바꾼 뒤라면 1~2번을 다시 해요.
  4. 확장 대화창에서 명령이 먹지 않으면 `DS-Starter` 폴더의 새 터미널에서 `qwen` 을 직접 실행해 같은 명령을 입력하고, 터미널의 Qwen 을 닫은 뒤 확장 패널을 다시 열어요([학생 매뉴얼 2-7](student-manual.ko.md#2-7-qwen-이-중국어-등-다른-언어로-답할-때)).
  - 명령 뒤에 나오는 확인 문구는 미검증이에요.

**보이는 것:** 말로 부탁했는데(예: "기획서 정리해 줘") AI 가 **다른 일을 하거나 단계를 건너뛰어요.** 상태 확인을 먼저 하지 않거나, 기억나는 내용으로 파일을 써요.
- **뜻:** 메시지가 키트의 일처럼 들리면 키트가 AI 에게 따라야 할 단계를 알려 주지만, 마지막 판단은 AI 가 해요. 파일이 열려 있으면 VS Code 가 그 파일을 메시지 앞에 붙이기도 해요(예: `@my-docs/specs/tasks.md`).
- **해 볼 것:** **새 대화**를 열고 더 분명하게 다시 말해요. 그래야 AI 가 예전 기억 대신 파일을 다시 읽어요. 그래도 다른 일을 하면 그 일의 지름길 명령을 써요([학생 매뉴얼 3-2](student-manual.ko.md#3-2-내-폴더-3개와-ai-에게-하는-말)). 파일이 열려 있으면 대화 입력칸 옆의 파일 이름을 눌러 흐리게(**Excluded**) 만들거나 파일을 닫아요.

**보이는 문구:** `Shell command failed: POST /session/:id/shell: Direct session shell is disabled for this daemon`
- **뜻:** 대화창에 `!` 로 시작하는 메시지(예: `!pnpm ds:page …`)를 보냈어요. VS Code 의 Qwen Code 확장은 대화창의 `!` 명령을 실행하지 않고, 설정으로 켤 수도 없어요. 아무것도 실행되지 않았어요.
- **해 볼 것:** `!` 를 쓰지 말고 AI 에게 말로 부탁해요(예: "페이지 계획 승인해. 페이지 만들어 줘."). AI 가 명령을 실행하고, 나는 허락 창에서 `Yes, allow once` 를 눌러요. 아무것도 실행되지 않았으니 그대로 다시 부탁하면 돼요.

**보이는 것:** AI 가 질문을 하는데 **선택지가 안 떠요** — 질문이 글로만 나와요.
- **뜻:** AI 는 선택지(고를 수 있는 답 목록)로 물어야 하지만, 가끔 그러지 않거나 선택지 도구가 안 될 때가 있어요. 고장이 아니에요. (미검증: Qwen 확장에서 선택지가 보이는 실제 모양)
- **해 볼 것:** AI 에게 **"선택지로 물어봐 줘"** 라고 해요. 그래도 안 뜨면 대화창에 질문 번호로 답해요. 예: `1. Leave it out for now 2. Our Menu`. 선택지 없이 계획을 승인하려면 **"revision 1 승인. 이 계획대로 진행해 주세요."** 라고 써요. 계획서 파일을 열 필요는 없어요.

---

## D. Figma 연결

**보이는 문구:** `Figma MCP settings are ready, but the server did not answer. Storybook still starts.` + `In Figma Desktop, open a design file and turn on Shift+D → Enable desktop MCP server.`
- **뜻:** 설정은 됐지만 Figma 앱 쪽 연결이 꺼져 있어요.
- **해 볼 것:** ① Figma **데스크톱 앱**에서 디자인 파일을 열어요 ② `Shift + D` 로 Dev Mode ③ **Enable desktop MCP server** 를 켜요 ④ AI 에게 "Figma 연결 확인해 줘"라고 해요(AI 가 `pnpm mcp:setup` 실행, 허락 창 → `Yes, allow once`)
- **성공하면 보이는 것:** `Figma MCP connection: figma-desktop connected`

**보이는 문구:** `Type /mcp in the chat, approve figma-desktop, then start a new chat.` (AI 가 하는 말)
- **뜻:** 이 폴더에서 아직 Figma 연결을 허락하지 않았어요. 그래서 AI 가 Figma 를 읽지 않고 멈췄어요. 샘플 색으로 진행하지 않아요.
- **해 볼 것:** 대화창에 `/mcp` 를 입력하고 `figma-desktop` 을 승인한 뒤 새 대화를 열어 같은 부탁을 다시 보내요.

**보이는 문구:** `You have used up your Figma MCP limit. …`
- **뜻:** Figma 가 AI 의 디자인 읽기 횟수 한도에 걸렸어요. Starter 플랜이나 View·Collab 좌석은 한 달 20번, Education 플랜과 Professional Full·Dev 좌석은 하루 200번이에요.
- **해 볼 것:** 한도가 풀릴 때까지 기다리거나 강사에게 알려요. Education 플랜(학생 인증)을 권장해요.

**보이는 것:** Qwen Code 의 `/mcp` 에서 `figma-desktop` 이 **"Needs approval"**
- **뜻:** 처음 한 번은 사람이 연결을 허락해야 해요.
- **해 볼 것:** 목록에서 figma-desktop 을 골라 승인해요. 그다음 새 대화를 열어요.

**보이는 문구:** `<파일> is not valid JSON. Fix it and try again. Your existing settings were not changed.`
- **뜻:** 설정 파일(`.qwen/settings.json` 또는 `.mcp.json`)의 글자가 깨졌어요.
- **해 볼 것:** 직접 고치지 말고 오류 화면을 캡처해 강사에게 보내요.

### Figma 색 가져오기 (AI 가 `pnpm ds:figma` 실행)

처음 Figma 링크를 보내거나, 새 색이 들어간 부품 링크를 보내거나, "내 Figma 색 가져와 줘"라고 하면 AI 가 이 명령을 **직접** 실행해요. 나는 허락 창만 눌러요([학생 매뉴얼 5-0](student-manual.ko.md#5-0-내-figma-색-가져오기--ai-가-먼저-해요)).

**보이는 문구 (안내, 오류 아님):** `First import: your Figma colors replace the sample colors.`
- **뜻:** 처음 가져왔어요. 샘플 색이 내 Figma 색으로 바뀌었어요.

**보이는 문구 (안내, 오류 아님):** `Merged with the variables imported before …` 다음 줄에 `Added: <이름들>` · `Changed: <이름> <옛 값> → <새 값>` · `Kept: <숫자>`
- **뜻:** 예전에 가져온 색에 **합쳤어요.** `Added` 는 새로 들어온 색, `Changed` 는 Figma 에서 값이 바뀐 색(역할은 그대로), `Kept` 는 이번 링크에는 없었지만 지우지 않고 둔 색의 수예요. `none` 이면 없다는 뜻이에요.

**보이는 문구 (안내, 오류 아님):** `<노드>: <숫자> variables — from the cached read, 0 Figma calls`
- **뜻:** 방금(10분 안에) 읽은 디자인을 다시 써서 **Figma 호출 한도를 쓰지 않았어요.**

**보이는 문구:** `BLOCKED_INPUT: Variable name or value conflicts: …`
- **뜻:** 한 번에 읽은 Figma 안에 이름은 같은데 값이 다른 색이 있어요. 저장된 색은 바뀌지 않았어요.
- **해 볼 것:** Figma 에서 겹치는 변수 이름을 하나로 정리한 뒤 AI 에게 다시 가져와 달라고 해요. 모르겠으면 화면을 캡처해 강사에게 보여 줘요.

**보이는 문구 (안내, 오류 아님):** `Text: the starter defaults stay. If you do not change them, you need no text plan and no extra steps.` 와 그 아래 `Only if you want to change them: … once you approve, run the same command without --prepare.` · `The original text styles are kept under typography in .ds/figma-variables.json. …`
- **뜻:** **색은 가져왔고, 글자는 스타터 기본값을 그대로 써요.** Figma 의 글자 설정(글꼴·크기·줄 간격)은 자동으로 바꾸지 않아요. 고장이 아니고, 할 일도 없어요.
- **해 볼 것:** 그대로 두고 `Next: the AI runs pnpm ds:tokens …` 안내를 따라 색 작업을 계속해요. 내 Figma 글자로 바꾸고 싶을 때만 [학생 매뉴얼 5-2](student-manual.ko.md#5-2-글자글꼴크기줄-간격-바꾸기--선택)를 따라 해요.

**보이는 문구 (안내):** `Text: you already have an approved text choice. ds:tokens checks the source and default token hashes again.`
- **뜻:** 예전에 승인해 바꾼 글자가 있어서, 다음 `pnpm ds:tokens` 에서 Figma 원본이 그대로인지 다시 확인한다는 뜻이에요. 원본이 바뀌었으면 아래 "글자 계획" 문구로 멈춰요.

**보이는 문구 (안내, 오류 아님):** `Shadow converted: <이름> → <값>` (`pnpm ds:figma`·`pnpm ds:tokens` 에서)
- **뜻:** Figma 의 그림자(Effect)를 웹에서 쓰는 그림자 값으로 바꿔 넣었어요. 잘된 거예요.

**보이는 문구 (안내):** `Shadow needs review: <이름> — <이유> It was left out of the tokens. The original value is kept in raw.` (`ds:tokens` 에서는 끝이 `Check the original value.`)
- **뜻:** 그림자 하나를 자동으로 바꿀 수 없어서 **그 그림자만 빼고** 나머지는 그대로 진행했어요. 이유는 `<종류>: This Effect cannot be read. Check the original value.`(읽을 수 없는 Effect 라는 뜻) 또는 `Check the Effect's offset, blur and spread numbers. Blur cannot be negative.`(위치·흐림·퍼짐 숫자를 확인하라는 뜻. 흐림은 음수가 될 수 없어요) 로 나와요. 색 작업은 막히지 않아요.
- **해 볼 것:** 그 그림자를 꼭 써야 하면 Figma 에서 그림자 설정(흐림 값이 음수가 아닌지, 그림자 종류가 일반 그림자인지)을 확인하고 강사에게 알려요. 그 그림자를 쓰지 않을 거면 그대로 둬요.

**보이는 문구:** `Failed: CSS generation blocked: <변수> — the token value is not one safe CSS value. …` (`pnpm ds:tokens` 에서)
- **뜻:** 어떤 토큰 값이 웹 화면 파일(CSS)에 넣기에 안전하지 않아서, 토큰을 만들지 않고 멈췄어요.
- **해 볼 것:** 직접 고치지 말고 화면 전체를 캡처해 강사에게 보내요.

### 색·글자 계획 공통 — 머리말과 `source_url`

색 역할 계획(`docs/plans/tokens.md`)과 글자 계획(`docs/plans/typography.md`)은 맨 위 머리말(`---` 사이) 형식이 정해져 있어요. `pnpm ds:apply-token-plan` 의 오류는 모두 `Token plan rejected: ` 로 시작해요.

**보이는 문구:** `Token plan rejected: Unknown plan metadata key "<항목>". Allowed keys for a <종류> plan: …`
- **뜻:** 머리말에 이 계획에서 쓰지 않는 항목을 넣었어요. 예: 부품 계획에서 쓰는 `source_kind`·`source_ref` 를 색 계획에 넣은 경우.
- **해 볼 것:** AI 에게 그 줄을 지우고 메시지에 나온 허용 항목만 남긴 뒤 준비(`--prepare`)부터 다시 해 달라고 해요.

**보이는 문구:** `Token plan rejected: Line <숫자> of the plan metadata has the wrong format: "<그 줄>". Write it as "key: value".` / `Token plan rejected: Plan metadata key "<항목>" appears more than once. Write each key only once.`
- **해 볼 것:** AI 에게 메시지가 가리키는 줄을 `key: value`(항목: 값) 모양으로 고치거나 같은 항목을 하나만 남겨 달라고 해요.

**보이는 문구:** `Token plan rejected: The token plan has no metadata block (the --- lines at the top). Start from the template.` / `Token plan rejected: Check kind, revision and open_questions in the plan metadata. Every key must be there.`
- **뜻:** 머리말이 없거나, `kind`·`revision`·`open_questions` 값이 빠졌거나 숫자가 아니에요.
- **해 볼 것:** AI 에게 템플릿(`docs/templates/token-plan.md` 또는 `typography-plan.md`) 형식으로 고쳐 달라고 해요.

**보이는 문구:** `Token plan rejected: source_url is not a valid Figma node link, or it has no node-id. Put the link of the imported Figma node in source_url (example: …).`
- **뜻:** `source_url` 에 Figma **파일** 링크만 있거나 링크 형식이 틀렸어요. **가져올 때 쓴 노드 링크**(`node-id=` 가 있는 주소)가 필요해요.
- **해 볼 것:** AI 에게 메시지 끝의 `(example: …)` 에 나온 주소를 `source_url` 에 넣어 달라고 해요. 그 주소는 내가 실제로 가져온 파일·노드로 만들어진 거예요.

**보이는 문구:** `Token plan rejected: The Figma file in source_url is not the imported Figma file "<파일 키>". …` / `Token plan rejected: The Figma node in source_url is not one of the imported nodes (<번호들>). …`
- **뜻:** 계획에 적은 Figma 링크가 `pnpm ds:figma` 로 가져온 파일·노드와 달라요.
- **해 볼 것:** AI 에게 메시지 끝의 예시 주소로 바꿔 달라고 해요. 다른 파일을 쓰려면 그 파일 링크를 보내 먼저 가져와 달라고 해요.

### 색 역할 계획 (`pnpm ds:apply-token-plan` · `docs/plans/tokens.md`)

색 계획의 표(역할 · 학생 primitive · 가져온 Figma 노드 번호 · 원시 값 · 근거)에 문제가 있으면 **어느 역할의 어느 칸인지** 알려 줘요.

**보이는 문구:** `Token plan rejected: <역할>: there is no primitive "<이름>" in your Figma. Write one of the imported color primitive names: …`
- **뜻:** 표에 적은 색 이름이 내가 가져온 색 목록에 없어요.
- **해 볼 것:** 메시지를 AI 에게 보여 줘요. AI 가 메시지의 목록으로 선택지를 보여 주면 맞는 이름을 골라요.

**보이는 문구:** `Token plan rejected: <역할>: the raw value "<값>" is not the value of primitive "<이름>", which is "<실제 값>". Copy the source value exactly.`
- **해 볼 것:** AI 에게 원시 값을 메시지의 실제 값으로 고쳐 달라고 해요.

**보이는 문구:** `Token plan rejected: <역할>: Figma node "<값>" is not one of the imported nodes (<번호들>). Write one of the nodes in figma-variables.json. Variable ids are not allowed.` (또는 `… has the wrong format. Write an imported Figma node number (example: 0:1). …`)
- **뜻:** 노드 칸에 `figma-white` 같은 변수 이름이 들어갔거나, 가져오지 않은 노드 번호를 적었어요.
- **해 볼 것:** AI 에게 메시지에 나온 노드 번호(예: `0:1`) 중 하나를 쓰라고 해요.

**보이는 문구:** `Token plan rejected: <역할>: the reason is empty. Write the source evidence that links the role to the primitive, or why the AI suggested it.`
- **해 볼 것:** AI 에게 근거를 채워 달라고 해요. 요약을 보고 그 역할이 왜 그 색인지 내가 이해할 수 있어야 해요.

**보이는 문구:** `Token plan rejected: Duplicate, already declared, or invalid role: <역할>` / `Token plan rejected: Check the plan for undecided items (TODO, REPLACE, TBD) and check the mapping table.`
- **뜻:** 같은 역할을 두 번 적었거나, Figma 에 이미 있는 역할을 다시 적었거나, 표에 `미확정`·`미답변`·`TODO`·`REPLACE`·`TBD` 같은 빈칸이 남았어요.
- **해 볼 것:** AI 에게 표를 정리하고 준비(`--prepare`)부터 다시 해 달라고 해요.

> AI 가 Figma 에 이름이 선언되지 않은 색 역할을 제안했다면, 색 계획의 첫 초안에는 질문이 하나 이상 있어야 정상이에요(`open_questions: 1` 이상). AI 가 질문 없이 `open_questions: 0` 으로 적었으면 그대로 믿지 말고 AI 요약의 역할·근거를 하나씩 확인해요([학생 매뉴얼 2-6](student-manual.ko.md#2-6-수정명령-허락-창)).

### 글자 계획 (`pnpm ds:apply-token-plan docs/plans/typography.md` · `pnpm ds:tokens`)

`ds:apply-token-plan` 의 오류는 `Token plan rejected: ` 로, `ds:tokens` 의 오류는 `Failed: ` 로 시작해요. 글자 계획 문제는 그 뒤에 `Text style plan: …` 이 붙어요. 머리말·`source_url` 오류는 위 "공통" 과 같아요.

**보이는 문구:** `Failed: Text style plan: The source or base tokens behind the saved text style choices changed. Approve the text style plan again.`
- **뜻:** 글자를 바꾼 뒤 Figma 를 다시 가져와서, 예전 승인과 원본이 달라졌어요. 고장이 아니에요.
- **해 볼 것:** AI 에게 "글자 계획 다시 승인할게"라고 해요. AI 가 새 revision 을 만들고 준비(`--prepare`) → 내가 **"Approve revision N"** 고르기 → AI 가 적용, 순서로 다시 해요. 기본 글자로 되돌리고 싶으면 아래 "글자 되돌리기" 의 `pnpm ds:reset-typography` 를 직접 실행해요.

**보이는 문구:** `Token plan rejected: Text style plan: The student must check that the font is installed, and know that the browser shows a fallback font if it is not.`
- **해 볼 것:** 그 글꼴이 Storybook → Foundation → Typography 에서 **Loaded** 로 보이는지(파일은 `my-assets/typo/`), 아니면 컴퓨터 기본 글꼴인지 확인해요. 그다음 AI 에게 "글꼴이 Loaded 로 보여"라고 말하거나(선택지로 물으면 **예** 를 골라요) 다시 실행해 달라고 해요.

**보이는 문구:** `Token plan rejected: Text style plan: Only a plan in review (status: review-required) can be prepared. It is never approved automatically.`
- **뜻:** 이미 승인한 계획이라 그대로는 다시 준비할 수 없어요.
- **해 볼 것:** 바꾸고 싶으면 AI 에게 무엇을 바꿀지 말해요. AI 가 새 revision 을 만들고 다시 준비해요.

**보이는 문구:** `Token plan rejected: Only a plan the student approved, with 0 open questions, can be applied.` / `Token plan rejected: The plan content hash does not match. Review it as a new revision.`
- **뜻:** 아직 "Approve revision N" 을 고르지 않았거나 남은 질문이 있어요. 또는 준비한 뒤에 계획 내용이 바뀌었어요.
- **해 볼 것:** 질문에 모두 답하고, AI 에게 다시 준비해 달라고 한 뒤, 요약을 읽고 **"Approve revision N"** 을 골라 AI 에게 적용해 달라고 해요.

**보이는 문구:** `Token plan rejected: Text style plan: The text style source or base token hash does not match. Review it as a new revision.`
- **뜻:** 준비한 뒤 Figma 원본이나 색 토큰이 바뀌었어요.
- **해 볼 것:** AI 에게 새 revision 을 만들어 준비부터 다시 해 달라고 해요. 그다음 선택지로 다시 승인해요.

**보이는 문구:** `Token plan rejected: Text style plan: Answer the plan's questions and check the source values first.` / `… List at least one existing token to change. If you change nothing, you don't need a plan.` / `… Unknown, new, or duplicate token, or the wrong field for it: <토큰>` / `… Check the real font name. A reference name or custom CSS is not a font.` / `… A line height with an unknown unit needs the unit the student checked (percent, px or multiplier) and a reason.`
- **뜻:** 계획서의 표가 덜 채워졌거나, 바꿀 수 없는 글자 이름을 적었거나, 글꼴 이름·줄높이 단위가 확인되지 않았어요.
- **해 볼 것:** 메시지를 AI 에게 보여 주고 고쳐 달라고 해요(질문은 선택지로 답해요). 바꿀 수 있는 것은 이미 있는 글자 토큰 값뿐이에요. 글자를 안 바꿀 거면 계획서가 필요 없어요.

**보이는 문구:** `Token plan rejected: Text style plan: Import your Figma first.`
- **해 볼 것:** Figma 를 먼저 가져와요. Figma 링크와 함께 AI 에게 "내 Figma 색 가져와 줘"라고 해요(AI 가 `pnpm ds:figma` 실행).

### 글자 되돌리기 (`pnpm ds:reset-typography`)

내가 바꾼 글자를 스타터 기본값으로 되돌리는 명령이에요([학생 매뉴얼 5-2](student-manual.ko.md#5-2-글자글꼴크기줄-간격-바꾸기--선택)). **내가 직접 터미널에서** 실행하고, 확인 문구 `reset text styles` 를 입력해야 해요. 오류는 `Text style reset stopped: ` 로 시작해요.

**보이는 문구:** `Text style reset stopped: The student must run this themselves in an interactive terminal. Text style reset is refused from an AI shell, a pipe or a redirect.`
- **뜻:** AI 가 대신 실행했거나, 내가 직접 입력할 수 없는 방식으로 실행됐어요.
- **해 볼 것:** VS Code 의 **터미널**을 직접 열고 내가 명령을 입력해요. AI 에게 시키지 마요.

**보이는 문구:** `Text style reset stopped: Usage: pnpm ds:reset-typography (no auto-approve options)`
- **뜻:** 명령 뒤에 다른 글자를 붙였어요. 이 명령은 뒤에 아무것도 붙이지 않아요.
- **해 볼 것:** `pnpm ds:reset-typography` 만 입력해요.

**보이는 문구 (안내):** `Text style reset canceled. Nothing was changed.`
- **뜻:** 확인 질문에 `reset text styles` 가 아닌 다른 것을 입력했어요(띄어쓰기까지 같아야 해요). 아무것도 바뀌지 않았어요.
- **해 볼 것:** 정말 되돌리려면 다시 실행하고 `reset text styles` 를 그대로 입력해요.

**보이는 문구 (안내):** `Text styles already use the defaults. Nothing was changed.`
- **뜻:** 바꾼 글자가 없어서 할 일이 없어요. 오류가 아니에요.

**보이는 문구:** `Text style reset stopped: The Figma source is missing, so we cannot check that your colors are kept. Restore the source and run this again.`
- **뜻:** 가져온 Figma 원본 파일이 없어, 색을 그대로 두는지 확인할 수 없어 멈췄어요.
- **해 볼 것:** AI 에게 링크와 함께 "내 Figma 색 다시 가져와 줘"라고 해서(AI 가 `pnpm ds:figma` 실행) 다시 가져온 뒤, 되돌리기는 내가 직접 다시 실행해요. 잘 모르겠으면 강사에게 알려요.

**보이는 문구:** `Text style reset stopped: Another text style reset is running, or an old lock file was left behind. Existing files are kept.` / `Text style reset stopped: Inputs, choices or generated files changed while you were confirming. Review again.`
- **뜻:** 다른 작업(AI 작업 포함)이 같은 파일을 쓰는 중이었어요. 아무것도 바꾸지 않았어요.
- **해 볼 것:** 다른 터미널이나 AI 작업을 멈추고 다시 실행해요. 잠금 메시지가 계속 나오면 화면을 캡처해 강사에게 보내요.

**보이는 문구:** `Text style reset stopped: Token regeneration failed: …` / `Text style reset stopped: Token inputs changed during regeneration.`
- **뜻:** 기본값으로 다시 만드는 중에 문제가 생겨서 **원래 상태로 되돌려 놓았어요.**
- **해 볼 것:** 화면 전체를 캡처해 강사에게 보내요.

**보이는 문구:** `Text style reset stopped: Text style reset needs tokenValue/tokenName=figma ownership.` / 복원 경로(reset path)에 관한 다른 문구(예: `… Reset paths must be inside the project.`)
- **뜻:** 프로젝트 설정이 이 명령이 기대하는 모양과 달라요.
- **해 볼 것:** 직접 고치지 말고 캡처해 강사에게 보내요.

**보이는 문구:** `Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server. …`
- **해 볼 것:** 위의 Figma 연결 순서(데스크톱 앱 → 파일 열기 → Dev Mode → MCP 켜기)를 한 뒤 AI 에게 다시 해 달라고 해요.

**보이는 문구:** `The link has no node-id. Use a link to a node, or add --all-pages.`
- **뜻:** Figma 링크가 파일 전체 링크예요. 특정 부분(노드)을 가리키는 링크가 필요해요.
- **해 볼 것:** Figma 에서 해당 프레임을 고르고 **링크 복사**로 받은 주소(`node-id=` 가 들어 있는 주소)를 써요.

**보이는 문구:** `You have used up your Figma MCP limit. …`
- **뜻:** Figma 가 정한 하루(또는 한 달) 사용 횟수를 넘었어요.
- **해 볼 것:** 한도가 풀릴 때까지 기다렸다가 AI 에게 다시 부탁해요. 같은 부탁을 반복하지 마요.

**보이는 문구:** `BLOCKED_INPUT: Variable name or value conflicts: …`
- **뜻:** Figma 안에 이름은 같은데 값이 다른 색 변수가 있어요.
- **해 볼 것:** 화면을 캡처해 강사에게 보내요. Figma 에서 변수 이름을 정리해야 할 수 있어요.

---

## E. AI 대화창의 "Blocked:" 메시지

이 메시지들은 **고장이 아니라 안전장치**예요. AI 가 하면 안 되는 일을 하려 할 때 막아요.

> 안전장치 메시지에는 AI 가 **직접 실행할 키트 명령**이 함께 나와요(예: 색은 `pnpm ds:figma`, 색 역할은 승인 뒤 `pnpm ds:apply-token-plan`). 그 명령은 AI 가 실행하고 나는 허락 창만 눌러요. AI 가 나에게 명령을 치라거나, 파일을 고치라거나, 보호를 끄라고 하면 따르지 말고 강사에게 알려요.

**보이는 문구:** `Blocked: do not edit <파일>. This is a kit file. If a kit command fails with an error you cannot fix by following its message, stop and tell the student to show the error to the instructor.`
- **뜻:** AI 가 키트 자체(검사 프로그램·AI 지시문·설정)를 고치려다 막혔어요. 키트는 고치지 않아요.
- **해 볼 것:** AI 가 오류 화면을 보여 주며 멈추면 화면을 캡처해 강사에게 보여 줘요.

**보이는 문구:** `Blocked: docs/plans/… — a new plan cannot start as approved. …` / `… approving a plan may change only the status: line. …` / `… this plan is already approved. To change it, set status: review-required and raise revision by 1 …`
- **뜻:** AI 가 내 승인 없이 계획을 "승인됨"으로 만들려고 했어요. 승인은 내가 선택지로 해요.
- **해 볼 것:** AI 의 요약을 읽고 맞으면 **"Approve revision N"** 을 골라요. 이미 승인한 계획을 바꾸면 AI 가 새 버전(revision)으로 다시 요약하고 승인을 물어요.

**보이는 문구:** `Blocked: <파일> cannot be changed without an approved plan.` + `There is no MD plan. Write the plan first and get the user's confirmation.`
- **뜻:** 부품을 고치기 전에 계획서를 쓰고 내 허락을 받아야 해요.
- **해 볼 것:** AI 의 질문에 답하고(선택지를 고르거나 Other 에 직접 써요), 대화창의 짧은 요약을 읽고, 맞으면 **"Approve revision N"** 을 골라요. 계획서 파일은 열지 않아요.

**보이는 문구:** `Blocked: <파일> cannot be changed without an approved page plan.`
- **뜻:** 페이지도 페이지 계획을 먼저 승인해야 해요.
- **해 볼 것:** 위와 같이 질문에 답하고 선택지로 승인해요.

**보이는 문구:** `Blocked: do not edit <파일>. Token CSS is generated by pnpm ds:tokens.` (또는 Storybook 문서·`.ds/`·`.claude/rules` 에 대한 같은 문장)
- **뜻:** 프로그램이 자동으로 만드는 파일이라 직접 고치면 안 돼요.
- **해 볼 것:** AI 에게 "생성물은 고치지 말고 원래 절차대로 해 줘"라고 말해요. 계속 같은 곳을 고치려 하면 멈추라고 하고 강사에게 알려요.

**보이는 문구:** `The work is not finished. Ask the open Q&A questions with ask_user_question choices, summarize the plan in the chat (never ask the user to open the plan file), ask for approval with a choice, and stop. …`
- **뜻:** 계획에 아직 답하지 않은 질문이 있거나, 아직 승인하지 않았어요.
- **해 볼 것:** AI 의 질문에 답해요(선택지를 고르거나 Other 에 직접 써요). 그다음 요약을 읽고 **"Approve revision N"** 을 골라요.

**보이는 문구:** `The same check failed 3 times: <kind>. Stop now. Do not change the plan or the code again for this. Tell the student in one line what is done and say: "Please show this screen to the instructor."` (`<kind>` 자리에는 `nested-part`, `shared-style`, `px-literal`, `icon-path`, `play-text` 같은 검사 이름이 들어가요) — 또는 `The plan revision was already raised 2 times since the student's last message: plan-revision. Stop now. …`
- **뜻:** 같은 검사가 3번 연달아 실패했어요(또는 AI 가 계획을 자꾸 고쳤어요). 그래서 키트가 일부러 AI 를 멈췄어요. 새 메시지를 보내기 전까지 AI 는 그 부품과 그 계획을 고칠 수 없어요. 고장이 아니에요. AI 가 같은 자리를 빙빙 돌며 크레딧을 쓰지 않게 막은 거예요.
- **해 볼 것:** 화면을 캡처해 **강사에게 보여 줘요.** 검사를 통과시키려고 새 계획(revision)을 승인하지 마요. 강사가 본 뒤 새 메시지(예: "다시 해 봐")를 보내면 AI 가 다시 할 수 있어요.

**보이는 문구:** `Some problems from the automatic checks are still not fixed. Ask the AI in your own words to run the checks again (it runs pnpm ds:guard), and look at the screen.`
- **뜻:** AI 가 몇 번 고쳐도 검사 문제가 남았어요.
- **해 볼 것:** 같은 부탁을 되풀이하지 말고, AI 에게 "디자인 규칙 검사 다시 해서 결과 보여 줘"라고 해요. 결과를 캡처해 강사에게 보내요.

**보이는 문구:** `Please start a new chat (+) for this part. This chat already worked on <Part>, so every step here would cost much more.`
- **해 볼 것:** `+`를 눌러 새 대화를 열고, 새 부품 요청을 그대로 다시 보내요. 키트는 그 Figma 디자인을 이미 읽어 뒀어요.

### Figma 읽기·검사 시간 안내 (오류 아님)

Qwen Code 는 Figma 읽기와 자동 검사를 1분 안에 끝내야 해요. 시간이 모자라면 AI 가 아래처럼 안내하고 멈춰요. **오류가 아니에요.** 디자인을 추측해 만들지 않도록 일부러 멈추는 거예요.

**보이는 문구:** `Still reading the Figma design. Send the same request again in 1–2 minutes.`
- **뜻:** Figma 를 뒤에서 계속 읽고 있어요.
- **해 볼 것:** 1~2분 기다렸다가 **똑같은 요청(같은 링크)** 을 다시 보내요. 다른 요청이나 새 링크로 바꾸지 마요. 다시 보내면 읽어 둔 결과를 쓰고 Figma 를 다시 읽지 않아요.

**보이는 문구:** `Figma did not answer. Make sure the Figma desktop app is open with this file, then send the same message again.`
- **뜻:** Figma 가 디자인을 보내 주지 않아서 AI 가 멈췄어요. 디자인 없이 계획을 쓰거나 아이콘을 그리지 않아요.
- **해 볼 것:** ① Figma **데스크톱 앱**에서 이 파일을 열어요(Dev Mode → **Enable desktop MCP server** 켜짐) ② **똑같은 메시지(같은 링크)** 를 다시 보내요 — 그러면 Figma 를 다시 읽어요. 그래도 같으면 AI 에게 "Figma 연결 확인해 줘"라고 해서 `figma-desktop connected` 가 나오는지 봐요([D. Figma 연결](#d-figma-연결)).

**보이는 문구:** `This link is a big frame or a whole page. Please send the link to the one part you want to build.`
- **뜻:** 보낸 링크가 화면 전체나 큰 프레임을 가리켜요. 부품을 만들려던 거라면 부품 하나의 링크가 필요해요.
- **해 볼 것:** **웹사이트**를 만들려던 거라면 링크와 함께 말로 부탁해요. 예: "이 Figma 화면으로 내 웹사이트 만들어 줘 Home: <링크>" — AI 가 알아서 Figma 연결을 확인하고 화면 사진을 저장해요([I](#i-페이지-만들기빌드-dspage--aicheck-page--webbuild)). **부품**이라면 Figma 에서 만들 부품(컴포넌트 세트) 하나를 선택하고 **링크 복사**로 받은 주소를 보내요.

**보이는 문구 (AI 에게 가는 안내):** `Some checks did not run in time — run pnpm ai:check <이름> … again yourself with the shell tool now. Only if that also does not finish in time, tell the user which checks are left and ask them to run that command in a VS Code terminal. Do not report that every check passed.`
- **뜻:** 시간 안에 검사를 다 하지 못했어요. 아직 "검사 통과"가 아니에요.
- **해 볼 것:** 먼저 AI 가 같은 검사를 직접 다시 실행해요(허락 창 → `Yes, allow once`). 그래도 끝나지 않을 때만 AI 가 남은 검사를 알려 줘요 — 그때 AI 가 알려 준 명령(예: `pnpm ai:check Button`, 페이지면 `pnpm ai:check-page <이름>`)을 VS Code 터미널에서 직접 실행해 결과를 봐요([F](#f-검사사용량-명령-aicheck--aiverify--dsguard--aiusage)). AI 셸이 명령을 얼마나 오래 돌릴 수 있는지는 미검증이에요.

> AI 가 계획서에 스스로 "승인"이라고 적거나, 허락 없이 파일을 바꾸면 **멈추라고 말하고** 채널에 알려 주세요.

---

## F. 검사·사용량 명령 (`ai:check` · `ai:verify` · `ds:guard` · `ai:usage`)

이 명령들은 AI 가 직접 실행하고(허락 창 → `Yes, allow once`) 결과를 보여 줘요. 돌려 보고 싶으면 말로 부탁해요. 예: "Button 다시 검사해 줘", "내 사용량 표 보여 줘".

**`pnpm ai:check <부품>`**
- **통과하면:** 아무 문제도 출력하지 않고 끝나요.
- **보이는 문구:** `[Auto check] Found problems in <부품> after saving <파일>. Fix the items below and save again.` 와 아래에 `- ` 로 시작하는 문제 목록
- **뜻:** 부품 코드에 규칙과 맞지 않는 곳이 있어요(예: 정해진 색 대신 직접 쓴 색, 타입 오류).
- **해 볼 것:** 이 목록을 AI 에게 그대로 보여 주고 "이 문제만 고쳐 줘"라고 부탁해요.

**`pnpm ai:verify <부품>`**
- **통과하면:** `Storybook render/play passed: Components/<부품> …`
- **보이는 문구:** `Usage: pnpm ai:verify <ComponentName>` → 부품 이름이 빠졌어요. AI 에게 이름과 함께 부탁해요. 예: "Button 렌더 검사해 줘"
- **보이는 문구:** `There are no Components/<부품> stories. …` / `<스토리>: Storybook render/play failed: …` / `… background does not change on hover …`
- **뜻:** 브라우저에서 실제로 열어 보니 화면이 안 그려지거나, 눌렀을 때 반응이 없었어요.
- **해 볼 것:** 메시지를 AI 에게 보여 주고 고쳐 달라고 해요. `Storybook failed to start` / `Storybook took too long to start` 가 나오면 다른 Storybook 이 켜져 있는지 확인하고 다시 실행해요.

**`pnpm ds:guard`**
- **보이는 문구:** `Errors <숫자> · Warnings <숫자>`
- **뜻:** 디자인 규칙 검사 결과예요. **오류(Errors)가 0 이어야** 해요. 경고(Warnings)는 확인할 거리예요.
- **해 볼 것:** 오류가 있으면 화면 전체를 캡처해 AI 에게 보여 주거나 강사에게 보내요.

**`pnpm ai:usage`** (내 컴퓨터의 사용량 표)
- **보이는 문구 (안내, 오류 아님):** `<모델>: did not add <숫자> session summaries (<숫자> requests) whose session ID is different from the request log, because they may be duplicates. Each model is counted once per request ID. Missing requests are not restored.`
- **뜻:** 같은 사용량이 두 번 세어지지 않도록 겹칠 수 있는 기록을 빼고 셌다는 안내예요. 할 일은 없어요. 남은 크레딧은 콘솔을 기준으로 봐요.

---

## G. 검수 명령 (`ds:review`)

스타터 부품을 고쳤거나 AI 와 부품을 만든 뒤 그 부품을 페이지에 쓰고 싶을 때, `pnpm ds:review <이름>` 을 내가 직접 실행해요([학생 매뉴얼 6-1](student-manual.ko.md#6-1-지켜야-할-것)). 오류는 모두 `학생 검수 중단 / Student review stopped: ` 로 시작해요. 강사는 강사 검수 안내서(학생 키트에는 없어요)를 봐요.

**보이는 문구:** `학생 검수 중단 / Student review stopped: 사람이 직접 연결한 대화형 TTY에서만 검수 기록을 만들 수 있습니다. AI 셸·파이프·리다이렉션에서는 거부합니다. 사람이 터미널에서 직접 실행하세요.`
- **뜻:** AI 가 대신 실행했거나, 사람이 직접 입력할 수 없는 방식으로 실행됐어요.
- **해 볼 것:** VS Code 의 **터미널**을 직접 열고 내가 명령을 입력해요. AI 에게 시키지 마요.

**보이는 문구:** `학생 검수 중단 / Student review stopped: 사용법 / Usage: pnpm ds:review <Name> | pnpm ds:review --list (run it yourself; decision flags and piped input are not supported)`
- **뜻:** 부품 이름을 빠뜨렸거나 형식이 틀렸어요.
- **해 볼 것:** 대문자로 시작하는 부품 이름 하나만 붙여요. 예: `pnpm ds:review Button`

**보이는 문구:** `학생 검수 중단 / Student review stopped: 카탈로그에 없는 부품: <이름>`
- **해 볼 것:** 철자(대소문자 포함)를 확인해요. `pnpm ds:review --list` 로 이름 목록을 볼 수 있어요.

**보이는 문구:** `입력을 취소했습니다. 검수 기록은 변경하지 않았습니다.` / `취소했습니다. 검수 기록을 변경하지 않았습니다. / Cancelled. No review record was changed.`
- **뜻:** 빈 답을 보냈거나, 마지막 `선택한 범위와 답변을 저장할까요?` 에 `아니요` 로 답했어요. 아무것도 바뀌지 않았어요.
- **해 볼 것:** 다시 실행하면 돼요.

**보이는 문구:** `입력 오류 / Invalid choice: …` (예: `목록에 있는 번호만 선택하세요.`, `1 또는 2를 선택하세요.`, `예 또는 아니요를 선택하세요.`)
- **뜻:** 답이 형식에 맞지 않아요. 같은 질문을 다시 물어요.

**보이는 문구 (안내):** `확인하지 못한 항목이 있어 반려로 기록합니다. / At least one check failed. This review will be rejected.`
- **뜻:** 질문 중 하나에 `아니요` 로 답해서 반려로 기록돼요. 부품에 기술적인 문제가 있을 때도 같은 결과가 돼요. 오류가 아니에요.
- **해 볼 것:** 이어지는 `메모:` 에 무엇이 문제였는지 적어요. 잘못 답했다면 마지막 저장 질문에 `아니요` 로 답해 취소하고 다시 실행해요.

**보이는 문구:** `학생 검수 중단 / Student review stopped: 번호로 선택할 수 있는 검수 예시가 없습니다. 담당자에게 Storybook 예시 연결을 요청하세요. / …`
- **뜻:** 이 부품은 번호로 고를 수 있는 Storybook 예시가 아직 준비되지 않았어요.
- **해 볼 것:** 담당자에게 알려요. 이 부품은 지금 기록할 수 없어요.

**보이는 문구:** `학생 검수 중단 / Student review stopped: 부품 계획서가 여러 개입니다. 담당자에게 현재 계획서를 정리해 달라고 요청하세요. / …` · `비교할 부품 계획서나 스타터 명세가 없습니다. 담당자에게 준비를 요청하세요. / …`
- **뜻:** 무엇과 비교해 검수할지(비교 기준)가 정리되지 않았어요.
- **해 볼 것:** 담당자에게 알려요.

**보이는 문구:** `입력 중 코드·CSS·의존·토큰이 바뀌었습니다. 검수 기록을 저장하지 않았습니다.` / `입력 중 기존 검수 기록이 바뀌었습니다. 덮어쓰지 않았습니다. 다시 검수하세요.` / `입력 중 비교 기준이나 예시가 바뀌었습니다. 다시 검수하세요. / …`
- **뜻:** 답하는 동안 부품이나 기록이 바뀌었어요(AI 가 작업 중이었을 수 있어요).
- **해 볼 것:** AI 작업을 멈춘 뒤 화면을 다시 보고 처음부터 검수해요.

**보이는 문구:** `검수 기록은 저장됐지만 CATALOG.md의 수동 수정과 충돌했습니다. 문서를 덮어쓰지 않았습니다.`
- **뜻:** 기록은 저장됐어요. 부품 목록 문서를 누군가 직접 고쳐서 자동 갱신만 멈췄어요.
- **해 볼 것:** 캡처해서 강사·담당자에게 보내요.

---

## H. 카탈로그 "페이지 사용 차단"

**보이는 문구 (좋은 소식, 오류 아님):** 카탈로그의 `Status: starter; API: supported; Page use: full public API; …` 와 `Reason: Starter part, unchanged`
- **뜻:** 내가 고치지 않은 스타터 부품이에요. 페이지에 바로 쓸 수 있어요. 할 일이 없어요.

**보이는 문구:** 카탈로그의 `Status: stale; … Page use: blocked; …` 와 `Reason: Starter part changed: <바뀐 것>. The student must run pnpm ds:review <Name> in a terminal.`
- **뜻:** 나(또는 AI)가 이 스타터 부품의 코드·CSS·의존 파일을 바꿨어요. 바뀐 부품은 내가 확인하기 전까지 페이지에 쓸 수 없어요.
- **해 볼 것:** Storybook 에서 그 부품을 보고, 새 터미널에서 `pnpm ds:review <이름>` 을 **내가 직접** 실행해요([학생 매뉴얼 6-1](student-manual.ko.md#6-1-지켜야-할-것), G). 그다음 카탈로그에 `approved_scope` 와 `Page use: reviewed scope only` 가 나와요.

**보이는 문구:** 카탈로그의 `Page use: blocked` / `Reason: No starter baseline or student review yet` · `Human review rejected` · `Changed since review: …`
- **뜻:** 이 부품은 아직 페이지에 쓸 수 없어요. 검수 기록이 없는 새 부품이거나, 검수가 반려됐거나, 검수 뒤에 부품이 바뀌었어요.
- **해 볼 것:** Storybook 에서 그 부품을 확인하고 `pnpm ds:review <이름>` 을 내가 직접 실행해요. `stale`(바뀜)이면 다시 검수해요.

**보이는 문구:** `BLOCKED_CATALOG: <부품> needs a supported public API and either an unchanged starter baseline or the student's review of its current version.`
- **뜻:** 페이지 계획에 내가 고쳤거나 새로 만들었지만 아직 검수하지 않은 부품이 들어 있어요.
- **해 볼 것:** 먼저 `pnpm ds:review <부품>` 을 내가 직접 실행하거나, 고치지 않은 스타터 부품으로 계획을 바꿔요.

**보이는 문구:** `BLOCKED_CATALOG: the props/states of <부품>/<id> are outside what the human review covered.`
- **뜻:** 부품은 검수됐지만, 검수 때 확인하지 않은 모양(예: Button 의 아이콘 붙은 모양)을 쓰려고 했어요.
- **해 볼 것:** 검수한 모양만 쓰도록 계획을 바꾸거나, 그 모양을 추가로 검수해요.

**보이는 문구:** `BLOCKED_CATALOG: <부품> changed after the page plan was approved. Check the page plan again.`
- **뜻:** 페이지 계획을 승인한 뒤 그 부품의 코드가 바뀌었어요.
- **해 볼 것:** AI 와 페이지 계획을 다시 확인하고 승인해요. 부품이 `stale` 이면 부품도 다시 검수해요.

**보이는 문구 (안내, 오류 아님):** 카탈로그의 `Visual: needs_review (check again)` / `Reason: … Token values changed: check the visuals again`
- **뜻:** 검수한 뒤 색 같은 디자인 값(토큰)이 바뀌었어요. 예: 학생 Figma 색으로 교체. **동작 검수와 페이지 사용은 그대로 유지**되고, 색·모양만 눈으로 한 번 더 보면 돼요.
- **해 볼 것:** 시간이 될 때 Storybook 에서 그 부품을 다시 봐요. 페이지 작업은 계속해도 돼요.

**보이는 문구:** 카탈로그의 `Visual: failed` / `Visual: stale` (`pnpm ds:review --list` 에서는 `visual: failed` / `visual: stale`)
- **뜻:** 시각 검수가 반려됐거나(`failed`), 부품 코드가 바뀌어 시각도 다시 봐야 해요(`stale`).
- **해 볼 것:** 그 부품을 다시 검수해요.

---

## I. 페이지 만들기·빌드 (`ds:page` · `ai:check-page` · `web:build`)

`ds:page` 와 `ai:check-page` 의 오류는 모두 `Page work blocked: ` 로 시작해요.

**보이는 문구:** `Page work blocked: Usage: pnpm ds:page docs/plans/pages/<Site>.md / pnpm ai:check-page <Name>`
- **해 볼 것:** AI 가 계획서 경로(`ds:page`) 또는 페이지 이름(`ai:check-page`)을 빠뜨렸어요. AI 에게 계획서나 페이지 이름을 알려 줘요. 예: "Home 페이지 검사해 줘"

**보이는 문구:** `Page work blocked: Page plan: …` (예: `Needs exactly one page-spec JSON block.`, `Set the title and the language (ko or en).`)
- **뜻:** 페이지 계획서에 빠진 내용이 있어요.
- **해 볼 것:** 메시지를 AI 에게 보여 주고 계획서를 함께 채워요. 계획이 바뀌면 다시 승인해요.

**보이는 문구:** `Page work blocked: Web settings are already connected. They are not replaced automatically. Compare the plan with the current file yourself.` (또는 `Page work blocked: Keeping the existing file: <경로>`)
- **뜻:** `pnpm ds:page …` 가 다시 실행됐는데, 이 계획의 페이지는 이미 만들어져 있어요. 내가 승인한 뒤 AI 가 허락을 구하고 이미 실행했을 거예요. `ds:page` 는 이미 있는 페이지와 사이트 설정(`web.config.json`)을 바꾸지 않으니 아무것도 바뀌지 않았어요.
- **해 볼 것:** `my-website/pages/` 를 열어 봐요. `<이름>Page.tsx` 파일이 있으면 `ds:page` 는 다시 실행할 필요가 없어요. 다음 단계로 가요. AI 에게 "페이지 빈칸 채우고 검사해 줘"라고 해요(AI 가 `PAGE_SLOT` 을 채우고 `pnpm ai:check-page <페이지 이름>` 실행)([학생 매뉴얼 6-2](student-manual.ko.md#6-2-순서)).
  - 계획을 바꿔 새 revision 을 승인했다면 `ds:page` 는 페이지를 다시 만들지 않아요. AI 에게 페이지와 `web.config.json` 을 승인한 계획과 비교해 다른 곳만 고쳐 달라고 하고, 모든 페이지를 검사해 달라고 해요(AI 가 `pnpm ai:check-page <페이지 이름>` 실행).

**보이는 문구:** `… Some data/event slots are not connected yet. Connect only the behavior in the approved plan.`
- **뜻:** 버튼을 눌렀을 때 할 일 같은 연결이 아직 비어 있어요.

**보이는 문구:** `… P03/P04/P12: sections, parts, props, text or connections differ from the approved plan.` / `… P05: there are JSX parts or copied UI that are not in the plan.` / `… P06/P11: page CSS must match the approved layout and Layout tokens. …`
- **뜻:** 만든 페이지가 승인한 계획과 다르거나, 계획에 없는 부품·모양을 페이지에서 따로 만들었어요.
- **해 볼 것:** AI 에게 "승인한 계획 그대로만 만들어 줘"라고 하고 메시지를 보여 줘요.

**보이는 문구 (통과):** `<이름>: static check passed, … A person must still check the real screen, events and responsive layout, and compare it with the original.`
- **뜻:** 자동 검사는 통과했어요. 이제 **눈으로** 화면을 확인할 차례예요.

**보이는 문구 (안내, 오류 아님):** `Check the visuals again (the behavior review and page use still count): <부품 이름들>`
- **뜻:** 페이지에 쓴 부품 중 일부가 검수한 뒤 색 같은 디자인 값이 바뀌었어요. **페이지는 그대로 만들고 쓸 수 있어요.** 색·모양만 눈으로 한 번 더 보면 좋아요.
- **해 볼 것:** 페이지 작업은 계속하고, 시간이 될 때 그 부품들을 Storybook 에서 다시 봐요(H 의 `needs_review` 와 같은 뜻).

**`pnpm web:build` 에서:** `No web page is connected yet. …` / `Set title in web.config.json to the website title the user confirmed.` / `pages in web.config.json needs a page with the / path.`
- **뜻:** 웹사이트 설정 파일(`web.config.json`)에 페이지·제목·첫 페이지(`/`)가 아직 연결되지 않았어요. 페이지 주소끼리 오가는 기능(라우터)은 키트에 이미 있어요. `pnpm ds:page` 가 페이지와 주소를 `web.config.json` 에 적어 줘요.
- **해 볼 것:** 대화창에서 페이지 계획을 먼저 승인해 AI 가 페이지를 만들게 하고(AI 가 `pnpm ds:page docs/plans/pages/<사이트 이름>.md` 실행), 메시지를 AI 에게 보여 줘 설정을 맞춰요. AI 가 "라우터가 없다"며 라우터를 설치하거나 새 앱을 만들겠다고 하면 거절해요.

Figma 화면 사진과 비교는 내가 웹사이트를 부탁하면 AI 가 직접 실행해요(`pnpm web:figma`·`pnpm web:compare`). 아래 문구는 **AI 가 이 메시지를 보여 주면** 보는 곳이에요. 명령을 내가 다시 칠 필요는 없어요.

**AI 가 이 메시지를 보여 주면:** `Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server. (…)`
- **뜻:** Figma 데스크톱 앱과 연결하지 못해서 사진을 저장하지 않았어요. (잘되면 AI 가 `Figma MCP: connected.` 를 보여 줘요.)
- **해 볼 것:** Figma 데스크톱 앱에서 파일을 열고 Dev Mode → Enable desktop MCP server 를 켠 뒤 같은 메시지를 AI 에게 다시 보내요([D. Figma 연결](#d-figma-연결)). 그래도 안 되면 예비책으로 사진을 직접 내보내요(다음 문구).

**AI 가 이 메시지를 보여 주면:** `The Figma MCP did not return a picture. In Figma, select the frame, choose Export → PNG (1x), and save it as my-website/figma/<Page>.png.`
- **뜻:** Figma 가 대답은 했지만 사진을 주지 않았어요.
- **해 볼 것(예비책):** Figma 에서 화면 프레임 선택 → 오른쪽 패널 **Export** → **PNG**, **1x** → **Export**. 페이지 이름으로 저장해요. 예: `my-website/figma/Home.png`. 그다음 AI 에게 "사진을 저장했어요" 라고 알려요.

**AI 가 이 메시지를 보여 주면:** `Add the page name: pnpm web:figma <Page> "<link>"`
- **뜻:** Figma 프레임 이름(예: 한글만 있는 이름)으로 페이지 이름을 만들 수 없었어요.
- **해 볼 것:** 메시지에 페이지 이름을 함께 적어 다시 보내요. 예: "이 Figma 화면으로 내 웹사이트 만들어 줘 Home: <링크>".

**AI 가 이 메시지를 보여 주면:** `Already saved: my-website/figma/<Page>.png, …. To read the screen again and replace it, run: pnpm web:figma <Page> "<link>" --replace`
- **뜻:** 그 페이지 사진이 이미 있어요. 저절로 덮어쓰지 않아요.
- **해 볼 것:** Figma 화면이 바뀌었을 때만 AI 에게 "Home 화면 사진을 다시 저장해 줘" 라고 말해요. 화면 하나에 Figma MCP 를 2번 써요.

**AI 가 이 메시지를 보여 주면:** `No Figma picture for <Page>. …` (또는 `No approved pages are connected yet. …`)
- **뜻:** 그 페이지는 아직 비교할 것이 없어요. Figma 사진이 없거나, 페이지를 아직 만들지 않았어요.
- **해 볼 것:** 사진이 없으면 그 화면의 Figma 링크를 AI 에게 보내요(안 되면 위의 예비책). 페이지가 없으면 페이지 계획을 먼저 승인해 AI 가 페이지를 만들게 해요(AI 가 `pnpm ds:page …` 실행). 잘되면 AI 가 `var/compare/<Page>/index.html` 경로를 알려 줘요 — 그 파일을 열어 눈으로 비교해요. 점수는 없어요. 글꼴·브라우저 때문에 조금 다른 것은 정상이에요.

---

## J. 배포 (`deploy.sh` / `deploy.ps1`)

배포 방법은 두 가지예요. 수업에서는 2안 Vercel 만 쓰는 방식을 쓰고, 1안 GitHub + Vercel 방식은 고른 사람만 써요([학생 매뉴얼 6-3](student-manual.ko.md#6-3-인터넷에-올리기배포)). Qwen 대화창에 "내 사이트 올려 줘."(또는 `/my-deploy`)라고 해요.

- **배포 명령은 모두 AI 가 직접 실행해요**(`node scripts/deploy.mjs …`). 내가 배포 명령을 칠 일은 없어요.
- **나는 누르고 고르기만 해요:** AI 가 물으면 `Yes, allow once` 를 누르고, AI 의 질문에는 선택지를 골라 답해요.
- **Vercel 토큰은 "Paste your Vercel token" 이라는 브라우저 창에만 넣어요.** AI 대화창에는 절대 붙여 넣지 마요.
- 1안에서 내가 직접 치는 것은 하나뿐이에요: GitHub 에 한 번 로그인하기(아래 "GitHub needs you to sign in once" 참고).
- 명령이 실패하면 AI 가 이 절을 읽고 설명해 줘요. 나도 여기서 문구를 찾아볼 수 있어요.

### 정상 문구 (오류 아님)

**보이는 문구:** `Ask the student: …` (예: `Ask the student: which way to deploy — …`, `Ask the student: a new Vercel project name …`, `Ask the student: the address of their own GitHub repository. …`)
- **뜻:** 정상이에요. 명령에 내 대답이 하나 필요해서, 아무것도 바꾸기 전에 멈췄어요.
- **해 볼 것:** AI 가 선택지로 물어봐요. 하나를 골라요(또는 Other 를 골라 직접 써요). 그러면 AI 가 명령을 다시 실행해요.

**보이는 문구:** `Deployment method: not selected. Run setup --method git or setup --method api.` (`check` 에서)
- **뜻:** 처음에는 정상이에요. 아직 배포 방식을 고르지 않았어요.
- **해 볼 것:** 할 일 없어요. AI 가 방식을 선택지로 묻고 연결해 줘요.

**보이는 문구:** `A browser window opened. Paste your Vercel token there, not in the chat. Waiting…`
- **뜻:** 2안에 Vercel 토큰이 필요해서, 브라우저에 "Paste your Vercel token" 페이지가 열렸어요.
- **해 볼 것:** 그 페이지에 토큰을 붙여 넣고 **Save** 를 눌러요. 토큰이 아직 없으면 Vercel → Account Settings → Tokens → Create 에서 만들어요. Expiration(만료일)은 수업이 끝나는 날쯤으로 정해요.

**보이는 문구:** `Saved. Go back to VS Code.` (페이지에서) / `Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. To remove it, ask the AI: "Forget my Vercel token".`
- **뜻:** 끝났어요. Vercel 이 토큰을 받아들였어요. 다음부터는 다시 묻지 않아요.
- **해 볼 것:** VS Code 로 돌아가요. AI 가 배포를 이어서 해요.

### Vercel 토큰 (2안)

**보이는 것:** 브라우저 창이 안 열렸어요. 출력에 `The browser did not open by itself. Open this address in your browser: http://127.0.0.1:<포트>/<긴 코드>` 가 보여요.
- **뜻:** 컴퓨터가 브라우저를 스스로 열지 못했어요.
- **해 볼 것:** 주소 전체를 복사해 브라우저 주소창에 넣어 열어요. 거기에 토큰을 붙여 넣고 **Save** 를 눌러요. 이 주소는 이 컴퓨터에서, 한 번만 쓸 수 있어요. 페이지가 안 열리거나 `Not found` 가 나오면 AI 에게 다시 배포해 달라고 해서 새 주소를 받아요.

**페이지에 보이는 문구:** `This token does not work. Make a new one in Vercel and paste it again.`
- **뜻:** Vercel 이 이 토큰을 거절했어요. 틀렸거나, 일부만 복사됐거나, 만료됐거나, 지워진 토큰일 수 있어요.
- **해 볼 것:** Vercel → Account Settings → Tokens → Create 에서 토큰을 새로 만들어요. 같은 페이지에 새 토큰을 붙여 넣고 다시 **Save** 를 눌러요.

**페이지에 보이는 문구:** `Paste one Vercel token without spaces.` (또는 `Enter one Vercel token without spaces.`)
- **뜻:** 칸이 비어 있거나, 토큰 중간에 빈칸이 있어요.
- **해 볼 것:** 토큰만 다시 복사해 붙여 넣고 **Save** 를 눌러요.

**페이지에 보이는 문구:** `Could not reach Vercel. Check the internet, then press Save again.`
- **해 볼 것:** 인터넷 연결을 확인하고 **Save** 를 다시 눌러요.

**보이는 문구:** `The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.`
- **뜻:** 전에 저장한 토큰이 만료됐거나 Vercel 에서 지워졌어요. 키트가 그 토큰을 지웠고, 브라우저 창이 다시 열려요.
- **해 볼 것:** Vercel(Account Settings → Tokens → Create)에서 토큰을 새로 만들어, 열린 브라우저 창에 붙여 넣어요.

**보이는 문구:** `No token was entered. Ask the AI to deploy again.`
- **뜻:** 8분 동안 브라우저 창에 토큰이 저장되지 않아서 명령이 멈췄어요. 아무것도 올라가지 않았어요.
- **해 볼 것:** 토큰을 미리 준비하고 AI 에게 다시 배포해 달라고 해요. 창이 열리면 바로 붙여 넣어요.

**보이는 것:** Vercel 토큰을 AI 대화창에 붙여 넣었어요.
- **뜻:** 이제 그 토큰은 비밀이 아니에요. 다른 사람이 그 토큰으로 내 Vercel 프로젝트를 바꿀 수 있어요.
- **해 볼 것:** Vercel → Account Settings → Tokens 에서 **그 토큰을 지금 바로 지워요.** 새 토큰을 만들어요. 그다음 AI 에게 다시 배포해 달라고 하고, 새 토큰은 **브라우저 창에만** 붙여 넣어요.

**하고 싶은 것:** 이 컴퓨터에 저장된 토큰을 지우고 싶어요.
- **해 볼 것:** AI 에게 "Vercel 토큰 지워 줘"(영어로는 "Forget my Vercel token")라고 해요. `Your saved Vercel token was deleted from this computer.`(또는 `There is no saved Vercel token on this computer.`)와 `If you don't need it anymore, also delete it in Vercel → Account Settings → Tokens.` 가 보여요.

**보이는 문구:** `Vercel API request failed: <이유>`
- **뜻:** Vercel 이 요청을 거절했어요. 콜론 뒤는 Vercel 이 보낸 이유예요. 그 안에 토큰이 있으면 `[hidden]` 으로 가려져요. 흔한 이유는 토큰이 틀렸거나 만료됐거나, 프로젝트 이름이 이미 쓰이고 있는 경우예요.
- **해 볼 것:** 이유가 프로젝트 이름이면 AI 에게 새 프로젝트 이름으로 다시 연결해 달라고 해요. 토큰 문제면 Vercel 에서 토큰을 새로 만들고 AI 에게 다시 배포해 달라고 한 뒤, 브라우저 창에 새 토큰을 붙여 넣어요. 계속 실패하면 화면을 캡처해 강사에게 보내요(토큰이 보이지 않는지 확인해요).

**보이는 문구:** `Could not reach the Vercel API. Check the network and try again.`
- **해 볼 것:** 인터넷 연결을 확인하고 AI 에게 다시 배포해 달라고 해요.

**보이는 문구:** `Use a lowercase Vercel project name with letters, numbers, dot, underscore or hyphen.`
- **뜻:** 프로젝트 이름에 대문자·빈칸·다른 기호가 들어 있어요.
- **해 볼 것:** AI 에게 `my-cafe-site` 처럼 영어 소문자·숫자·`.`·`_`·`-` 만 쓴 새 프로젝트 이름으로 다시 연결해 달라고 해요.

**보이는 문구:** `--project does not match the locally connected Vercel project. Check .vercel/project.json yourself.` / `Check the project and account info in .vercel/project.json.` / `Could not read the project and account IDs from Vercel.`
- **뜻:** 이 폴더가 이미 다른 Vercel 프로젝트와 연결돼 있거나(예: GitHub 방식으로 연결했던 프로젝트), 저장된 프로젝트 정보가 깨졌어요.
- **해 볼 것:** `.vercel/` 은 직접 고치지 마요. 캡처해서 강사에게 물어봐요. 2안에는 새 Vercel 프로젝트가 필요해요.

### GitHub needs you to sign in once (1안 GitHub 첫 로그인)

**보이는 문구:** `GitHub needs you to sign in once. In VS Code, open Terminal → New Terminal and run gh auth login, then gh auth setup-git (troubleshooting J, "GitHub needs you to sign in once"). Then ask the AI to deploy again.`
- **뜻:** 내 작업을 올리기 전에 GitHub 가 "나"인지 확인해야 해요. 1안에서 내가 직접 치는 것은 **이것 하나뿐**이고, 한 번만 하면 돼요.
- **해 볼 것:**
  1. VS Code 에서 **Terminal → New Terminal** 을 열어요.
  2. `gh auth login` 을 치고 Enter 를 눌러요. `GitHub.com` → `HTTPS` → `Yes` → `Login with a web browser` 를 차례로 골라요. 보이는 코드를 복사하고 Enter 를 누른 뒤, 브라우저에서 GitHub 에 로그인해요.
  3. `gh auth setup-git` 을 치고 Enter 를 눌러요.
  4. AI 에게 다시 배포해 달라고 해요.
  - `gh` 를 찾을 수 없다고 나오면 GitHub CLI 를 먼저 설치하고, 새 터미널을 열어 2번부터 다시 해요. Mac: `brew install gh`. Windows: `winget install --id GitHub.cli --exact --source winget`.

### GitHub 방식 (1안)

**보이는 문구:** `Enter the HTTPS or SSH address of your own GitHub repository.` / `This will not push to the instructor's starter repository. …`
- **뜻:** 저장소 주소가 비어 있거나 틀렸어요. 또는 강사의 스타터 저장소 주소였어요.
- **해 볼 것:** AI 에게 다시 연결해 달라고 해요. AI 가 물으면 Other 를 골라 **내** GitHub 저장소 주소를 써요.

**보이는 문구:** `Run publish on a work branch so Vercel creates a Preview. Use production on the Production Branch.`
- **뜻:** 지금 Production Branch 에 있어요. Preview(시험용 주소)는 작업 브랜치에서만 만들 수 있어요. 스크립트는 브랜치를 바꾸지 않아요.
- **해 볼 것:** 혼자 브랜치를 바꾸지 마요. 강사에게 물어봐요. 브랜치 옮기기는 수업에서 함께 해요.

**보이는 문구:** `Run production on the Vercel Production Branch. The branch is not switched automatically.`
- **뜻:** 작업 브랜치에 있는데 Production 을 골랐어요. 스크립트는 브랜치를 대신 바꾸지 않아요.
- **해 볼 것:** 확인한 변경을 먼저 Production Branch 로 옮겨요(수업에서 함께 해요). 그다음 AI 에게 다시 모두에게 공개(Production)해 달라고 해요. 잘 모르겠으면 강사에게 물어봐요.

**보이는 문구:** `Set the Vercel Production Branch.`
- **뜻:** Vercel 프로젝트에 Production Branch 가 아직 정해지지 않았어요.
- **해 볼 것:** Vercel 프로젝트의 Settings → Environments → Production → Branch Tracking 에서 브랜치를 골라요. 그다음 AI 에게 다시 배포해 달라고 해요.

**보이는 문구:** `GitHub has newer changes or a conflict. Sync first. This script never force-pushes.` / `Fix the Git conflicts first.`
- **뜻:** GitHub 에 있는 내용과 내 컴퓨터 내용이 엇갈렸어요.
- **해 볼 것:** 혼자 해결하려 하지 말고 캡처해서 강사에게 보내요.

### 두 방식 공통

**보이는 문구:** `Choose a deploy command: check, setup, publish, production or forget-token.`
- **뜻:** AI 가 배포 스크립트를 올바른 명령 이름 없이 실행했어요. 아무것도 바뀌지 않았어요.
- **해 볼 것:** AI 에게 다시 "내 사이트 올려 줘."라고 해요.

**보이는 문구:** `No deploy method is selected. Run setup first.` / `No Vercel project is connected. Run setup first.`
- **뜻:** 배포 방식이 아직 연결되지 않았거나, 연결이 끝나지 않았어요.
- **해 볼 것:** AI 에게 다시 배포해 달라고 해요. AI 가 방식을 선택지로 묻고 먼저 연결해 줘요.

**보이는 문구:** `The deploy method must be git or api.` / `Use --method, --project and --repo only with setup.`
- **뜻:** AI 가 명령을 조금 틀리게 썼어요. 아무것도 바뀌지 않았어요.
- **해 볼 것:** AI 에게 다시 배포해 달라고 해요. 물어보면 "Vercel only" 또는 "GitHub + Vercel" 을 골라요.

**보이는 문구:** `This project is set up for <대상>. Run setup --method <방식> --target <대상> first.`
- **뜻:** 하나(내 웹사이트 또는 내 Storybook)를 연결해 놓고, 다른 하나를 올리려고 했어요.
- **해 볼 것:** AI 에게 연결해 둔 것을 올려 달라고 해요. 바꾸고 싶으면 먼저 강사에게 물어봐요.

**보이는 문구:** `Build output not found: …/index.html` / `Node.js 20 or newer is needed.`
- **뜻:** 웹사이트를 만드는 단계(빌드)가 끝나지 않았거나 Node.js 가 오래됐어요.
- **해 볼 것:** I 의 `web:build` 오류부터 해결해요. Node 문제면 설치 스크립트를 다시 실행해요.

**보이는 문구:** `Vercel deploy failed: <상태>. Check the build log under Deployments in your Vercel project.`
- **해 볼 것:** Vercel 웹사이트의 내 프로젝트 → **Deployments** 에서 실패한 항목을 열고, 로그 화면을 캡처해 강사에게 보내요.

**보이는 문구:** `Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.`
- **뜻:** 배포 명령 하나는 최대 10분쯤 실행돼요. 그 시간이 끝났을 때 Vercel 이 아직 작업 중이었어요. 아직 성공이 아니에요.
- **해 볼 것:** Vercel 웹사이트의 내 프로젝트 → **Deployments** 에서 **Ready** 가 되는지 봐요. 계속 멈춰 있거나 실패하면 AI 에게 다시 배포해 달라고 해요. 또 실패하면 로그 화면을 캡처해 보내요.

**보이는 문구:** `<명령> <단계> failed: <이유>` (예: `git push failed: …`, `vercel link failed: …`)
- **뜻:** 배포 스크립트가 쓰는 프로그램(Git 이나 Vercel)이 오류로 멈췄어요.
- **해 볼 것:** 메시지 전체를 캡처해서(토큰이 보이지 않는지 확인해요) 강사에게 보내요.

---

## K. 내 기획서 (AI 가 `pnpm specs` 실행)

"기획서 정리해 줘"나 "남은 질문 있어?"라고 하면 AI 가 `pnpm specs` 를 실행해(허락 창 → `Yes, allow once`) `my-docs/` 의 내 기획서가 어디까지 됐는지 보여 줘요. 스크립트는 AI 를 쓰지 않지만, AI 가 실행·설명하는 대화 한 번만큼 크레딧이 들어요. 오류로 멈추지 않아요. 마지막 줄이 다음 할 일을 알려 줘요([학생 매뉴얼 3-2](student-manual.ko.md#3-2-내-폴더-3개와-ai-에게-하는-말)).

**보이는 문구:** `Open questions [NEEDS CLARIFICATION]: <개수>` 와 `1. <질문>  (spec.md:12, plan.md:30)` 같은 번호 목록, 그리고 `Next: the AI asks these with choices in the Qwen chat; pick an answer or type your own. No choices? Answer with the same numbers (1. … 2. …).`
- **뜻:** 내 메모에 없는 내용이에요. AI 가 지어내지 않고 물어보는 거예요. 괄호 안은 질문이 있는 곳(파일과 줄)이에요.
- **해 볼 것:** AI 가 선택지로 물으면 답을 골라요(맞는 게 없으면 Other 를 골라 직접 써요). 선택지가 안 뜨면 Qwen 대화창에 같은 번호로 답해요. 예: `1. Our Menu 2. Find us`. `0` 이 나올 때까지 AI 에게 "남은 질문 있어?"라고 물어요.

**보이는 문구:** `· <파일> — not written yet` / `✗ <파일> — missing section "<이름>"` + `Next: ask the AI in your own words to organize your documents into specs …`
- **뜻:** `my-docs/specs/` 의 파일이 아직 없거나, 꼭 있어야 할 부분이 빠졌어요.
- **해 볼 것:** AI 에게 "기획서 정리해 줘"라고 해요. 실수로 섹션을 지웠다면 다시 넣어 달라고 해요.

**보이는 문구:** `✗ plan.md:34 — this table row has 6 cells, the header has 5. Write a | inside text as \|.`
- **뜻:** 글 안의 `|`(예: 페이지 제목 `Menu | Bean There`)가 표 칸을 둘로 나눠서 웹사이트 단계에서 표를 잘못 읽게 돼요.
- **해 볼 것:** 그 줄을 열어 글 안의 `|` 를 `\|` 로 바꿔요. 아니면 AI 에게 "기획서 정리해 줘"라고 하면 고쳐 줘요.

**보이는 문구:** `~ changed  <파일>` / `- removed  <파일>` + `Next: ask the AI in your own words to organize your documents into specs (<개수> inbox file(s) new, changed or removed since the last tidy).`
- **뜻:** AI 가 지난번에 정리한 뒤에 `my-docs/inbox/` 의 문서를 더하거나 고치거나 지웠어요.
- **해 볼 것:** AI 에게 다시 "기획서 정리해 줘"라고 해요. 새 파일·바뀐 파일만 읽고, `specs/` 에서 내가 고친 줄은 그대로 둬요.

**보이는 문구:** `(empty — put your plan, PRD, user stories or notes here, or fill in inbox/brief.md)` + `Next: add documents to my-docs/inbox, then ask the AI in your own words to organize them into specs.`
- **해 볼 것:** 문서를 `my-docs/inbox/` 에 넣거나 `my-docs/inbox/brief.md` 양식을 채워요.

**보이는 문구:** `! The AI can't read this file type. Save it as .md or .txt, or copy the text into a .md file.` (PDF·그림에도 비슷한 안내가 나와요)
- **뜻:** Word·PowerPoint·Excel·HWP 파일은 읽지 못해요. PDF·그림은 내 AI 모델이 읽을 수 있을 때만 돼요.
- **해 볼 것:** 그 파일을 `.md` 나 `.txt` 로 저장해 `my-docs/inbox/` 에 넣거나, 글을 `.md` 파일에 옮겨 붙여요.

**보이는 문구 (좋은 소식):** `Specs are ready. Next: ask the AI in your own words to make your website from these specs.`
- **뜻:** 남은 질문이 없어요. 이제 웹사이트를 계획하면 돼요([학생 매뉴얼 6-2](student-manual.ko.md#6-2-순서)).

---

## L. 아이콘·그림·글꼴 (AI 가 `pnpm assets` 실행)

"my-assets 에 넣은 파일 정리해 줘"라고 하면 AI 가 `pnpm assets` 를 실행해요(허락 창 → `Yes, allow once`). 스크립트는 AI 를 쓰지 않고, `my-assets/` 에 던져 둔 파일을 `icons/`·`images/`·`typo/` 로 나눠 옮겨요. 내 파일을 지우지 않아요. 문제가 있는 파일은 제자리에 두고 `✗` 로 알려 줘요([학생 매뉴얼 3-2](student-manual.ko.md#3-2-내-폴더-3개와-ai-에게-하는-말)).

**보이는 문구 (오류 아님):** `Waiting for you (not moved — choose where each file goes)` + `? <파일> — <크기>: bigger than an icon (64) but not clearly a picture`(또는 다른 이유) + `icon:    pnpm assets --to icons "<파일>"` / `picture: pnpm assets --to images "<파일>"`
- **뜻:** 이 SVG 가 아이콘인지 그림인지 정할 수 없어서 내가 고르게 해요.
- **해 볼 것:** AI 의 질문에 말로 답해요. 예: "logo.svg 는 아이콘이야". AI 가 맞는 명령을 실행해요.

**보이는 문구:** `✗ <파일> — This kind of file isn't used in my-assets. It takes icons (.svg), pictures (.png .jpg .webp .gif .avif .svg) and fonts (.woff2 .woff .ttf .otf). Move it out of my-assets.`
- **뜻:** 아이콘·그림·글꼴이 아닌 파일이에요(예: `.txt`, `.docx`).
- **해 볼 것:** 그 파일을 `my-assets/` 밖으로 옮겨요. 기획 문서는 `my-docs/inbox/` 에 넣어요.

**보이는 문구:** `✗ <파일> — Websites can't show this format. Export it again from Figma (or your picture app) as PNG, JPG, WebP or SVG.`
- **해 볼 것:** 그 형식 중 하나로 다시 내보내 `my-assets/` 에 넣고, 예전 파일은 지워요.

**보이는 문구:** `✗ <파일> — my-assets/<폴더>/<이름> already exists. Rename one of them, or remove the copy you don't need.`
- **뜻:** 같은 이름의 파일이 그 폴더에 이미 있어서 아무것도 옮기지 않았어요.
- **해 볼 것:** 새 파일 이름을 바꾸거나(예: `cart-2.svg`) 필요 없는 쪽을 지운 뒤 AI 에게 다시 정리해 달라고 해요.

**보이는 문구:** `✗ <파일> — Give the file a name with English letters or numbers, like arrow-right.svg.`(그림이면 `like hero-photo.png`)
- **해 볼 것:** 파일 이름을 영어 글자나 숫자로 바꾼 뒤 AI 에게 다시 정리해 달라고 해요.

**보이는 문구:** `✗ <폴더>/ — Folders inside my-assets aren't sorted. Move the files out of this folder into my-assets, then ask the AI to sort my-assets again (it runs pnpm assets).`
- **해 볼 것:** 파일을 `my-assets/` 바로 아래로 옮긴 뒤 AI 에게 다시 정리해 달라고 해요.

**보이는 문구:** `✗ <파일> — This is not a font file, or it is damaged. Download the font again.` / `✗ <파일> — This is a font collection (several fonts in one file). Download the single font files (.woff2, .ttf or .otf) instead.`
- **해 볼 것:** 글꼴을 `.woff2`·`.ttf`·`.otf` 낱개 파일로 다시 받아요.

**보이는 문구:** `<개수> file(s) need fixing. … Icons: <개수> · Images: <개수> · Fonts: <개수> file(s).`
- **뜻:** 요약 줄이에요. 그 위의 `✗` 줄을 하나씩 고치고, `All good.` 이 나올 때까지 AI 에게 다시 정리해 달라고 해요.

---

관련 문서: [학생 매뉴얼](student-manual.ko.md) · 강사 검수 안내서(강사 전용 — 학생 키트에는 없어요) · [배포 안내](../vercel-deployment.md)
