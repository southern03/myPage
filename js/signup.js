document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const form = document.getElementById("signupForm");

  const email = document.getElementById("email");
  const emailMsg = document.getElementById("emailMsg");

  const password = document.getElementById("password");
  const passwordMsg = document.getElementById("passwordMsg");

  const password2 = document.getElementById("password2");
  const password2Msg = document.getElementById("password2Msg");

  const nameEl = document.getElementById("name");
  const nameMsg = document.getElementById("nameMsg");

  const nickname = document.getElementById("nickname");
  const nicknameMsg = document.getElementById("nicknameMsg");
  const checkNicknameBtn = document.getElementById("checkNicknameBtn");

  const phone = document.getElementById("phone");
  const phoneMsg = document.getElementById("phoneMsg");

  const postcode = document.getElementById("postcode");
  const roadAddress = document.getElementById("roadAddress");
  const detailAddress = document.getElementById("detailAddress");
  const addressMsg = document.getElementById("addressMsg");
  const findAddrBtn = document.getElementById("findAddrBtn");

  const agreeAll = document.getElementById("agreeAll");
  const agreeService = document.getElementById("agreeService");
  const agreePrivacy = document.getElementById("agreePrivacy");
  const agreeMarketing = document.getElementById("agreeMarketing");
  const agreeMsg = document.getElementById("agreeMsg");

  // Helpers
  const setMsg = (el, msg, ok=false) => {
    el.textContent = msg || "";
    el.className = "msg " + (ok ? "ok" : (msg ? "err" : ""));
  };

  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/; // 영문+숫자+특수문자, 8자+

  const reservedNicknames = ["admin", "administrator", "root", "test"]; // 데모용
  let nicknameChecked = false;
  let nicknameAvailable = false;

  // “AI 스타일” 즉시 피드백(클라이언트 추론) — 입력 즉시 초록/빨강 메시지
  email.addEventListener("input", () => {
    if (email.validity.valid) setMsg(emailMsg, "입력이 완료되었습니다.", true);
    else setMsg(emailMsg, "올바른 이메일 주소를 입력하세요.");
  });

  password.addEventListener("input", () => {
    if (!pwRegex.test(password.value)) {
      setMsg(passwordMsg, "영문+숫자+특수문자 1개 이상 포함, 8자 이상이어야 합니다.");
    } else {
      setMsg(passwordMsg, "안전한 비밀번호입니다.", true);
    }
    // 비밀번호 확인 즉시 재검
    checkPwMatch();
  });

  password2.addEventListener("input", checkPwMatch);
  function checkPwMatch(){
    if (password2.value.length === 0) {
      setMsg(password2Msg, "");
      return;
    }
    if (password.value === password2.value) setMsg(password2Msg, "비밀번호가 일치합니다.", true);
    else setMsg(password2Msg, "비밀번호가 일치하지 않습니다.");
  }

  nameEl.addEventListener("input", () => {
    if (nameEl.value.trim().length >= 2) setMsg(nameMsg, "입력이 완료되었습니다.", true);
    else setMsg(nameMsg, "이름을 입력하세요(2자 이상).");
  });

  // 닉네임 중복 확인 (데모: 예약어 + 기존 가입자 + 간단 규칙)
  checkNicknameBtn.addEventListener("click", () => {
    const value = nickname.value.trim().toLowerCase();
    nicknameChecked = true;
    setMsg(nicknameMsg, "중복 확인 중...", false);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const exists = users.some(u => (u.nickname || "").toLowerCase() === value);
      const invalid = value.length < 2 || /[^a-zA-Z0-9가-힣_]/.test(value);
      if (invalid) {
        nicknameAvailable = false;
        setMsg(nicknameMsg, "닉네임은 2자 이상이며 특수문자(언더스코어 제외)를 포함할 수 없습니다.");
      } else if (reservedNicknames.includes(value) || exists) {
        nicknameAvailable = false;
        setMsg(nicknameMsg, "이미 사용 중인 닉네임입니다.");
      } else {
        nicknameAvailable = true;
        setMsg(nicknameMsg, "사용 가능한 닉네임입니다.", true);
      }
    }, 450); // 약간의 지연으로 “검사 중” 느낌
  });

  nickname.addEventListener("input", () => {
    nicknameChecked = false;
    setMsg(nicknameMsg, "중복 확인을 진행하세요.");
  });

  // 전화번호 자동 하이픈
  phone.addEventListener("input", (e) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if (v.startsWith("02")) {
      if (v.length > 2 && v.length <= 5) v = v.replace(/(\d{2})(\d+)/, "$1-$2");
      else if (v.length > 5 && v.length <= 9) v = v.replace(/(\d{2})(\d{3,4})(\d+)/, "$1-$2-$3");
      else if (v.length > 9) v = v.slice(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
      if (v.length > 3 && v.length <= 7) v = v.replace(/(\d{3})(\d+)/, "$1-$2");
      else if (v.length > 7) v = v.slice(0, 11).replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
    }
    e.target.value = v;
    if (v.length >= 12) setMsg(phoneMsg, "입력이 완료되었습니다.", true);
    else setMsg(phoneMsg, "전화번호를 정확히 입력하세요.");
  });

  // 카카오(다음) 우편번호 팝업
  findAddrBtn.addEventListener("click", () => {
    new daum.Postcode({
      oncomplete: function(data) {
        postcode.value = data.zonecode;
        roadAddress.value = data.roadAddress || data.jibunAddress || "";
        detailAddress.focus();
        validateAddress();
      }
    }).open();
  });

  [postcode, roadAddress, detailAddress].forEach(el => {
    el.addEventListener("input", validateAddress);
  });
  function validateAddress(){
    if (postcode.value && roadAddress.value) setMsg(addressMsg, "입력이 완료되었습니다.", true);
    else setMsg(addressMsg, "주소를 검색하고 상세주소를 입력하세요.");
  }

  // 비밀번호 보기/숨기기
  document.querySelectorAll(".eye").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // 약관 전체/개별 동기화
  const agreeBoxes = [agreeService, agreePrivacy, agreeMarketing];
  agreeAll.addEventListener("change", () => {
    agreeBoxes.forEach(cb => cb.checked = agreeAll.checked);
    validateAgree();
  });
  agreeBoxes.forEach(cb => cb.addEventListener("change", () => {
    agreeAll.checked = agreeBoxes.every(x => x.checked);
    validateAgree();
  }));
  function validateAgree(){
    if (agreeService.checked && agreePrivacy.checked) setMsg(agreeMsg, "필수 약관 동의 완료.", true);
    else setMsg(agreeMsg, "필수 약관(서비스/개인정보)에 동의하세요.");
  }

  // 제출
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // 필드 기본 검증
    let ok = true;

    if (!email.validity.valid){ setMsg(emailMsg, "올바른 이메일을 입력하세요."); ok=false; }
    else setMsg(emailMsg, "입력이 완료되었습니다.", true);

    if (!pwRegex.test(password.value)){ setMsg(passwordMsg, "비밀번호 규칙을 확인하세요."); ok=false; }
    else setMsg(passwordMsg, "안전한 비밀번호입니다.", true);

    if (password.value !== password2.value){ setMsg(password2Msg, "비밀번호가 일치하지 않습니다."); ok=false; }
    else setMsg(password2Msg, "비밀번호가 일치합니다.", true);

    if (nameEl.value.trim().length < 2){ setMsg(nameMsg, "이름을 입력하세요(2자 이상)."); ok=false; }
    else setMsg(nameMsg, "입력이 완료되었습니다.", true);

    if (!nicknameChecked || !nicknameAvailable){ 
      setMsg(nicknameMsg, nicknameChecked ? "사용 불가 닉네임입니다." : "닉네임 중복 확인을 진행하세요.");
      ok=false; 
    }

    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone.value)){ setMsg(phoneMsg, "전화번호 형식이 올바르지 않습니다."); ok=false; }
    else setMsg(phoneMsg, "입력이 완료되었습니다.", true);

    if (!(postcode.value && roadAddress.value)){ setMsg(addressMsg, "주소를 입력하세요."); ok=false; }
    else setMsg(addressMsg, "입력이 완료되었습니다.", true);

    if (!(agreeService.checked && agreePrivacy.checked)){ setMsg(agreeMsg, "필수 약관에 동의하세요."); ok=false; }
    else setMsg(agreeMsg, "필수 약관 동의 완료.", true);

    // 이메일 중복
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some(u => u.email === email.value.trim())) {
      setMsg(emailMsg, "이미 가입된 이메일입니다.");
      ok = false;
    }

    if (!ok) return;

    // 저장 (데모용)
    const user = {
      email: email.value.trim(),
      password: password.value,
      name: nameEl.value.trim(),
      nickname: nickname.value.trim(),
      phone: phone.value.trim(),
      postcode: postcode.value.trim(),
      roadAddress: roadAddress.value.trim(),
      detailAddress: detailAddress.value.trim(),
      agreeService: agreeService.checked,
      agreePrivacy: agreePrivacy.checked,
      agreeMarketing: agreeMarketing.checked,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    alert("가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
    location.href = "./login.html";
  });
});
