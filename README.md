# 사업기획 통합 비서

개인끼리 공유하여 설치하는 Windows x64용 Codex 플러그인입니다. 일반 작성 지침과 읽기 전용 MCP, Node.js 실행 파일을 포함합니다.

## 처음 설치하나요? 그림을 따라 해 보세요

**Windows 64비트용입니다.** Codex 앱에 로그인한 상태에서 시작하세요. Mac·Linux용은 아닙니다.

- **Node.js와 npm은 따로 설치하지 않아도 됩니다.** 필요한 실행 파일이 들어 있습니다.
- 공개 저장소라서 초대나 GitHub 로그인 없이 다운로드할 수 있습니다.
- 아래 그림은 이해를 돕는 **설명용 그림**입니다. 실제 앱의 버튼 이름과 위치는 다를 수 있습니다.

### 1. Codex를 열어요

![1단계: Codex 앱을 열고 대화를 시작합니다.](docs/images/install-01-open.png)

Codex 앱을 실행하고, 로그인한 뒤 대화를 시작하세요.

### 2. 아래 문구를 복사해서 보내요

![2단계: 설치 요청 문구를 대화창에 붙여넣고 보냅니다.](docs/images/install-02-request.png)

**아래 상자의 문구 전체를 복사 → Codex 대화 입력칸에 붙여넣기 → 보내기** 순서입니다.

```text
https://github.com/DejaView7/planning-assistant-marketplace.git
이 저장소를 마켓플레이스로 추가하고 planning-assistant@planning-assistant-share 플러그인을 설치해 주세요.
```

브라우저 주소창이나 GitHub 댓글에 넣는 문구가 아닙니다. **Codex와 대화하는 입력칸**에 넣으세요.

### 3. 설치 완료 안내를 기다려요

![3단계: 설치 관련 실행 요청을 확인하고 완료될 때까지 기다립니다.](docs/images/install-03-approve.png)

Codex가 설치 작업을 진행합니다. 실행을 허용할지 묻는 창이 나오면 **이번 플러그인 설치에 관한 요청인지 확인한 뒤** 승인하세요. 확인 창이 없으면 그대로 기다리면 됩니다.

### 4. Codex를 다시 열고 확인해요

![4단계: Codex를 다시 실행하고 지침 목록을 요청합니다.](docs/images/install-04-check.png)

설치가 끝나면 **Codex를 완전히 종료했다가 다시 실행**하세요. 그다음 대화창에 아래 문장을 보내세요.

```text
사업기획 통합 비서의 지침 목록을 조회해 주세요.
```

스킬이나 페르소나 목록이 조회되면 설치 확인이 끝난 것입니다. 실제 문서 작성도 같은 대화에서 요청할 수 있습니다.

### 막히면 이렇게 요청하세요

| 이런 상황이면 | Codex에 이렇게 말해 보세요 |
|---|---|
| Git을 찾을 수 없다고 나와요 | “이 컴퓨터에서 Git을 사용할 수 있는지 확인하고 설치 방법을 안내해 주세요.” |
| 플러그인을 찾을 수 없대요 | “planning-assistant-share 마켓플레이스와 planning-assistant 플러그인의 등록·설치 상태를 확인해 주세요.” |
| 설치했는데 지침이 안 보여요 | Codex를 완전히 종료했다가 다시 열고 지침 목록을 다시 요청하세요. |
| 다시 실행해도 안 돼요 | “사업기획 통합 비서의 MCP 연결 오류를 확인해 주세요.” |

<details>
<summary>터미널을 사용할 줄 안다면: 명령어로 직접 설치하기</summary>

아래 두 줄은 **PowerShell 등 터미널**에서 순서대로 실행하는 명령어입니다.

```powershell
codex plugin marketplace add https://github.com/DejaView7/planning-assistant-marketplace.git
codex plugin add planning-assistant@planning-assistant-share
```

설치 후 Codex를 완전히 종료했다가 다시 실행하세요. Codex의 로컬 플러그인·MCP 기능과 Git 저장소 다운로드를 지원하는 환경이 필요합니다.

</details>

## 사용
- 사업 아이디어를 구체화하고 기획서 초안을 작성해 주세요.
- 이 요청서를 분석하고 제안서 초안을 작성해 주세요.
- 이 초안의 가격·수익모델·실행계획을 검토하고 수정해 주세요.

전문 기능 7종, 전문가 관점 29종, 원본 프롬프트·스텝백·협업 기법 등 지침 62개가 포함됩니다. 전문가 관점은 AI 역할 지침이며 별도 전문가들이 실행되는 것은 아닙니다. 문서 생성·웹 조사는 사용하는 AI 앱에서 지원해야 합니다.

## 자료 취급
배포본에는 회사 정보·실적·계약·문헌·개인 문서·대화 기록을 포함하지 않습니다. MCP는 분류와 자료 ID로 일반 지침만 조회하며 회사 문서 입력·업로드·저장 기능이 없습니다. 사용자가 AI 대화에 제공한 자료는 해당 AI 서비스에서 처리됩니다.

## 업데이트
관리자가 저장소를 갱신한 뒤 사용자는 마켓플레이스 업데이트를 실행하고 앱에서 설치 상태를 확인합니다. 지원되는 명령은 다음과 같습니다.

```powershell
codex plugin marketplace upgrade planning-assistant-share
```

## 라이선스
직접 작성한 코드·통합 지침은 MIT입니다. Node.js와 사용자 제공 원본 자료의 구분은 THIRD_PARTY_NOTICES.md를 확인하세요.

버전: 0.1.0 / Windows x64

