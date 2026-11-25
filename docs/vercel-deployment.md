# 내 웹사이트를 Vercel 에 올리기

지금 내 웹사이트는 내 컴퓨터에서만 열려요. 배포하면 인터넷에 올라가서, 링크만 있으면 누구나 열 수 있어요. 이 안내는 웹사이트(또는 Storybook)를 **내 Vercel 프로젝트**에 올려 인터넷 주소를 받는 방법이에요. 수업에서 함께 해요. 수업에서는 학생이 AI 에게 말로 부탁하고, 배포 명령은 AI 가 실행해요(2절). 4절부터는 명령이 실제로 하는 일을 개발자·강사용으로 적어요.

Storybook 은 부품 카탈로그예요. 웹사이트는 그 부품으로 만든 페이지(`my-website/pages/`)예요.

## 0. 보게 될 낱말

| 낱말 | 뜻 |
|---|---|
| Vercel | 내 사이트를 인터넷에 올려 주는 서비스예요. 수업 전에 가입해요(이메일 가입 가능, 무료 Hobby). |
| GitHub | 코드를 저장하는 온라인 창고예요. 1안을 고를 때만 수업에서 준비해요. |
| repository (저장소) | GitHub 에 저장한 프로젝트 폴더예요. |
| commit | 바꾼 내용을 짧은 메모와 함께 저장한 기록이에요. |
| branch (브랜치) | 저장소 안의 따로 떨어진 작업 줄기예요. |
| Production Branch | Vercel 이 진짜 주소에 올리는 브랜치 하나예요. |
| token (토큰) | 프로그램용 비밀번호 같은 비밀 열쇠예요. 2안에서 Vercel 에서 받아, 키트가 여는 브라우저 창에 한 번 넣어요. |
| Preview | 시험용 주소예요. 먼저 여기서 확인해요. |
| Production | 누구나 여는 진짜 주소예요. |
| 빌드 | 내 페이지 파일을 인터넷에 올릴 수 있는 결과 파일(`dist/`)로 만드는 일이에요. |

## 1. 1안·2안 고르기

**수업에서는 2안(Vercel 방식)으로 해요.** 1안(GitHub 방식)은 원하는 사람만 하는 선택이에요(6절).

처음 연결(`setup`)할 때 하나를 골라요. AI 는 선택지 "Vercel only (Recommended)"(2안) / "GitHub + Vercel"(1안)로 물어요. 어느 쪽이든 웹사이트는 똑같아요. 한 프로젝트는 한 방식만 써요.

| | 1안 — GitHub 방식 (`--method git`) | 2안 — Vercel 방식 (`--method api`) |
|---|---|---|
| 필요한 것 | GitHub 계정, 내 저장소, 내 컴퓨터의 Git·GitHub 로그인, 그 저장소와 연결한 Vercel 프로젝트 | Vercel 계정과 Vercel 토큰만. GitHub·Git 은 필요 없어요. |
| 좋은 점 | 올린 변경 기록이 GitHub 에 남아요 | 준비가 적어요. 수업 전 Vercel 가입만 하면 돼요 |
| 아쉬운 점 | 수업에서 준비할 것이 많아요 | 처음 한 번 토큰을 만들어 브라우저 창에 넣어야 해요 |
| 올라가는 것 | commit 한 코드를 GitHub 에 올리면, Vercel 이 가져가서 빌드해요 | 내 컴퓨터에서 검사·빌드한 결과 파일(`dist/` 또는 `storybook-static/`)을 Vercel 에 바로 올려요 |
| Preview (시험용 주소) | 작업 브랜치에서 `publish` | `publish` |
| Production (진짜 주소) | Vercel Production Branch 에서 `production` | `production` |
| 토큰 | 쓰지 않아요 | `VERCEL_TOKEN` → 이 컴퓨터에 저장된 토큰 → 일회용 브라우저 창 순서로 찾아요(5절) |

고르기 어려우면 **2안**을 추천해요. 사전 준비가 Vercel 가입뿐이라 바로 시작할 수 있어요.

## 2. AI 가 배포해요 (`/my-deploy`)

학생은 "Put my site online."(한국어 "내 사이트 올려 줘.")이라고 말하거나 `/my-deploy`, `/my-deploy 2`, `/my-deploy 1 storybook` 을 써요. 지시문은 `.qwen/commands/my-deploy.md` 예요.

AI 가 하는 일:

1. 처음이면(`.vercel/deploy.json` 없음) `ask_user_question` 으로 물어요: 방식("Vercel only (Recommended)" / "GitHub + Vercel"), 대상("My website (Recommended)" / "My Storybook"), 2안은 새 프로젝트 이름(문서나 `web.config.json` 의 `title` 로 1~2개 추천, Other 로 직접 입력), 1안은 학생 GitHub 저장소 주소(Other). 설정이 있으면 저장된 방식과 대상을 다시 써요.
2. 셸 도구로 `node scripts/deploy.mjs check` → (처음이면) `setup` → `publish` 를 실행해요. 명령마다 `timeout: 600000`, 앞에서(background 아님) 한 번씩 실행해요. 학생은 허락 창(`Yes, allow once`)만 눌러요.
3. Preview 주소를 보여 주고 "Put it online for everyone (Production)" / "Not yet"(둘 다 추천 표시 없음)으로 물어요. Production 을 고른 뒤에만 `production` 을 실행해요.
4. 학생이 "Forget my Vercel token"("Vercel 토큰 지워 줘")이라고 하면 `forget-token` 을 실행해요.
5. 실패하면 [오류 대처 안내서 J](manual/troubleshooting.ko.md)만 읽고 첫 문제와 돌아갈 단계를 짧게 말해요.

- `QWEN_CODE=1` 이어도 더는 막지 않아요. 예전의 `Deploying puts your site on the internet. Type this command yourself …` 안내는 없어졌어요.
- AI 셸은 TTY 가 아니라서(`QWEN_CODE=1` 이면 TTY 여도 아님으로 봐요) 스크립트는 질문을 기다리지 않아요. setup 에 필요한 값(`--method`, 2안 `--project`, 1안 `--repo`)이 없으면 바로 `Ask the student: …` 한 줄로 끝나요. AI 가 선택지로 묻고 같은 명령을 다시 실행해요.
- 학생이 터미널에 치는 것은 1안의 GitHub 첫 로그인(`gh auth login` → `gh auth setup-git`)뿐이에요.

### 훅으로 막는 셸 명령

`.qwen/settings.json` 의 `PreToolUse` 에 `run_shell_command` 가 붙어 있어 `node scripts/ai-check.mjs pre` 가 셸 명령(`tool_input.command`)을 먼저 봐요. 다음은 `Blocked: <이유>` 로 막아요.

- `.ds-starter` 또는 `vercel-token` 이 들어간 명령(저장된 토큰 읽기·복사·지우기). 지우기는 `node scripts/deploy.mjs forget-token` 으로만 해요.
- `VERCEL_TOKEN` 이 들어간 명령.
- `--token` 인자.
- 환경 변수 전체 출력: `env`·`printenv`·`set` 단독, `export -p`, `declare -x`, `typeset -x`, PowerShell `Get-ChildItem env:`·`gci env:`·`dir env:`·`ls env:`·`gi env:`.

`node scripts/deploy.mjs …`, `bash deploy.sh …`, `deploy.ps1 …` 와 평범한 명령은 통과해요.

## 3. 먼저 페이지를 연결해요

1. Qwen 대화창의 `/my-website` 로 페이지 계획을 만들고 승인해요.
2. 새 터미널에서 내가 직접 `pnpm ds:page docs/plans/pages/<사이트>.md` 를 실행해요. `my-website/pages/` 에 페이지 파일이 생겨요. `web.config.json` 에는 승인한 페이지와 주소가 연결돼요.
3. AI 가 빈칸(`PAGE_SLOT`)을 채워요. 그다음 페이지마다 `pnpm ai:check-page <이름>` 을 통과시키고, `pnpm web:build` 로 빌드해요.

`web.config.json` 은 `pnpm ds:page` 가 만들어요. 직접 고치지 않아요. 아래는 형식만 보여 주는 예예요(이런 사이트가 들어 있는 것은 아니에요).

```json
{
  "schema_version": 2,
  "title": "Bean There",
  "locale": "en",
  "pages": [
    { "name": "Home", "path": "/", "entry": "my-website/pages/HomePage.tsx" },
    { "name": "Menu", "path": "/menu", "entry": "my-website/pages/MenuPage.tsx" }
  ],
  "routes": ["/", "/menu"]
}
```

- 페이지가 아직 연결되지 않았으면(`"entry": null`) 웹 빌드와 배포가 `No web page is connected yet. …` 로 멈춰요.
- `/menu` 같은 주소로 바로 들어가거나 새로고침해도 페이지가 나와야 해요. 그래서 배포 스크립트가 승인된 주소 목록을 Vercel 에 함께 알려 줘요(1안은 `vercel.json` 의 rewrites, 2안은 배포 요청의 routes).

```bash
pnpm web:dev
pnpm web:build
pnpm web:preview
```

웹은 기존 부품과 토큰을 써요. stories 를 웹에서 import 하거나 페이지 안에 버튼 스타일을 따로 복사하지 않아요.

## 4. 배포 명령 쓰는 법

AI 는 `node scripts/deploy.mjs <명령> [옵션]` 을 실행해요. 강사·개발자는 프로젝트 폴더의 터미널에서 아래처럼 직접 실행해도 돼요. 아무것도 붙이지 않거나 `help` 를 붙이면 도움말만 보여 줘요.

| Mac | Windows (PowerShell) |
|---|---|
| `bash deploy.sh <명령> [옵션]` | `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy.ps1 <명령> [옵션]` |

두 OS 모두 `pnpm web:deploy <명령> [옵션]` 도 돼요. Windows 에서 실행 정책 오류가 나면 `pnpm.cmd web:deploy <명령> [옵션]` 을 써요.

| 명령 | 하는 일 |
|---|---|
| `check` | 내 컴퓨터에서만 검사해요. 아무것도 올리지 않아요. 순서: 타입 검사 → `pnpm ds:guard` → 빌드 → 결과 파일 확인. 첫 줄에 지금 설정(`Deployment method: … · target: …`)이 나와요 |
| `setup` | 배포 방식과 대상을 정하고 Vercel 프로젝트와 연결해요. 처음 한 번만 해요 |
| `publish` | Preview 로 올려요. Vercel 이 **Ready** 가 될 때까지 확인해요 |
| `production` | Production 으로 올려요. **Ready** 를 확인해요 |
| `forget-token` | 이 컴퓨터에 저장된 Vercel 토큰 파일을 지워요. `Your saved Vercel token was deleted from this computer.`(없으면 `There is no saved Vercel token on this computer.`) 뒤에 `If you don't need it anymore, also delete it in Vercel → Account Settings → Tokens.` |

명령 하나는 약 9분(540초) 안에 끝나요. Qwen 셸 도구가 최대 10분에 끊기 때문이에요. 빌드·업로드·Ready 대기가 그 안에 안 끝나면 `Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.` 로 끝나요. 상태를 여러 번 묻는 명령은 따로 없어요.

| 옵션 | 쓰는 곳 | 뜻 |
|---|---|---|
| `--method git` / `--method api` | `setup` 만 | 배포 방식(1안 / 2안) |
| `--repo <내 GitHub 저장소 주소>` | `setup` 만 (1안) | 연결할 내 저장소 |
| `--project <새 프로젝트 이름>` | `setup` 만 (2안) | 새로 만들 Vercel 프로젝트 이름. 영어 소문자·숫자·`.`·`_`·`-` |
| `--target web` / `--target storybook` | `check`·`setup` | 올릴 대상. 기본은 `web` |
| `--message "<내용>"`, `--all` 또는 `--file <경로>` | 1안의 `setup`·`publish`·`production` | commit 메시지와 commit 할 파일 |

먼저 `check` 로 내 컴퓨터에서 빌드와 화면을 확인해요.

```bash
bash deploy.sh check
```

**성공하면 보이는 것:** `Local deploy check passed: web → dist/. Check the screen and behavior separately.` 연결 전에는 첫 줄에 `Deployment method: not selected. Run setup --method git or setup --method api.` 가 나와요. 괜찮아요.

## 5. 2안 — Vercel 방식 (수업 기본)

### 준비

- Vercel 계정이 있으면 돼요. GitHub 는 필요 없어요.
- Vercel 계정 설정의 Tokens 화면(미검증)에서 토큰을 만들어요. 비밀번호처럼 보관해요.
- **새** Vercel 프로젝트 이름을 정해요. 1안으로 연결했던 프로젝트를 다시 쓰지 않아요.
- 이 폴더가 이미 다른 프로젝트와 연결돼 있으면(`.vercel/project.json`) `setup --method api` 는 그 프로젝트를 그대로 써요. 다른 `--project` 이름을 주면 `--project does not match the locally connected Vercel project. …` 로 멈춰요. 이럴 때는 `.vercel/` 을 직접 고치지 말고 강사에게 물어봐요.

### 순서

AI 는 아래 순서로 실행해요. 직접 실행해도 같아요.

```bash
# 1) 처음 한 번 연결 — 새 Vercel 프로젝트를 만들어요
node scripts/deploy.mjs setup --method api --project <새-프로젝트-이름>

# 2) Preview
node scripts/deploy.mjs publish

# 3) Production (학생이 Production 을 고른 뒤에만)
node scripts/deploy.mjs production
```

- 실행할 때마다 `check` 와 같은 검사를 해요. 통과한 결과 파일을 Vercel REST API 로 올리고, 배포를 만든 뒤 **Ready** 를 확인해요. Git·GitHub·Vercel CLI 는 쓰지 않아요.
- `setup` 이 끝나면 `Connected for Vercel REST API uploads: <이름>.` 이 나와요.
- 끝나면 `Vercel Preview deploy Ready: https://…` 또는 `Vercel Production deploy Ready: https://…` 가 나와요.
- Team 계정에 프로젝트를 만들 때만 `VERCEL_TEAM_ID`(`team_` 으로 시작)를 정해요. 개인 계정이면 필요 없어요(미검증).

### 토큰 다루기

토큰은 이 순서로 찾아요.

1. `VERCEL_TOKEN` 환경 변수(개발자용, 저장 파일보다 먼저). 저장하지 않아요.
2. 이 컴퓨터에 저장된 토큰: macOS·Linux `~/.ds-starter/vercel-token`, Windows `%USERPROFILE%\.ds-starter\vercel-token`. 프로젝트 폴더 밖이에요. 폴더 0700, 파일 0600(POSIX), 내용은 토큰 한 줄. 쓰기 전에 Vercel `GET /v2/user` 로 확인하고, 401/403 이면 파일을 지우고 `The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.` 를 출력한 뒤 3번으로 가요.
3. 일회용 브라우저 창. `127.0.0.1` 의 임의 포트에 무작위 비밀 경로(32바이트 이상)로 페이지를 열고 기본 브라우저를 띄워요. 다른 경로는 404, 토큰은 POST 본문으로만 받아요(주소·쿼리 금지). 페이지 제목은 "Paste your Vercel token" 이에요.
   - 띄우기 전에 `A browser window opened. Paste your Vercel token there, not in the chat. Waiting…`
   - 브라우저를 못 열면 `The browser did not open by itself. Open this address in your browser: http://127.0.0.1:<port>/<긴 무작위 코드>` (그 컴퓨터에서 한 번만 돼요).
   - 받은 토큰을 Vercel `GET /v2/user` 로 확인해요. 틀리면 같은 창에 "This token does not work. Make a new one in Vercel and paste it again.", 맞으면 저장 → "Saved. Go back to VS Code." → 서버를 닫아요. 출력: `Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. To remove it, ask the AI: "Forget my Vercel token".`
   - 최대 8분(남은 시간이 짧으면 더 짧게) 기다려요. 지나면 `No token was entered. Ask the AI to deploy again.`
   - 사람이 TTY 에서 실행해도 같은 브라우저 창을 써요. 터미널 숨김 입력은 없어요.

- 토큰 만들기: Vercel → Account Settings → Tokens → Create. Expiration 은 수업이 끝나는 날쯤으로 정해요.
- 명령 옵션으로는 토큰을 받지 않아요. 출력·로그·오류·`.vercel/deploy.json` 어디에도 토큰을 쓰지 않아요. Vercel 이 돌려준 오류에 토큰이 들어 있어도 `[hidden]` 으로 가려요.
- 학생에게는 경로를 말하지 않고 "이 컴퓨터의 프로젝트 밖에 저장돼요"라고만 해요. 공용 컴퓨터에서는 끝날 때 `forget-token` 을 쓰고 Vercel 에서도 토큰을 지워요.
- 내 컴퓨터의 프로젝트에 남는 것은 `.vercel/deploy.json`(`version`·`method`·`target`)과 `.vercel/project.json`(`projectId`·`orgId`)뿐이에요. `.vercel/` 은 `.gitignore` 로 Git 에서 빠져요.
- 토큰이 새어 나갔으면(대화창에 붙여 넣었을 때도) Vercel 에서 그 토큰을 지우고 새로 만들어 브라우저 창에만 넣어요.

## 6. 선택: 1안 — GitHub 방식

2안 대신 1안을 고른 사람만 해요.

### 준비 (수업에서 함께)

- GitHub 에 가입해요. 수업 전에는 필요 없어요.
- GitHub 에 **내** 저장소를 만들어요. 스타터를 받은 상태의 `origin` 이 강사 저장소이면 그대로 push 하지 않아요(`This will not push to the instructor's starter repository. …`).
- 내 컴퓨터의 Git 을 GitHub 에 한 번 로그인시켜요. GitHub CLI 가 없으면 설치해요. Mac 은 `brew install gh`, Windows 는 `winget install --id GitHub.cli --exact --source winget` 이에요. 그다음 새 터미널에서 학생이 직접 `gh auth login` → `gh auth setup-git` 을 실행해요. 본인이 준비한 SSH 인증도 돼요. 이 스크립트는 Git 비밀번호나 토큰을 묻거나 저장하지 않아요.
- 스크립트는 git 을 `GIT_TERMINAL_PROMPT=0` 으로 실행해서 로그인 질문에서 멈추지 않아요. push 가 로그인 때문에 실패하면 `GitHub needs you to sign in once. In VS Code, open Terminal → New Terminal and run gh auth login, then gh auth setup-git (troubleshooting J, "GitHub needs you to sign in once"). Then ask the AI to deploy again.` 로 끝나요.
- commit 에 쓸 이름과 이메일을 내가 Git 설정에서 정해요. 설치 스크립트가 다른 사람 이름을 대신 넣지 않아요.
- Vercel 이 내 GitHub 저장소를 쓸 수 있게 허락해요. `setup` 은 Vercel CLI 가 없으면 설치하고, 브라우저에 로그인과 프로젝트 선택 화면을 열 수 있어요(AI 셸에서의 동작은 미검증).

### 순서

```bash
# 1) 처음 한 번 연결
node scripts/deploy.mjs setup --method git --repo https://github.com/<내아이디>/<내저장소>.git --message "first upload" --all

# 2) Preview — 작업 브랜치에서
node scripts/deploy.mjs publish --message "<바꾼 내용>" --all

# 3) Production — 확인한 변경을 Production Branch 로 옮긴 뒤(강사와 함께), 그 브랜치에서
node scripts/deploy.mjs production --message "<바꾼 내용>" --all
```

- `setup` 은 원래 Git 원격을 `upstream` 으로 남기고, 내 저장소를 `origin` 으로 연결해요.
- 이미 다른 `upstream` 이나 다른 저장소와의 Vercel 연결이 있으면 자동으로 덮어쓰지 않아요.
- `setup` 은 바뀐 파일을 commit·push 한 뒤 Vercel 과 저장소를 연결해요. `setup` 자체는 CLI 로 배포하지 않아요. 하지만 저장소를 Vercel 에 처음 연결하면 Vercel 이 첫 배포를 만들 수 있어요.
- `publish` 는 고른 파일만 commit 해요. 지금 작업 브랜치를 force 없이 push 해요. 그다음 같은 commit 의 Vercel **Preview** 가 Ready 인지 확인해요. Production Branch 에서는 실행되지 않아요.
- `production` 은 브랜치를 바꾸지 않아요. 지금 브랜치가 Vercel Production Branch 일 때만 일반 push 를 해요. 그다음 같은 commit 의 **Production** 배포가 Ready 인지 확인해요. 다른 브랜치에서는 실행되지 않아요.
- `--all` 이나 `--file` 을 빼면 바뀐 파일 목록을 보여 주고, 사람이 TTY 에서 실행할 때만 `Commit all the changed files shown above? [y/N]: ` 로 물어요. AI 는 `--message` 와 `--all` 을 붙여 실행해요.
- `--file` 을 써도 다른 소스 변경이 남으면 배포 전에 멈춰요. 올릴 commit 을 확실히 정하기 위해서예요.
- 이런 경우는 모두 막아요: 강사 스타터 저장소로의 push, fetch/push 원격이 다른 경우, GitHub 에 내 컴퓨터에 없는 변경이나 충돌이 있는 경우, force push.

### Vercel Production Branch

`setup` 이 끝나면 `Connected. Current branch: <브랜치>; production branch: <브랜치>. …` 가 나와요. Production Branch 를 바꾸려면 Vercel 의 Settings → Environments → Production → Branch Tracking 에서 골라요. 스크립트가 `main` 등으로 자동으로 바꾸지 않아요.

## 7. 웹사이트 대신 Storybook 올리기

| 항목 | 웹사이트 | Storybook 카탈로그 |
|---|---|---|
| 대상 | 기본 `web` | `--target storybook` |
| Build Command | `pnpm typecheck && pnpm ds:guard && pnpm web:build` | `pnpm typecheck && pnpm ds:guard && pnpm build-storybook` |
| Output Directory | `dist` | `storybook-static` |

`check` 와 `setup` 에 `--target storybook` 을 붙여요. 웹 페이지가 없다는 이유로 Storybook 을 자동으로 올리지 않아요. AI 에게는 "My Storybook" 을 고르거나 `/my-deploy 1 storybook`·`/my-deploy 2 storybook` 을 써요.

```bash
bash deploy.sh check --target storybook
# 1안 — GitHub 방식
bash deploy.sh setup --method git --target storybook --repo https://github.com/<내아이디>/<내저장소>.git
# 2안 — Vercel 방식
bash deploy.sh setup --method api --target storybook --project <새-프로젝트-이름>
```

연결한 뒤에는 `publish`·`production` 이 저장된 대상을 써요. 한 폴더는 대상 하나로 연결돼요. 다른 `--target` 을 붙이면 `This project is set up for <대상>. Run setup --method <방식> --target <대상> first.` 로 멈춰요.

## 8. 배포가 끝났는지 확인하기

- push 나 업로드가 성공했다고 끝이 아니에요. 같은 배포가 Vercel 에서 **Ready** 인지 확인하고 주소를 보여 줘요.
- 이런 것은 성공으로 치지 않아요: 빌드 실패, push 실패, 원격 충돌, 다른 저장소 연결, 확인하지 못한 배포 상태. 약 9분 안에 Ready 를 확인하지 못하면 `Vercel is still working. …` 로 끝나요. Vercel 프로젝트의 Deployments 에서 상태와 로그를 보거나 AI 에게 다시 부탁해요.
- 환경 파일·`.vercel/`·실험용 `var/`·로그·캐시는 올리지 않아요. Git 이 이미 추적하고 있으면 먼저 추적을 해제해야 해요.
- Vercel 은 설치 스크립트·Figma MCP·Qwen Code 같은 AI 도구를 실행하지 않아요. 1안은 Vercel 이 정적 웹 빌드를 해요. 2안은 내 컴퓨터에서 빌드한 파일을 그대로 올려요.
- 배포 주소에서 페이지마다 직접 확인해요: 주소 직접 입력, 새로고침, 글꼴, 아이콘, 클릭, 입력. 실제로 만들지 않은 로그인 서버나 데이터 저장 기능이 있는 것처럼 보이게 하지 않아요.
- 오류 문구별 해결 방법은 [오류 대처 안내서 J](manual/troubleshooting.ko.md)에 있어요.

관련 공식 문서: [Git 배포](https://vercel.com/docs/git), [CLI 배포](https://vercel.com/docs/cli/deploy), [프로젝트 연결](https://vercel.com/docs/cli/link), [REST API 배포](https://vercel.com/docs/rest-api).
