const BOOTH_DATA = {
  japan: {
    code: 'JR',
    name: '일본',
    title: '일본 가챠 퀴즈',
    briefing: '요원, 두 개의 가챠통에서 문제를 하나씩 뽑아라. 첫 번째 일본 문화 OX 문제를 판단하고, 두 번째 히라가나 문제는 표를 참고해 숨은 단어를 해독하라.',
    finalObjective: 'OX 정답과 히라가나 단어를 모두 확정한 뒤 진행자에게 최종 확인을 받아라.',
    password: '1111'
  },
  france: {
    code: 'FR',
    name: '프랑스',
    title: 'Bonjour, 바게투호',
    briefing: '요원, 바게트를 투호 막대처럼 사용해 지정선에서 바구니를 겨냥하라. 자네에게 주어진 기회는 모두 일곱 번이다.',
    finalObjective: '일곱 번 중 네 번 이상 바구니에 넣어 프랑스 본부의 성공 신호를 확보하라.',
    password: '1111'
  },
  egypt: {
    code: 'EG',
    name: '이집트',
    title: '모래 속 상형문자 발굴 작전',
    briefing: '요원, 미션카드에 적힌 단어를 확인하라. 모래 속에서 필요한 상형문자 카드를 핀셋으로 발굴하고 해독표를 이용해 원래의 소리로 복원해야 한다.',
    finalObjective: '발굴한 카드를 보드판의 순서에 맞게 배열하고 완성된 구호를 외쳐 최종 해독을 증명하라.',
    password: '1111'
  },
  mexico: {
    code: 'MX',
    name: '멕시코',
    title: '죽은 자들의 암호',
    briefing: '요원, 빛을 비춰 히든 잉크 편지를 읽어라. 편지의 네 가지 키워드와 제단의 촛불, 기타, 해골, 마리골드를 연결하면 숨겨진 숫자를 찾을 수 있다.',
    finalObjective: '네 숫자를 편지에 적힌 순서대로 조합해 최종 암호를 만들고 현장의 자물쇠를 해제하라.',
    password: '1111'
  }
};

let currentTargetBooth = null;

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

  const isComplete = completedCount === Object.keys(BOOTH_DATA).length;
  const completionPanel = document.getElementById('completion-panel');
  const issueButton = document.getElementById('issue-card-btn');
  const completionMessage = document.getElementById('completion-message');
  const lockIcon = document.getElementById('completion-lock-icon');
  const barActionButton = document.getElementById('bar-action-btn');

  completionPanel.classList.toggle('unlocked', isComplete);
  issueButton.disabled = !isComplete;
  issueButton.textContent = isComplete ? '활동 인증 카드 발급' : `발급 조건 ${completedCount}/4`;
  completionMessage.textContent = isComplete
    ? '모든 국제 미션을 완수했습니다. 요원 활동 인증 카드를 발급하세요.'
    : `스탬프 ${4 - completedCount}개를 더 모으면 활동 인증 카드를 발급할 수 있습니다.`;
  lockIcon.textContent = isComplete ? '🏅' : '🔒';

  if (isComplete) {
    barActionButton.textContent = '🏅 인증 카드';
    barActionButton.onclick = issueCompletionCard;
  } else {
    barActionButton.textContent = '⚡ 빠른 지령';
    barActionButton.onclick = () => openMissionBriefing('egypt');
  }
}

function allMissionsCompleted() {
  return Object.keys(BOOTH_DATA).every((id) => localStorage.getItem(`stamp_${id}`) === 'true');
}

function getOrCreateAgentId() {
  let agentId = localStorage.getItem('agent_id');
  if (agentId) return agentId;

  let randomValue = Math.floor(Math.random() * 1000000);
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    randomValue = values[0] % 1000000;
  }
  agentId = `WIB-2026-${String(randomValue).padStart(6, '0')}`;
  localStorage.setItem('agent_id', agentId);
  return agentId;
}

function issueCompletionCard() {
  if (!allMissionsCompleted()) {
    alert('4개국 스탬프를 모두 획득한 뒤 발급할 수 있습니다.');
    return;
  }

  const agentName = localStorage.getItem('agent_name') || 'AGENT_X';
  let issuedDate = localStorage.getItem('certificate_issued_date');
  if (!issuedDate) {
    issuedDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    });
    localStorage.setItem('certificate_issued_date', issuedDate);
  }

  document.getElementById('certificate-agent-name').textContent = agentName;
  document.getElementById('certificate-agent-id').textContent = getOrCreateAgentId();
  document.getElementById('certificate-date').textContent = issuedDate;
  const certificateModal = document.getElementById('certificate-modal');
  const hasSeenReveal = localStorage.getItem('certificate_reveal_seen') === 'true';

  certificateModal.classList.remove('hidden', 'reveal-full', 'reveal-quick');
  void certificateModal.offsetWidth;
  certificateModal.classList.add(hasSeenReveal ? 'reveal-quick' : 'reveal-full');
  document.body.classList.add('certificate-open');

  if (!hasSeenReveal) {
    localStorage.setItem('certificate_reveal_seen', 'true');
  }
}

function closeCompletionCard() {
  const certificateModal = document.getElementById('certificate-modal');
  certificateModal.classList.add('hidden');
  certificateModal.classList.remove('reveal-full', 'reveal-quick');
  document.body.classList.remove('certificate-open');
}

function drawRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawCenteredLines(context, text, centerX, startY, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);

  lines.forEach((lineText, index) => {
    context.fillText(lineText, centerX, startY + (index * lineHeight));
  });
}

function loadCertificateLogo() {
  return new Promise((resolve) => {
    const logo = new Image();
    logo.onload = () => resolve(logo);
    logo.onerror = () => resolve(null);
    logo.src = 'logo.png';
  });
}

async function downloadCompletionCard() {
  if (!allMissionsCompleted()) {
    alert('4개국 스탬프를 모두 획득한 뒤 다운로드할 수 있습니다.');
    return;
  }

  const agentName = document.getElementById('certificate-agent-name').textContent;
  const agentId = document.getElementById('certificate-agent-id').textContent;
  const issuedDate = document.getElementById('certificate-date').textContent;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 750;
  const context = canvas.getContext('2d');
  const logo = await loadCertificateLogo();

  context.fillStyle = '#fbf7ea';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = '#c9b97f';
  context.lineWidth = 4;
  context.strokeRect(22, 22, 1156, 706);
  context.strokeStyle = '#d9cda5';
  context.lineWidth = 2;
  context.strokeRect(40, 40, 1120, 670);

  if (logo) {
    context.drawImage(logo, 535, 55, 130, 130);
  } else {
    context.beginPath();
    context.arc(600, 120, 52, 0, Math.PI * 2);
    context.strokeStyle = '#315a45';
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = '#315a45';
    context.font = '700 20px sans-serif';
    context.textAlign = 'center';
    context.fillText('SYNODIA', 600, 127);
  }

  context.textAlign = 'center';
  context.fillStyle = '#314c5f';
  context.font = '700 17px sans-serif';
  context.fillText('시노디아 세계 문화 체험 축제', 600, 205);

  context.fillStyle = '#173752';
  context.font = '700 42px Georgia, serif';
  context.fillText('세계 문화 체험 활동 인증', 600, 266);
  context.fillStyle = '#80785f';
  context.font = '400 15px Georgia, serif';
  context.fillText('CERTIFICATE OF PARTICIPATION', 600, 296);

  context.fillStyle = '#7a837d';
  context.font = '700 14px sans-serif';
  context.fillText('참가자', 600, 340);
  context.fillStyle = '#101d28';
  context.font = '700 43px sans-serif';
  context.fillText(agentName, 600, 390);
  context.strokeStyle = '#8e9b8b';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(420, 404);
  context.lineTo(780, 404);
  context.stroke();

  context.fillStyle = '#59636a';
  context.font = '400 20px sans-serif';
  drawCenteredLines(
    context,
    '위 학생은 일본·프랑스·이집트·멕시코의 문화 체험 활동을 성실히 완료하였기에 이 카드를 발급합니다.',
    600,
    444,
    760,
    29
  );

  const stampData = [
    '✓ 일본',
    '✓ 프랑스',
    '✓ 이집트',
    '✓ 멕시코'
  ];
  const stampPositions = [235, 480, 725, 970];
  stampData.forEach((label, index) => {
    const x = stampPositions[index] - 95;
    context.fillStyle = '#eff3e9';
    drawRoundedRect(context, x, 505, 190, 54, 8);
    context.fill();
    context.fillStyle = '#315a45';
    context.font = '700 20px sans-serif';
    context.fillText(label, stampPositions[index], 539);
  });

  context.textAlign = 'left';
  context.fillStyle = '#8a826d';
  context.font = '700 13px sans-serif';
  context.fillText('발급일', 100, 625);
  context.fillText('인증번호', 560, 625);
  context.fillStyle = '#4d554f';
  context.font = '700 18px monospace';
  context.fillText(issuedDate, 100, 654);
  context.fillText(agentId, 560, 654);

  context.save();
  context.translate(1055, 628);
  context.rotate(-8 * Math.PI / 180);
  context.beginPath();
  context.arc(0, 0, 48, 0, Math.PI * 2);
  context.strokeStyle = 'rgba(163, 55, 55, 0.78)';
  context.lineWidth = 4;
  context.stroke();
  context.fillStyle = 'rgba(163, 55, 55, 0.82)';
  context.textAlign = 'center';
  context.font = '700 17px sans-serif';
  context.fillText('활동', 0, -2);
  context.fillText('인증', 0, 20);
  context.restore();

  canvas.toBlob((blob) => {
    if (!blob) {
      alert('JPG 파일 생성에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    const safeName = agentName.replace(/[\\/:*?"<>|]/g, '_');
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `시노디아_활동인증카드_${safeName}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }, 'image/jpeg', 0.94);
}

function openMissionBriefing(boothId) {
  const booth = BOOTH_DATA[boothId];
  if (!booth) return;

  currentTargetBooth = boothId;
  document.getElementById('mission-country-code').textContent = `MISSION · ${booth.code}`;
  document.getElementById('mission-briefing-title').textContent = `${booth.name} · ${booth.title}`;
  document.getElementById('mission-briefing-text').textContent = booth.briefing;
  document.getElementById('mission-final-objective').textContent = booth.finalObjective;
  document.getElementById('mission-unlock-btn').textContent = localStorage.getItem(`stamp_${boothId}`) === 'true'
    ? '인증 완료 · 기록 다시 보기'
    : '해독 완료 · 잠금 해제';
  document.getElementById('mission-modal').classList.remove('hidden');
}

function closeMissionBriefing() {
  document.getElementById('mission-modal').classList.add('hidden');
}

function unlockMission() {
  if (!currentTargetBooth) return;
  const boothId = currentTargetBooth;
  const boothName = BOOTH_DATA[boothId].name;
  closeMissionBriefing();
  openAuthModal(boothId, boothName);
}

function openAuthModal(boothId, title) {
  currentTargetBooth = boothId;
  document.getElementById('modal-title').textContent = `${title} 인증`;
  document.getElementById('auth-modal').classList.remove('hidden');
  const passwordInput = document.getElementById('pw-input');
  passwordInput.value = '';
  requestAnimationFrame(() => passwordInput.focus());
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function verifyPassword(event) {
  if (event) event.preventDefault();
  const inputPassword = document.getElementById('pw-input').value;
  if (currentTargetBooth && inputPassword === BOOTH_DATA[currentTargetBooth].password) {
    completeStamp(currentTargetBooth);
  } else {
    alert('비밀번호가 올바르지 않습니다!');
    const passwordInput = document.getElementById('pw-input');
    passwordInput.value = '';
    passwordInput.focus();
  }
}

function completeStamp(boothId) {
  const wasAllComplete = allMissionsCompleted();
  localStorage.setItem(`stamp_${boothId}`, 'true');
  loadStamps();
  closeAuthModal();
  if (!wasAllComplete && allMissionsCompleted()) {
    alert('4개국 미션 완료! 활동 인증 카드가 잠금 해제되었습니다.');
  } else {
    alert(`${BOOTH_DATA[boothId].name} 스탬프 획득 완료!`);
  }
}

function resetStamps() {
  if (confirm('모든 요원 데이터와 스탬프를 초기화하시겠습니까?')) {
    localStorage.clear();
    location.reload();
  }
}
