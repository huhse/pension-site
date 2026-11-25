// Supabase 연결 정보는 config.js 에서 불러옵니다.
const { SUPABASE_URL, SUPABASE_KEY } = window.SITE_CONFIG || {};
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("config.js 가 없거나 Supabase 설정이 비어 있습니다. config.example.js 를 참고하세요.");
}

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById("inquiry-form");
const statusEl = document.getElementById("form-status");

// 입실일은 오늘 이후만 선택 가능
const today = new Date().toISOString().split("T")[0];
form.check_in.min = today;
form.check_out.min = today;
form.check_in.addEventListener("change", () => {
  form.check_out.min = form.check_in.value;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  if (data.check_out <= data.check_in) {
    showStatus("퇴실일은 입실일 다음 날 이후로 선택해 주세요.", "err");
    return;
  }

  const button = form.querySelector("button");
  button.disabled = true;
  showStatus("보내는 중…", "");

  const { error } = await db.from("inquiries").insert({
    name: data.name.trim(),
    phone: data.phone.trim(),
    room: data.room,
    guests: Number(data.guests),
    check_in: data.check_in,
    check_out: data.check_out,
    message: data.message.trim() || null,
  });

  button.disabled = false;
  if (error) {
    console.error(error);
    showStatus("문의 전송에 실패했어요. 잠시 후 다시 시도하거나 전화로 문의해 주세요.", "err");
  } else {
    form.reset();
    showStatus("문의가 접수되었어요. 확인 후 연락드릴게요!", "ok");
  }
});

function showStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = "status " + type;
}
