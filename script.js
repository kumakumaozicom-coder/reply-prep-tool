const form = document.querySelector("#promptForm");
const generatedPrompt = document.querySelector("#generatedPrompt");
const copyButton = document.querySelector("#copyButton");
const downloadButton = document.querySelector("#downloadButton");
const resetButton = document.querySelector("#resetButton");
const statusMessage = document.querySelector("#statusMessage");

const fieldIds = [
  "contactMethod",
  "relationship",
  "personName",
  "incomingMessage",
  "mainPoint",
  "mustInclude",
  "avoidWording",
  "replyTone",
  "replyLength",
];

const methodRules = {
  "メール": [
    "件名が必要そうな場合は、件名案も作る。",
    "相手の名前がある場合は宛名を入れる。",
    "全体を丁寧めに整える。",
    "最後に署名が必要か、人間が確認できるように一言添える。",
  ],
  "ショートメール / SMS": [
    "短くまとめる。",
    "用件を先に出す。",
    "長文にしない。",
    "挨拶は最小限にする。",
  ],
  "LINE": [
    "会話っぽく自然にする。",
    "硬くしすぎない。",
    "仕事関係の場合は崩しすぎない。",
    "絵文字は必要な場合だけ使う。",
  ],
};

function valueOf(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function line(label, value, fallback = "未入力") {
  return `- ${label}: ${value || fallback}`;
}

function rulesFor(method) {
  return methodRules[method].map((rule) => `- ${rule}`).join("\n");
}

function buildPrompt() {
  const contactMethod = valueOf("contactMethod");
  const relationship = valueOf("relationship");
  const personName = valueOf("personName");
  const incomingMessage = valueOf("incomingMessage");
  const mainPoint = valueOf("mainPoint");
  const mustInclude = valueOf("mustInclude");
  const avoidWording = valueOf("avoidWording");
  const replyTone = valueOf("replyTone");
  const replyLength = valueOf("replyLength");

  return `あなたは、相手から来た文章を整理し、人間が送信前に確認できる返信文案を作るアシスタントです。

以下の内容をもとに、${contactMethod}で返すための返信準備をしてください。

【前提】
- この依頼は返信文案を作るための準備です。
- 実際の送信は人間が確認してから行います。
- あなたは送信をしません。
- メール、SMS、LINEなどの外部サービスには接続しません。
- 書かれていない事実を勝手に作らないでください。
- 不明点がある場合は、推測で埋めずに確認事項として出してください。

【連絡手段ごとのルール】
${rulesFor(contactMethod)}

【相手について】
${line("相手との関係", relationship)}
${line("相手の名前", personName)}

【相手から来た文章】
${incomingMessage || "未入力"}

【こちらが伝えたいこと】
${mainPoint || "未入力"}

【絶対に入れたい内容】
${mustInclude || "なし"}

【できれば避けたい言い方】
${avoidWording || "なし"}

【返信の希望】
${line("返信の温度感", replyTone)}
${line("返信の長さ", replyLength)}

【出力してほしい内容】
1. 相手の文章の要点を整理してください。
2. 返信で答えるべきことを整理してください。
3. 足りない情報や、送信前に確認したほうがよいことがあれば挙げてください。
4. 人間が送信前に確認する前提で、返信文案を作ってください。
5. 勝手に事実を作らず、曖昧な点は曖昧なまま扱ってください。
6. 送信はしないでください。

最後に、送信前に人間が確認すべき点を短くまとめてください。`;
}

function updatePrompt() {
  generatedPrompt.value = buildPrompt();
}

function setStatus(message) {
  statusMessage.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusMessage.textContent = "";
  }, 2600);
}

async function copyPrompt() {
  const text = generatedPrompt.value;

  try {
    await navigator.clipboard.writeText(text);
    setStatus("コピーしました。");
  } catch (error) {
    generatedPrompt.select();
    document.execCommand("copy");
    setStatus("コピーしました。");
  }
}

function downloadPrompt() {
  const blob = new Blob([generatedPrompt.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `reply-prep-prompt-${date}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("TXTをダウンロードしました。");
}

function resetForm() {
  form.reset();
  updatePrompt();
  setStatus("リセットしました。");
}

form.addEventListener("input", updatePrompt);
form.addEventListener("change", updatePrompt);
copyButton.addEventListener("click", copyPrompt);
downloadButton.addEventListener("click", downloadPrompt);
resetButton.addEventListener("click", resetForm);

fieldIds.forEach((id) => {
  document.querySelector(`#${id}`).addEventListener("blur", updatePrompt);
});

updatePrompt();
