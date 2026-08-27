const BOOTH_DATA = {
  japan: {
    code: 'JP',
    name: '일본',
    title: '일본 가챠 퀴즈',
    briefing: '일본에서 용의자를 추적하던 중, 두 개의 가챠 캡슐 속에 암호가 나뉘어 숨겨졌다는 정보를 입수했다. 일본 문화 OX 문제와 히라가나 단어 해독을 완수해 두 암호를 모두 회수해야 한다.',
    finalObjective: '두 문제의 답을 진행자에게 확인받고 일본 문화와 단어의 의미까지 확인하면 일본 미션 완료다.',
    password: '81'
  },
  france: {
    code: 'FR',
    name: '프랑스',
    title: 'Bonjour, 바게투호',
    briefing: '진행자의 시범과 규칙 설명을 확인한 뒤 지정선에 서라. 타이머가 시작되면 20초 동안 바게트를 투호 막대처럼 던져 바구니를 겨냥하라.',
    finalObjective: '제한 시간 20초 안에 바게트를 바구니에 3번 이상 넣어 프랑스 미션의 성공 신호를 확보하라.',
    password: '33'
  },
  egypt: {
    code: 'EG',
    name: '이집트',
    title: '모래 속 상형문자 발굴 작전',
    briefing: '2~3글자 단어가 적힌 미션카드 중 1개를 뽑아라. 핀셋으로 모래 속 상형문자 카드를 발굴한 뒤, 해독표를 참고해 미션 단어에 필요한 카드를 찾아내라.',
    finalObjective: '발굴한 상형문자 카드를 보드판의 번호 순서대로 배열하고 완성된 구호를 외쳐 최종 해독을 증명하라.',
    password: '20'
  },
  mexico: {
    code: 'MX',
    name: '멕시코',
    title: '죽은 자들의 암호',
    briefing: 'UV 불빛을 비춰 히든 잉크 편지를 읽고 네 가지 키워드를 찾아라. 각 키워드를 제단의 촛불, 기타, 해골, 마리골드와 연결한 뒤 소품에 숨겨진 숫자를 확인하라.',
    finalObjective: '찾은 네 숫자를 편지에 적힌 키워드 순서대로 조합해 최종 암호를 만들고 출구의 다이얼 자물쇠를 해제하라.',
    password: '52'
  }
};

const BOOTH_ORDER = ['japan', 'france', 'egypt', 'mexico'];
const ADMIN_ACCESS_NAME = '시노디아관리자';
const ADMIN_ACCESS_PASSWORD = '13';
let currentTargetBooth = null;
let adminIssuanceMode = false;

const briefingSteps = [
  '긴급 상황이다. 오늘 새벽 UN 국제문화정보망에서 1급 기밀 문서가 탈취되었다. 추적 결과, 용의자는 문서를 네 조각으로 나누어 각국의 문화 정보 속에 암호화했다.',
  '자네는 기밀 회수 작전에 투입될 국제 첩보원이다. 일본에서 문화 OX와 히라가나 암호를 풀고, 프랑스에서는 20초 안에 바게트 투호를 세 번 이상 성공시켜라.',
  '이어서 이집트의 모래 속에서 상형문자를 발굴해 구호를 복원하고, 멕시코의 비밀 편지와 제단에서 네 자리 탈출 암호를 찾아라. 현장 접근 순서는 반드시 일본, 프랑스, 이집트, 멕시코다.',
  '각 임무를 완수하면 현장 진행자가 2자리 인증 암호를 전달한다. 활동 인증 카드에 암호를 입력해 네 국가의 스탬프를 모두 확보해야 최종 카드가 해제된다.',
  '발급된 활동 인증 카드는 마지막 제작 구역인 파이널 키 랩스의 출입 증명이다. 아래에 작전 중 사용할 이름이나 별명을 등록하고 국제 첩보 작전을 개시하라.'
];
let currentStep = 0;

function showBriefingStep() {
  document.getElementById('briefing-text').textContent = briefingSteps[currentStep];
  const nextButton = document.getElementById('next-briefing-btn');

  if (currentStep < briefingSteps.length - 1) {
    nextButton.classList.remove('hidden');
  } else {
    nextButton.classList.add('hidden');
    document.getElementById('registration').classList.remove('hidden');
  }
}

function nextBriefing() {
  if (currentStep < briefingSteps.length - 1) {
    currentStep++;
    showBriefingStep();
  }
}

window.onload = () => {
  if (localStorage.getItem('admin_device_mode') === 'true') {
    showBriefingStep();
    openAdminAccess();
    return;
  }
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
  if (name === ADMIN_ACCESS_NAME) {
    localStorage.setItem('admin_device_mode', 'true');
    openAdminAccess();
    return;
  }
  localStorage.setItem('agent_name', name);
  showMainScreen(name);
}

function openAdminAccess() {
  adminIssuanceMode = false;
  document.getElementById('admin-auth-panel').classList.remove('hidden');
  document.getElementById('admin-issue-panel').classList.add('hidden');
  document.getElementById('admin-modal').classList.remove('hidden');
  const passwordInput = document.getElementById('admin-password');
  passwordInput.value = '';
  requestAnimationFrame(() => passwordInput.focus());
}

function verifyAdminPassword(event) {
  if (event) event.preventDefault();
  const passwordInput = document.getElementById('admin-password');
  if (passwordInput.value !== ADMIN_ACCESS_PASSWORD) {
    alert('관리자 비밀번호가 올바르지 않습니다.');
    passwordInput.value = '';
    passwordInput.focus();
    return;
  }

  adminIssuanceMode = true;
  document.getElementById('admin-auth-panel').classList.add('hidden');
  document.getElementById('admin-issue-panel').classList.remove('hidden');
  const participantInput = document.getElementById('admin-participant-name');
  participantInput.value = '';
  requestAnimationFrame(() => participantInput.focus());
}

function issueAdminCertificate(event) {
  if (event) event.preventDefault();
  if (!adminIssuanceMode) {
    openAdminAccess();
    return;
  }

  const participantInput = document.getElementById('admin-participant-name');
  const participantName = participantInput.value.trim();
  if (!participantName) {
    alert('인증 카드를 발급할 참가자 이름을 입력하세요.');
    participantInput.focus();
    return;
  }

  localStorage.setItem('agent_name', participantName);
  BOOTH_ORDER.forEach((boothId) => localStorage.setItem(`stamp_${boothId}`, 'true'));
  localStorage.removeItem('agent_id');
  localStorage.removeItem('certificate_issued_date');
  localStorage.removeItem('certificate_issued_date_key');
  participantInput.value = '';
  document.getElementById('admin-modal').classList.add('hidden');
  issueCompletionCard();
}

function exitAdminMode() {
  adminIssuanceMode = false;
  localStorage.removeItem('admin_device_mode');
  localStorage.removeItem('agent_name');
  localStorage.removeItem('agent_id');
  localStorage.removeItem('certificate_issued_date');
  localStorage.removeItem('certificate_issued_date_key');
  BOOTH_ORDER.forEach((boothId) => localStorage.removeItem(`stamp_${boothId}`));
  document.getElementById('admin-modal').classList.add('hidden');
  location.reload();
}

function showMainScreen(name) {
  document.getElementById('display-name').textContent = name;
  document.getElementById('screen-intro').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  loadStamps();
}

function loadStamps() {
  let completedCount = 0;
  BOOTH_ORDER.forEach((id) => {
    const isCompleted = localStorage.getItem(`stamp_${id}`) === 'true';
    const requiredBooth = getRequiredPreviousBooth(id);
    const isLocked = Boolean(requiredBooth);
    const element = document.getElementById(`stamp-${id}`);
    if (element) {
      element.classList.toggle('completed', isCompleted);
      element.classList.toggle('locked', isLocked);
      element.setAttribute('aria-disabled', String(isLocked));
      element.title = isLocked ? `${requiredBooth.name} 미션 완료 후 접근 가능` : `${BOOTH_DATA[id].name} 미션 열기`;
      element.querySelector('.badge').textContent = isCompleted ? '완료' : (isLocked ? '잠김' : '미완료');
      element.querySelector('.access-note').textContent = isLocked ? `${requiredBooth.name} 미션 완료 후 접근 가능` : '';
      if (isCompleted) completedCount++;
    }
  });
  const isComplete = completedCount === Object.keys(BOOTH_DATA).length;
  const completionPanel = document.getElementById('completion-panel');
  const issueButton = document.getElementById('issue-card-btn');
  const completionMessage = document.getElementById('completion-message');
  const lockIcon = document.getElementById('completion-lock-icon');

  completionPanel.classList.toggle('unlocked', isComplete);
  issueButton.disabled = !isComplete;
  issueButton.textContent = isComplete ? '활동 인증 카드 발급' : `발급 조건 ${completedCount}/4`;
  completionMessage.textContent = isComplete
    ? '모든 국제 미션을 완수했습니다. 요원 활동 인증 카드를 발급하세요.'
    : `스탬프 ${4 - completedCount}개를 더 모으면 활동 인증 카드를 발급할 수 있습니다.`;
  lockIcon.textContent = isComplete ? '🏅' : '🔒';

}

function allMissionsCompleted() {
  return BOOTH_ORDER.every((id) => localStorage.getItem(`stamp_${id}`) === 'true');
}

function getRequiredPreviousBooth(boothId) {
  const targetIndex = BOOTH_ORDER.indexOf(boothId);
  if (targetIndex <= 0) return null;

  const previousId = BOOTH_ORDER[targetIndex - 1];
  return localStorage.getItem(`stamp_${previousId}`) === 'true' ? null : BOOTH_DATA[previousId];
}

function canAccessBooth(boothId, showAlert = true) {
  const requiredBooth = getRequiredPreviousBooth(boothId);
  if (!requiredBooth) return true;

  if (showAlert) {
    alert(`미션 순서 안내\n먼저 ${requiredBooth.name} 미션을 완료해야 이 국가 인증에 접근할 수 있습니다.`);
  }
  return false;
}

const LIMITED_SEQUENCE_DATE_KEY = '20260828';
const LIMITED_SEQUENCE_START_MINUTES = 9 * 60 + 30;
const LIMITED_SEQUENCE_END_MINUTES = 14 * 60;

function getSeoulDateInfo(now = new Date()) {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Seoul'
  }).formatToParts(now);
  const getPart = (type) => dateParts.find((part) => part.type === type)?.value || '';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = Number.parseInt(getPart('hour'), 10);
  const minute = Number.parseInt(getPart('minute'), 10);

  return {
    dateKey: `${year}${month}${day}`,
    displayDate: `${year}. ${month}. ${day}.`,
    minutesSinceMidnight: hour * 60 + minute
  };
}

function shouldIncludeCertificateSequence(dateKey, currentDateInfo) {
  if (dateKey !== LIMITED_SEQUENCE_DATE_KEY) return true;
  return currentDateInfo.dateKey === LIMITED_SEQUENCE_DATE_KEY
    && currentDateInfo.minutesSinceMidnight >= LIMITED_SEQUENCE_START_MINUTES
    && currentDateInfo.minutesSinceMidnight <= LIMITED_SEQUENCE_END_MINUTES;
}

function getOrCreateAgentId(dateKey, currentDateInfo) {
  let agentId = localStorage.getItem('agent_id');
  const expectedPrefix = `WIB-${dateKey.slice(0, 4)}-${dateKey.slice(4)}`;
  if (agentId === expectedPrefix || agentId?.startsWith(`${expectedPrefix}-`)) return agentId;

  if (!shouldIncludeCertificateSequence(dateKey, currentDateInfo)) {
    localStorage.setItem('agent_id', expectedPrefix);
    return expectedPrefix;
  }

  const sequenceKey = dateKey === LIMITED_SEQUENCE_DATE_KEY
    ? `certificate_sequence_${dateKey}_0930_1400`
    : `certificate_sequence_${dateKey}`;
  const nextSequence = (Number.parseInt(localStorage.getItem(sequenceKey), 10) || 0) + 1;
  agentId = `${expectedPrefix}-${String(nextSequence).padStart(2, '0')}`;
  localStorage.setItem(sequenceKey, String(nextSequence));
  localStorage.setItem('agent_id', agentId);
  return agentId;
}

function issueCompletionCard() {
  if (!allMissionsCompleted()) {
    alert('4개국 스탬프를 모두 획득한 뒤 발급할 수 있습니다.');
    return;
  }

  const agentName = localStorage.getItem('agent_name') || 'AGENT_X';
  const currentDate = getSeoulDateInfo();
  let issuedDateKey = localStorage.getItem('certificate_issued_date_key');
  let issuedDate = localStorage.getItem('certificate_issued_date');
  if (!issuedDate || !issuedDateKey) {
    issuedDateKey = currentDate.dateKey;
    issuedDate = currentDate.displayDate;
    localStorage.setItem('certificate_issued_date_key', issuedDateKey);
    localStorage.setItem('certificate_issued_date', issuedDate);
  }

  document.getElementById('certificate-agent-name').textContent = agentName;
  document.getElementById('certificate-agent-id').textContent = getOrCreateAgentId(issuedDateKey, currentDate);
  document.getElementById('certificate-date').textContent = issuedDate;
  const certificateModal = document.getElementById('certificate-modal');

  certificateModal.classList.remove('hidden', 'reveal-full', 'reveal-quick');
  void certificateModal.offsetWidth;
  certificateModal.classList.add('reveal-full');
  document.body.classList.add('certificate-open');
}

function closeCompletionCard() {
  const certificateModal = document.getElementById('certificate-modal');
  certificateModal.classList.add('hidden');
  certificateModal.classList.remove('reveal-full', 'reveal-quick');
  document.body.classList.remove('certificate-open');
  if (adminIssuanceMode) {
    document.getElementById('admin-modal').classList.remove('hidden');
    requestAnimationFrame(() => document.getElementById('admin-participant-name').focus());
  }
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

function loadCertificateImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawImageCover(context, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function drawCircularLogoCrop(context, image, centerX, centerY, diameter) {
  const radius = diameter / 2;
  const sourceSize = Math.min(image.width, image.height) * 0.73;
  const sourceX = (image.width - sourceSize) / 2;
  const sourceY = (image.height - sourceSize) / 2;
  const logoSize = diameter * 0.8;
  context.save();
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.clip();
  context.fillStyle = '#f8f7e7';
  context.fillRect(centerX - radius, centerY - radius, diameter, diameter);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    centerX - (logoSize / 2),
    centerY - (logoSize / 2) - (diameter * 0.03),
    logoSize,
    logoSize
  );
  context.restore();
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
  canvas.height = 1500;
  const context = canvas.getContext('2d');
  const [hero, logo] = await Promise.all([
    loadCertificateImage('assets/certificate-mission-hero.png'),
    loadCertificateImage('logo.png')
  ]);

  context.fillStyle = '#07111d';
  context.fillRect(0, 0, 1200, 1500);

  if (hero) {
    context.save();
    context.beginPath();
    context.rect(0, 0, 1200, 590);
    context.clip();
    drawImageCover(context, hero, 0, 0, 1200, 590);
    const shade = context.createLinearGradient(0, 0, 1200, 0);
    shade.addColorStop(0, 'rgba(1, 9, 24, 0.34)');
    shade.addColorStop(0.58, 'rgba(1, 9, 24, 0.08)');
    context.fillStyle = shade;
    context.fillRect(0, 0, 1200, 590);
    const lowerShade = context.createLinearGradient(0, 360, 0, 590);
    lowerShade.addColorStop(0, 'rgba(2, 11, 26, 0)');
    lowerShade.addColorStop(1, 'rgba(2, 11, 26, 0.58)');
    context.fillStyle = lowerShade;
    context.fillRect(0, 340, 1200, 250);
    context.restore();
  } else {
    context.fillStyle = '#07152c';
    context.fillRect(0, 0, 1200, 590);
  }

  context.textAlign = 'left';
  context.fillStyle = '#ffffff';
  context.font = '700 25px sans-serif';
  context.fillText('동화고등학교 국제학부', 76, 100);
  context.font = '700 48px sans-serif';
  context.fillText('UN 1급 기밀 탈취 사건:', 76, 184);
  context.fillText('4개국에 숨겨진 암호를 찾아라', 76, 246);
  context.fillStyle = '#7ef0dc';
  context.font = '700 25px sans-serif';
  context.fillText('4개국 문화 체험', 76, 306);
  context.textAlign = 'right';
  context.fillStyle = 'rgba(220, 240, 255, 0.78)';
  context.font = '700 16px monospace';
  context.fillText('PROJECT WIB · 2026', 1124, 548);

  const bodyGradient = context.createLinearGradient(0, 590, 1200, 1500);
  bodyGradient.addColorStop(0, '#0b1b2b');
  bodyGradient.addColorStop(1, '#050e17');
  context.fillStyle = bodyGradient;
  context.fillRect(0, 590, 1200, 910);
  context.strokeStyle = 'rgba(0, 255, 157, 0.055)';
  context.lineWidth = 1;
  for (let x = 0; x <= 1200; x += 44) {
    context.beginPath();
    context.moveTo(x, 590);
    context.lineTo(x, 1500);
    context.stroke();
  }
  for (let y = 590; y <= 1500; y += 44) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1200, y);
    context.stroke();
  }

  const portraitX = 78;
  const portraitY = 660;
  const portraitWidth = 300;
  const portraitHeight = 390;
  const portraitGradient = context.createLinearGradient(portraitX, portraitY, portraitX, portraitY + portraitHeight);
  portraitGradient.addColorStop(0, '#143247');
  portraitGradient.addColorStop(1, '#07131f');
  context.fillStyle = portraitGradient;
  drawRoundedRect(context, portraitX, portraitY, portraitWidth, portraitHeight, 28);
  context.fill();
  context.strokeStyle = 'rgba(0, 255, 157, 0.38)';
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = '#2a3740';
  context.beginPath();
  context.arc(228, 800, 68, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#25313a';
  context.beginPath();
  context.ellipse(228, 1050, 160, 170, 0, Math.PI, Math.PI * 2);
  context.fill();

  const rows = [
    ['이름', agentName],
    ['역할', '국제 첩보원'],
    ['소속', '동화고등학교'],
    ['상태', '4개국 활동 인증']
  ];
  rows.forEach(([label, value], index) => {
    const y = 675 + (index * 94);
    context.textAlign = 'left';
    if (label) {
      context.fillStyle = '#e3b341';
      context.font = '700 19px sans-serif';
      context.fillText(label, 430, y + 42);
    }
    context.fillStyle = '#f3fbff';
    context.font = '700 30px sans-serif';
    context.fillText(value, 570, y + 43);
    context.strokeStyle = 'rgba(126, 240, 220, 0.2)';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(430, y + 70);
    context.lineTo(1115, y + 70);
    context.stroke();
  });

  const stampData = [
    '일본 🇯🇵',
    '프랑스 🇫🇷',
    '이집트 🇪🇬',
    '멕시코 🇲🇽'
  ];
  const stampPositions = [205, 468, 731, 994];
  stampData.forEach((label, index) => {
    const x = stampPositions[index] - 112;
    context.fillStyle = 'rgba(0, 255, 157, 0.1)';
    drawRoundedRect(context, x, 1100, 224, 66, 12);
    context.fill();
    context.strokeStyle = 'rgba(0, 255, 157, 0.46)';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#aaffd5';
    context.textAlign = 'center';
    context.font = "700 22px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    context.fillText(label, stampPositions[index], 1142);
  });

  const footerGradient = context.createLinearGradient(0, 1190, 1200, 1500);
  footerGradient.addColorStop(0, '#071621');
  footerGradient.addColorStop(1, '#04101a');
  context.fillStyle = footerGradient;
  context.fillRect(0, 1190, 1200, 310);
  context.strokeStyle = 'rgba(0, 255, 157, 0.55)';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 1191);
  context.lineTo(1200, 1191);
  context.stroke();

  if (logo) {
    context.fillStyle = '#07131f';
    context.beginPath();
    context.arc(160, 1344, 88, 0, Math.PI * 2);
    context.fill();
    drawCircularLogoCrop(context, logo, 160, 1344, 166);
    context.strokeStyle = 'rgba(0, 255, 157, 0.78)';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(160, 1344, 86, 0, Math.PI * 2);
    context.stroke();
  } else {
    context.beginPath();
    context.arc(160, 1344, 84, 0, Math.PI * 2);
    context.strokeStyle = '#00ff9d';
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = '#aaffd5';
    context.textAlign = 'center';
    context.font = '700 24px sans-serif';
    context.fillText('SYNODIA', 160, 1352);
  }

  const metaBoxes = [
    { x: 300, width: 300, label: '발급일', value: issuedDate },
    { x: 630, width: 490, label: '인증번호', value: agentId }
  ];
  metaBoxes.forEach(({ x, width, label, value }) => {
    context.fillStyle = 'rgba(255, 255, 255, 0.035)';
    drawRoundedRect(context, x, 1284, width, 122, 16);
    context.fill();
    context.strokeStyle = 'rgba(126, 240, 220, 0.2)';
    context.lineWidth = 2;
    context.stroke();
    context.textAlign = 'left';
    context.fillStyle = '#7ef0dc';
    context.font = '700 23px sans-serif';
    context.fillText(label, x + 24, 1325);
    context.fillStyle = '#f4fbff';
    context.font = '700 31px monospace';
    context.fillText(value, x + 24, 1374);
  });

  context.strokeStyle = 'rgba(0, 255, 157, 0.7)';
  context.lineWidth = 4;
  context.strokeRect(18, 18, 1164, 1464);

  canvas.toBlob((blob) => {
    if (!blob) {
      alert('JPG 파일 생성에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    const safeName = agentName.replace(/[\\/:*?"<>|]/g, '_');
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `WIB_4개국문화체험_활동인증카드_${safeName}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }, 'image/jpeg', 0.94);
}

function openMissionBriefing(boothId) {
  const booth = BOOTH_DATA[boothId];
  if (!booth) return;
  if (!canAccessBooth(boothId)) return;

  currentTargetBooth = boothId;
  const agentName = (localStorage.getItem('agent_name') || '신입').trim();
  document.getElementById('mission-country-flag').dataset.country = boothId;
  document.getElementById('mission-country-name').textContent = booth.name;
  document.getElementById('mission-country-code').textContent = `MISSION · ${booth.code}`;
  document.getElementById('mission-briefing-title').textContent = booth.title;
  document.getElementById('mission-agent-name').textContent = agentName;
  document.getElementById('mission-briefing-text').textContent = booth.briefing;
  document.getElementById('mission-final-objective').textContent = booth.finalObjective;
  document.getElementById('mission-unlock-btn').textContent = localStorage.getItem(`stamp_${boothId}`) === 'true'
    ? '인증 완료 · 기록 다시 보기'
    : '해독 완료';
  document.getElementById('mission-modal').classList.remove('hidden');
}

function closeMissionBriefing() {
  document.getElementById('mission-modal').classList.add('hidden');
}

function unlockMission() {
  if (!currentTargetBooth) return;
  const boothId = currentTargetBooth;
  if (!canAccessBooth(boothId)) return;
  const boothName = BOOTH_DATA[boothId].name;
  closeMissionBriefing();
  openAuthModal(boothId, boothName);
}

function openAuthModal(boothId, title) {
  if (!BOOTH_DATA[boothId] || !canAccessBooth(boothId)) return;
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
  if (!BOOTH_DATA[boothId] || !canAccessBooth(boothId)) {
    closeAuthModal();
    return;
  }
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
    const issueSequences = Object.entries(localStorage)
      .filter(([key]) => key.startsWith('certificate_sequence_'));
    localStorage.clear();
    issueSequences.forEach(([key, value]) => localStorage.setItem(key, value));
    location.reload();
  }
}
