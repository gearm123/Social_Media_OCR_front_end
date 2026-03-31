import './MessengerBackdrop.css'

/** Decorative, non-interactive chat “scraps” evoking common messengers (no brand assets). */
export function MessengerBackdrop() {
  return (
    <div className="messenger-backdrop" aria-hidden>
      <div className="messenger-backdrop__wash" />

      <div className="snippet snippet--messenger" style={{ top: '5%', left: '2%', transform: 'rotate(-4deg)' }}>
        <div className="snippet__badge">Facebook · Messenger</div>
        <div className="snippet__topbar snippet__topbar--messenger" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--messenger-them">Still on for 8 tonight?</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--messenger-me">Yep — on my way 👍</div>
        </div>
      </div>

      <div className="snippet snippet--whatsapp" style={{ top: '16%', right: '3%', transform: 'rotate(3deg)' }}>
        <div className="snippet__badge">WhatsApp</div>
        <div className="snippet__topbar snippet__topbar--whatsapp" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--wa-them">कल मिलते हैं?</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--wa-me">हाँ, ज़रूर आऊँगा</div>
        </div>
      </div>

      <div className="snippet snippet--instagram" style={{ bottom: '26%', left: '5%', transform: 'rotate(2deg)' }}>
        <div className="snippet__badge">Instagram</div>
        <div className="snippet__topbar snippet__topbar--ig" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--ig-them">Amei esse reel 😂</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--ig-me">Né? Tá muito bom</div>
        </div>
      </div>

      <div className="snippet snippet--line" style={{ bottom: '10%', right: '6%', transform: 'rotate(-2deg)' }}>
        <div className="snippet__badge">LINE</div>
        <div className="snippet__topbar snippet__topbar--line" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--line-them">今から電車乗る！</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--line-me">了解、待ってるね</div>
        </div>
      </div>

      <div className="snippet snippet--imessage" style={{ top: '40%', left: '10%', transform: 'rotate(-2deg)' }}>
        <div className="snippet__badge">iMessage</div>
        <div className="snippet__topbar snippet__topbar--imessage" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--im-them">T’es dispo ce soir ?</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--im-me">Oui — envoie l’adresse</div>
        </div>
      </div>

      <div className="snippet snippet--telegram" style={{ top: '50%', right: '12%', transform: 'rotate(4deg)' }}>
        <div className="snippet__badge">Telegram</div>
        <div className="snippet__topbar snippet__topbar--telegram" />
        <div className="snippet__row">
          <div className="snippet__bubble snippet__bubble--tg-them">Кинь ссылку в чат</div>
        </div>
        <div className="snippet__row snippet__row--end">
          <div className="snippet__bubble snippet__bubble--tg-me">Уже отправил ✓</div>
        </div>
      </div>
    </div>
  )
}
