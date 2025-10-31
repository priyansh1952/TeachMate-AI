import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PDF_MARGIN = 10;
const SCALE = 2;

export async function exportConversationPDF(container) {
  if (!container) return;

  const canvas = await html2canvas(container, {
    scale: SCALE,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth() - PDF_MARGIN * 2;
  const imgProps = pdf.getImageProperties(imgData);
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

  let remainingHeight = imgHeight;
  let position = PDF_MARGIN;

  pdf.addImage(imgData, "PNG", PDF_MARGIN, position, pageWidth, imgHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    pdf.addPage();
    position = PDF_MARGIN;
    pdf.addImage(imgData, "PNG", PDF_MARGIN, position - remainingHeight, pageWidth, imgHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save("conversation.pdf");
}

export async function exportLastAnswerPDF(messages) {
  const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
  if (!lastAssistant) return alert("No AI answer found!");

  const wrapper = document.createElement("div");
  wrapper.style.padding = "20px";
  wrapper.style.maxWidth = "700px";
  wrapper.style.fontFamily = "Inter, sans-serif";
  wrapper.style.lineHeight = "1.6";
  wrapper.innerHTML = `
    <h2>AI Tutor — Answer</h2>
    <p>${escape(lastAssistant.content)}</p>
  `;

  if (lastAssistant.sources?.length) {
    wrapper.innerHTML += `
      <h3 style='margin-top:16px;'>Sources</h3>
      ${lastAssistant.sources
        .map(
          s => `
          <div style="margin-bottom:6px;border-left:3px solid #679;color:#333;padding-left:6px;">
            🎬 ${s.file}<br/>
            ⏱ ${formatTime(s.start)} → ${formatTime(s.end)}
          </div>`
        )
        .join("")}
    `;
  }

  document.body.appendChild(wrapper);

  const canvas = await html2canvas(wrapper, { scale: SCALE });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(img, "PNG", 0, 0, width, height);
  pdf.save("answer.pdf");

  document.body.removeChild(wrapper);
}

function escape(str) {
  return str.replace(/\n/g, "<br/>");
}

function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
