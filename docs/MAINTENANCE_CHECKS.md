# 업데이트 전 검사

설치 사용자의 필수 의존성은 추가하지 않습니다. 아래 Node.js 검사는 관리자가 GitHub 업데이트 전에 실행하는 개발용 검사입니다. 서버나 중앙 MCP가 필요하지 않습니다.

```
node tests/verify-distribution.mjs
node --test tests/text-integrity.test.mjs
node scripts/check-text-integrity.mjs
node scripts/check-text-integrity.mjs --base HEAD
```

마지막 명령은 커밋 전에 직전 커밋과 작업 파일의 숫자·단위·범위 기호를 비교합니다. 이미 커밋했다면 승인된 이전 커밋을 `--base`에 명시합니다. review-needed는 자동 실패가 아니라 사람이 확인할 변경이며 버전 번호와 의도한 숫자 변경도 표시됩니다. 오류는 종료 코드 1입니다. 정상·검토 필요는 종료 코드 0이므로 게시 전에 JSON의 검토 항목도 읽어야 합니다. 파일을 자동 수정하지 않으며 보고에 본문 전체를 출력하지 않습니다.

검사 대상은 저장소의 Markdown·JSON입니다. Git·의존성 디렉터리와 심볼릭 링크를 제외합니다. UTF-8 디코딩 실패, 깨진 문자와 비정상 제어문자, 개인 홈 경로는 오류입니다. 붙은 연도·소수 범위는 검토 대상으로 표시합니다. 파일 삭제·이미지·HWP·PDF 내부 내용, 모든 가능한 인코딩 손상과 숫자 오류까지 검증하지 않습니다. 숫자 변경은 사실 오류라는 뜻이 아니며 새 파일에 비교 원본이 없으면 no-baseline으로 표시합니다. 수치와 기호의 문맥 변경은 사람이 원문과 대조해야 합니다.

## 업무 시험
`tests/workflow-cases.json`은 한국어 요청 8건과 기대 동작·금지 행동을 보관합니다. 자동 단어 점수로 업무 선택 품질을 합격 처리하지 않습니다. 같은 지침 버전·입력·모델·도구 조건을 기록하고 실제 응답을 비교합니다. 문장이 같은지보다 사실·단위·미확인 처리·지정 형식·실제 본문과 거짓 완료 보고 여부를 확인합니다.

0.2.5 준비 시 현재 PC의 Codex CLI에 수정 지침을 입력해 8건을 두 번 시험했고, 다른 사례의 범위가 섞인 응답을 발견했습니다. 과제 간 사실 분리 지침을 추가한 후 재시험에서 해당 현상이 나타나지 않았습니다. 이는 단일 PC의 지침 응답 시험이며 새 PC 설치·HWP/PDF 편집·Drive 연결 시험은 아닙니다. 이번 변경은 시험 사례를 저장소에 보관한 것이며 새 모델 시험을 수행한 것으로 보고하지 않습니다.

## 간단한 결과물 검증 기록

실제 HWP·HWPX·PDF와 수정본의 시험은 [실제 문서 시험](REAL_DOCUMENT_TESTS.md)을 따른다. 실행 전에 원본 기준 정답과 완료 조건을 정하고, 실패 원인에 따라 지침·도구·변경 대조를 보완한다. 시험 기준 추가와 실제 실행 결과를 구분하며, 환경별 실행 가능성은 따로 확인한다.

문서 작성 후 담당자가 확인할 최소 기록입니다. 실제 파일이 없으면 경로와 생성 완료를 꾸미지 않습니다.

| 항목 | 기록 |
| --- | --- |
| 결과물 | 실제 파일 또는 채팅 검토본 |
| 원본 처리 | 원본 양식 편집 / 별도 검토본 / 미편집 |
| 확인한 내용 | 본문·표·수치 등 실제 수행한 검사 |
| 페이지 확인 | 수행 범위 또는 미검증 |
| 남은 사항 | 필요한 증빙·결정·다음 조치 |

근거의 확인일·재확인 조건 관리는 기존 지침을 유지합니다. 자동 날짜 검사와 엑셀 재계산 기능은 이번 범위에 포함하지 않습니다.

## 참고한 공개 구현
- https://github.com/peterbamuhigire/business-plan-skills/blob/main/scripts/check_text_integrity.py
- https://github.com/peterbamuhigire/business-plan-skills/blob/main/scripts/routing_smoke_test.py
- https://github.com/peterbamuhigire/business-plan-skills/blob/main/tools/release-gate/validate_release_bundle.py

검사 개념을 참고해 현재 플러그인의 Node.js 개발용 구성에 맞게 작성했습니다. 외부 저장소 코드나 재무·국가별 기준을 복사해 포함하지 않았습니다.
