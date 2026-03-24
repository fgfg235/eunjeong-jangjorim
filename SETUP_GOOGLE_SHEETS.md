# Google Sheets 연동 설정 가이드

예약 데이터를 Google Sheets에 자동으로 저장하려면 아래 단계를 따라주세요.

## 1단계: Google Sheets 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. 새 스프레드시트 생성
3. 첫 번째 행에 아래 헤더 입력:
   - A1: `이름`
   - B1: `연락처`
   - C1: `주소`
   - D1: `선택메뉴`
   - E1: `배송희망일`
   - F1: `요청사항`
   - G1: `예약시간`

## 2단계: Google Apps Script 설정

1. 스프레드시트에서 **확장 프로그램** > **Apps Script** 클릭
2. 기존 코드를 모두 지우고 아래 코드 붙여넣기:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.name,
      data.phone,
      data.address,
      data.menu,
      data.deliveryDate,
      data.message,
      data.timestamp
    ]);

    return ContentService.createTextOutput(JSON.stringify({result: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({result: 'error', error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Google Sheets API is running');
}
```

3. **저장** 버튼 클릭 (Ctrl+S)
4. 프로젝트 이름 입력 (예: "은정장조림 예약")

## 3단계: 웹 앱 배포

1. **배포** > **새 배포** 클릭
2. 설정:
   - 유형: **웹 앱** 선택
   - 설명: "은정장조림 예약 시스템"
   - 실행 주체: **나**
   - 액세스 권한: **모든 사용자**
3. **배포** 클릭
4. 권한 승인 (Google 계정 선택 후 "허용")
5. **웹 앱 URL** 복사

## 4단계: 웹사이트에 URL 적용

1. `script.js` 파일 열기
2. 아래 줄을 찾아서:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. 복사한 URL로 교체:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/여러분의URL/exec';
   ```
4. 파일 저장 후 GitHub에 푸시

## 테스트

1. 웹사이트에서 예약 폼 작성 후 제출
2. Google Sheets에서 새 행이 추가되었는지 확인

## 문제 해결

- **CORS 오류**: `mode: 'no-cors'` 설정으로 해결됨
- **권한 오류**: Apps Script 배포 시 "모든 사용자" 액세스 권한 확인
- **데이터 미저장**: 브라우저 개발자 도구(F12) > Console에서 오류 확인

---

Google Sheets URL을 설정하지 않아도 예약 데이터는 브라우저의 localStorage에 저장됩니다.
개발자 도구 콘솔에서 `localStorage.getItem("eunjeong_reservations")`로 확인할 수 있습니다.
