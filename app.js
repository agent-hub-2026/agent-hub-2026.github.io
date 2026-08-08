const BOOTH_DATA = {
  japan: { name: '일본', password: '1111', qrCode: 'STAMP_JAPAN' },
  france: { name: '프랑스', password: '2222', qrCode: 'STAMP_FRANCE' },
  egypt: { name: '이집트', password: '1004', qrCode: 'STAMP_EGYPT' },
  mexico: { name: '멕시코', password: '4444', qrCode: 'STAMP_MEXICO' }
};

let currentTargetBooth = null;
let html5QrCode = null;

const briefingSteps = [
  '반갑다, 신입 요원. 거대 암호 조직이 세계 곳곳에 비밀 지령을 숨겨두었다는 제보가 들어왔다.',
  '자네의 임무는 일본, 프랑스, 이집트, 멕시코 4개국 문화 속에 숨겨진 암호를 해독하고 스탬프를 모으는 것이다.',
  '준비가 되었다면 먼저 자네를 본부에 등록할 코드네임(이름)을 아래 박스에 입력하도록!'
];
let currentStep = 0;

function showBriefingStep() {
  document.getElementById('briefing-text').textContent = briefingSteps[currentStep];
  const nextButton = document.getElementById('next-briefing-btn');
  const skipButton = document.getElementById('skip-btn');

  if (currentStep < briefingSteps.length - 1) {
    nextButton.classList.remove('hidden');
    skipButton.classList.remove('hidden');
  } else {
    nextButton.classList.add('hidden');
    skipButton.classList.add('hidden');
    document.getElementById('registration').classList.remove('hidden');
  }
}

function nextBriefing() {
  if (currentStep < briefingSteps.length - 1) {
    currentStep++;
    showBriefingStep();
  }
}

function skipToRegistration() {
  currentStep = briefingSteps.length - 1;
  showBriefingStep();
}

window.onload = () => {
  const savedName = localStorage.getItem('agent_name');
  if (savedName) {
    showMainScreen(savedName);
  } else {
    showBriefingStep();
  }
};

function registerAgent() {
  const name = document.getElementById('agent-name').value.trim();
  if (!name) {
    alert('코드네임을 입력하십시오!');
    return;
  }
  localStorage.setItem('agent_name', name);
  showMainScreen(name);
}

function showMainScreen(name) {
  document.getElementById('display-name').textContent = name;
  document.getElementById('bar-display-name').textContent = name;
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  document.getElementById('sticky-status-bar').classList.remove('hidden');
  loadStamps();
}

function loadStamps() {
  let completedCount = 0;
  Object.keys(BOOTH_DATA).forEach((id) => {
    const isCompleted = localStorage.getItem(`stamp_${id}`) === 'true';
    const element = document.getElementById(`stamp-${id}`);
    if (element) {
      element.classList.toggle('completed', isCompleted);
      element.querySelector('.badge').textContent = isCompleted ? '완료' : '미완료';
      if (isCompleted) completedCount++;
    }
  });
  document.getElementById('bar-stamp-count').textContent = `${completedCount}/4`;
}

function openAuthModal(boothId, title) {
  currentTargetBooth = boothId;
  document.getElementById('modal-title').textContent = `${title} 인증`;
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('pw-input').value = '';
  switchTab('qr');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  stopQrScanner();
}

function switchTab(type) {
  const tabQr = document.getElementById('tab-qr');
  const tabPw = document.getElementById('tab-pw');
  const secQr = document.getElementById('sec-qr');
  const secPw = document.getElementById('sec-pw');

  if (type === 'qr') {
    tabQr.classList.add('active');
    tabPw.classList.remove('active');
    secQr.classList.remove('hidden');
    secPw.classList.add('hidden');
    startQrScanner();
  } else {
    tabPw.classList.add('active');
    tabQr.classList.remove('active');
    secPw.classList.remove('hidden');
    secQr.classList.add('hidden');
    stopQrScanner();
  }
}

function startQrScanner() {
  if (typeof Html5Qrcode === 'undefined') {
    alert('QR 스캐너를 불러오지 못했습니다. 비밀번호로 인증해 주세요.');
    switchTab('pw');
    return;
  }

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode('qr-reader');
  }
  if (html5QrCode.isScanning) return;

  const config = { fps: 10, qrbox: { width: 180, height: 180 } };
  html5QrCode.start(
    { facingMode: 'environment' },
    config,
    (decodedText) => {
      if (decodedText === BOOTH_DATA[currentTargetBooth].qrCode) {
        completeStamp(currentTargetBooth);
      } else {
        alert('올바른 부스 QR 코드가 아닙니다!');
      }
    },
    () => {}
  ).catch((error) => console.error(error));
}

function stopQrScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop()
      .then(() => html5QrCode.clear())
      .catch((error) => console.error(error));
  }
}

function verifyPassword() {
  const inputPassword = document.getElementById('pw-input').value;
  if (currentTargetBooth && inputPassword === BOOTH_DATA[currentTargetBooth].password) {
    completeStamp(currentTargetBooth);
  } else {
    alert('비밀번호가 올바르지 않습니다!');
    document.getElementById('pw-input').value = '';
  }
}

function completeStamp(boothId) {
  localStorage.setItem(`stamp_${boothId}`, 'true');
  loadStamps();
  alert(`${BOOTH_DATA[boothId].name} 스탬프 획득 완료!`);
  closeAuthModal();
}

function resetStamps() {
  if (confirm('모든 요원 데이터와 스탬프를 초기화하시겠습니까?')) {
    localStorage.clear();
    location.reload();
  }
}
