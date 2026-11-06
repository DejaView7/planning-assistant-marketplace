# 사업기획 통합 비서

개인끼리 공유하여 설치하는 Windows x64용 Codex 플러그인입니다. 일반 작성 지침과 읽기 전용 MCP, Node.js 실행 파일을 포함합니다.

## 설치
공개 저장소이므로 별도의 저장소 초대 없이 설치할 수 있습니다.

### 대화창에서 설치 요청하기

Codex 대화창에 아래 문구를 입력합니다.

> https://github.com/DejaView7/planning-assistant-marketplace.git 저장소를 마켓플레이스로 추가하고 planning-assistant@planning-assistant-share 플러그인을 설치해 주세요.

설치 작업에 필요한 실행 승인이 표시되면 확인합니다. 다른 AI 서비스의 일반 대화창에서 자동 설치되는 기능은 아닙니다.

### 터미널에서 직접 설치하기

Codex가 설치된 PC의 PowerShell 등 터미널에서 다음 두 명령을 순서대로 실행합니다. 아래 코드는 대화 입력용 문구가 아닙니다.

```powershell
codex plugin marketplace add https://github.com/DejaView7/planning-assistant-marketplace.git
codex plugin add planning-assistant@planning-assistant-share
```

설치가 완료되면 Codex 앱을 완전히 종료하고 다시 실행합니다. 다음 문장으로 조회를 확인합니다.

> 사업기획 통합 비서의 지침 목록을 조회해 주세요.

받는 분은 Node.js나 npm을 별도로 설치할 필요가 없습니다. Codex의 로컬 플러그인·MCP 기능과 Git 저장소 다운로드를 지원하는 환경이 필요합니다. 공개 저장소를 다운로드하기 위한 별도 초대나 GitHub 로그인은 필요하지 않습니다. Mac·Linux용 배포본은 별도로 준비해야 합니다.

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

