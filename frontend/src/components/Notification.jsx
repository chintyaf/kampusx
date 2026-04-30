import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import './Notification.css';

const ICONS = {
  success: <CheckCircle size={16} color="#10b981" />,
  warning: <AlertTriangle size={16} color="#f59e0b" />,
  error:   <XCircle size={16} color="#ef4444" />,
};

const COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  error:   '#ef4444',
};

const Notification = ({ notif, onHide }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notif) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [notif]);

  if (!notif) return null;

  const type = notif.type || 'success';

  return (
    <div
      className={`notif-toast ${visible ? 'notif-toast--show' : ''}`}
      style={{ borderColor: COLORS[type] }}
    >
      <span className="notif-icon">{ICONS[type]}</span>
      <span className="notif-msg">{notif.message}</span>
      <button className="notif-close" onClick={onHide}>
        <X size={13} />
      </button>
    </div>
  );
};

export default Notification;
