document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const emailMsg = document.getElementById("emailMsg");
  const passwordMsg = document.getElementById("passwordMsg");

  function setMsg(el, msg, ok=false){
    el.textContent = msg || "";
    el.className = "msg " + (ok ? "ok" : (msg ? "err" : ""));
  }

  email.addEventListener("input", () => {
    if (email.validity.valid) setMsg(emailMsg, "입력이 완료되었습니다.", true);
    else setMsg(emailMsg, "올바른 이메일을 입력하세요.");
  });

  password.addEventListener("input", () => {
    if (password.value.trim().length >= 1) /*setMsg(passwordMsg, "입력이 완료되었습니다.", true)*/;
    else setMsg(passwordMsg, "비밀번호를 입력하세요.");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email.value.trim());
    if (!user) {
      setMsg(emailMsg, "존재하지 않는 이메일입니다.");
      return;
    }
    if (user.password !== password.value) {
      setMsg(passwordMsg, "비밀번호가 일치하지 않습니다.");
      return;
    }
    // 로그인 성공
    localStorage.setItem("currentUser", JSON.stringify(user));
    location.href = "./main.html";
  });
});
