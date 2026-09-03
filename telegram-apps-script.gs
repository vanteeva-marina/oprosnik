const TELEGRAM_BOT_TOKEN = '8915053577:AAGrfGDRchheeZowF9hTHqpQTV7YUibo82U';
const TELEGRAM_CHAT_ID = '5882769111';

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents);
    const message = formatTelegramMessage(data);
    const response = UrlFetchApp.fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        }),
        muteHttpExceptions: true
      }
    );

    if (response.getResponseCode() >= 300) {
      throw new Error(response.getContentText());
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) });
  }
}

function formatTelegramMessage(data) {
  const answers = data.answers || {};
  const labels = data.labels || {};
  const answerLines = Object.keys(labels)
    .map((key) => {
      const value = answers[key] || '—';
      return `<b>${escapeHtml(labels[key])}</b>\n${escapeHtml(value)}`;
    })
    .join('\n\n');
  const spins = (data.fortuneResults || []).join(' · ') || 'нет результатов';

  return [
    '💌 <b>Новая анкета для Даши</b>',
    '',
    answerLines,
    '',
    `🎡 <b>Колесо фортуны:</b> ${escapeHtml(spins)}`
  ].join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
