// 네비게이션 메뉴 토글
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 메뉴 클릭 시 닫기
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// 네비게이션 스크롤 효과
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// 배송일 최소값 설정 (오늘 이후)
const deliveryDateInput = document.getElementById('deliveryDate');
const today = new Date();
today.setDate(today.getDate() + 1); // 최소 내일부터
const minDate = today.toISOString().split('T')[0];
deliveryDateInput.setAttribute('min', minDate);

// 모달 관련 함수
function showModal() {
    document.getElementById('successModal').classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// 모달 외부 클릭 시 닫기
document.getElementById('successModal').addEventListener('click', (e) => {
    if (e.target.id === 'successModal') {
        closeModal();
    }
});

// Google Sheets 연동 URL (사용자가 설정해야 함)
// 아래 URL을 Google Apps Script 웹 앱 URL로 교체하세요
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSlH31-ScmpV5a3WEdsVR1_TPKS11iqeCshwNy-RItA63r0d-ZQOcQ8Quj9xeux15apw/exec';

// 폼 제출 처리
document.getElementById('reservationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitButton = form.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoading = submitButton.querySelector('.button-loading');

    // 메뉴 선택 확인
    const selectedMenus = form.querySelectorAll('input[name="menu"]:checked');
    if (selectedMenus.length === 0) {
        alert('최소 하나의 반찬을 선택해주세요.');
        return;
    }

    // 로딩 상태
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline';

    // 폼 데이터 수집
    const formData = {
        name: form.name.value,
        phone: form.phone.value,
        address: form.address.value,
        menu: Array.from(selectedMenus).map(cb => cb.value).join(', '),
        deliveryDate: form.deliveryDate.value,
        message: form.message.value,
        timestamp: new Date().toLocaleString('ko-KR')
    };

    try {
        // Google Sheets로 데이터 전송
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Google Sheets URL이 설정되지 않은 경우 로컬 저장 (테스트용)
            saveToLocalStorage(formData);
        }

        // 성공 처리
        showModal();
        form.reset();

        // 배송일 최소값 다시 설정
        deliveryDateInput.setAttribute('min', minDate);

    } catch (error) {
        console.error('Error:', error);
        // 오류 발생 시에도 로컬에 저장
        saveToLocalStorage(formData);
        showModal();
        form.reset();
    } finally {
        // 로딩 상태 해제
        submitButton.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';
    }
});

// 로컬 스토리지 저장 (백업용)
function saveToLocalStorage(data) {
    const reservations = JSON.parse(localStorage.getItem('eunjeong_reservations') || '[]');
    reservations.push(data);
    localStorage.setItem('eunjeong_reservations', JSON.stringify(reservations));
    console.log('예약이 로컬에 저장되었습니다:', data);
}

// 스크롤 애니메이션 (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 애니메이션 적용할 요소들
document.querySelectorAll('.about-card, .product-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// 콘솔에 로컬 저장된 예약 확인 방법 안내
console.log('📋 로컬에 저장된 예약을 확인하려면: localStorage.getItem("eunjeong_reservations")');

// 예약 목록 불러오기
async function loadReservations() {
    const tbody = document.getElementById('reservationsBody');

    // 로딩 표시
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="loading-cell">
                <span class="loading-spinner"></span>
                예약 목록을 불러오는 중...
            </td>
        </tr>
    `;

    try {
        // 캐시 방지를 위해 타임스탬프 추가
        const url = GOOGLE_SCRIPT_URL + '?t=' + Date.now();
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            cache: 'no-store'
        });
        const text = await response.text();
        console.log('서버 응답:', text.substring(0, 100));
        let data;
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error('응답 내용:', text);
            throw new Error('JSON 파싱 실패');
        }

        if (data && data.length > 0) {
            tbody.innerHTML = data.map(row => `
                <tr>
                    <td>${escapeHtml(row.name || '')}</td>
                    <td>${escapeHtml(row.phone || '')}</td>
                    <td>${escapeHtml(row.address || '')}</td>
                    <td>${escapeHtml(row.menu || '')}</td>
                    <td>${formatDate(row.deliveryDate)}</td>
                    <td>${escapeHtml(row.message || '-')}</td>
                    <td>${escapeHtml(row.timestamp || '')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data-cell">
                        아직 예약이 없습니다.
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('예약 목록 불러오기 실패:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data-cell">
                    예약 목록을 불러올 수 없습니다.<br>
                    <small style="color: #999;">Google Apps Script 설정을 확인해주세요.</small>
                </td>
            </tr>
        `;
    }
}

// HTML 이스케이프 함수 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 날짜 포맷 함수 (날짜만 표시)
function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return escapeHtml(dateStr);
    }
}

// 새로고침 버튼 이벤트
document.getElementById('refreshBtn').addEventListener('click', loadReservations);

// 페이지 로드 시 예약 목록 불러오기
document.addEventListener('DOMContentLoaded', loadReservations);
