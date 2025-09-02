function chatAI(msg) {
  const reply = "System: " + msg;
  document.getElementById("ai-chat").innerHTML += "<p>"+reply+"</p>";
}
export { chatAI };
