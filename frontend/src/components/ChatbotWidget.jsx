import { useState } from 'react';

const starter = [
  {
    from: 'bot',
    text: 'Hi, I can help with app usage: login, appointments, blood requests, medicines, cart, and admin panel.',
  },
];

const getBotReply = (question) => {
  const q = question.toLowerCase();

  if (q.includes('login') || q.includes('register') || q.includes('account')) {
    return 'Patients can use /register and /login. Doctors can use /register (choose Doctor) or /doctor-login. Admin uses /admin-login.';
  }
  if (q.includes('appointment')) {
    return 'Go to Appointments tab. Patients can book after creating patient profile. Doctors and nurses can update allowed appointment fields.';
  }
  if (q.includes('blood') || q.includes('donation') || q.includes('request')) {
    return 'Blood tab shows stock. Logged-in patients and doctors can submit donation/request forms. Admin/blood staff review requests.';
  }
  if (q.includes('medicine') || q.includes('pharmacy') || q.includes('cart') || q.includes('buy') || q.includes('order')) {
    return 'Medicines tab supports patient cart and Buy flow. On Buy, an order is created and appears in Orders tab.';
  }
  if (q.includes('admin') || q.includes('dashboard')) {
    return 'Admin can login at /admin-login and manage doctor profiles, patient medical history, appointments, pharmacy orders, and blood supply controls in /admin.';
  }
  if (q.includes('doctor')) {
    return 'Doctors can login, manage their profile, view appointments, and submit blood donation/request entries.';
  }
  if (q.includes('patient profile') || q.includes('profile')) {
    return 'Patients should create profile in Patient Dashboard first. That enables appointment booking and patient-specific flows.';
  }

  return 'Try asking about login, appointments, blood donation/request, medicines/cart, orders, doctor access, or admin dashboard.';
};

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(starter);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: 'user', text };
    const botMsg = { from: 'bot', text: getBotReply(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="chatbot-root">
      {open ? (
        <div className="chatbot-panel">
          <div className="chatbot-head">
            <strong>Medicare Help</strong>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)}>
              x
            </button>
          </div>
          <div className="chatbot-body">
            {messages.map((m, idx) => (
              <div key={`${m.from}-${idx}`} className={`chatbot-msg ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form className="chatbot-input-row" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Ask about app features..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn primary">
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open help chatbot"
      >
        Help
      </button>
    </div>
  );
};

export default ChatbotWidget;
