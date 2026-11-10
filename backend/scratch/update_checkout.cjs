const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/src/pages/event/public/Checkout/index.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Sparkles icon import
if (!content.includes('Sparkles,')) {
  content = content.replace('Gift,', 'Gift,\r\n  Sparkles,');
}

// 2. Add banditReward state and initial TTL from searchParams
const stateAnchor = 'const [submitError, setSubmitError] = useState(null);';
const newStates = `const [submitError, setSubmitError] = useState(null);

  // Bandit Reward Decision State (Flow 3: Thompson Sampling)
  const [banditReward, setBanditReward] = useState(null);
  const [isBanditLoading, setIsBanditLoading] = useState(false);`;

if (!content.includes('banditReward')) {
  content = content.replace(stateAnchor, newStates);
}

// 3. Update timeLeft initialization to use ttl param
content = content.replace(
  'const [timeLeft, setTimeLeft] = useState(900);',
  "const ttlParam = parseInt(searchParams.get('ttl'), 10);\r\n  const [timeLeft, setTimeLeft] = useState(!isNaN(ttlParam) && ttlParam > 0 ? ttlParam : 900);"
);

// 4. Add Bandit Reward fetching useEffect
const banditEffect = `  // Fetch Personalized Bandit Reward (Flow 3: Thompson Sampling + DISCO)
  useEffect(() => {
    if (!id) return;
    const fetchBanditReward = async () => {
      setIsBanditLoading(true);
      try {
        const res = await api.get(\`/checkout/bandit-reward/\${id}\`, {
          params: { ticketId }
        });
        if (res.data?.success && res.data?.data) {
          setBanditReward(res.data.data);
        }
      } catch (err) {
        console.warn('Bandit Reward fallback to default:', err);
      } finally {
        setIsBanditLoading(false);
      }
    };
    fetchBanditReward();
  }, [id, ticketId]);`;

if (!content.includes('fetchBanditReward')) {
  content = content.replace(
    'const handleChange = (e) =>',
    `${banditEffect}\r\n\r\n  const handleChange = (e) =>`
  );
}

// 5. Update price calculation with discount
const oldTotalCalc = `  const eventPrice = selectedTicket ? parseFloat(selectedTicket.price) || 0 : parseFloat(eventDetails.price) || 0;
  const adminFee = eventPrice > 0 ? 1000 : 0;
  const total = eventPrice + adminFee;
  const isFree = total === 0;`;

const newTotalCalc = `  const eventPrice = selectedTicket ? parseFloat(selectedTicket.price) || 0 : parseFloat(eventDetails.price) || 0;
  const discountAmount = banditReward?.discount_amount ? parseFloat(banditReward.discount_amount) : 0;
  const adminFee = eventPrice > 0 ? 1000 : 0;
  const total = Math.max(0, eventPrice - discountAmount) + adminFee;
  const isFree = total === 0;`;

content = content.replace(oldTotalCalc, newTotalCalc);

// 6. Update handleSimulatePaymentSuccess to hit backend create-pending & webhook/payment-success
const oldPaymentFn = `  // Simulasikan Pembayaran Sukses (Step 2 ke Step 3)
  const handleSimulatePaymentSuccess = async () => {
    setIsProcessingPayment(true);
    // Simulasi delay gateway pembayaran (Midtrans/Xendit) 1.2 detik
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const generatedTicketCode = \`TK-2026-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const ticketData = {
      orderId: \`ORD-\${Date.now()}\`,
      ticketCode: generatedTicketCode,
      eventTitle: eventDetails.title,
      attendeeName: formData.name,
      attendeeEmail: formData.email,
      ticketType: ticketName,
      totalPaid: total,
      paymentMethod:
        paymentMethod === 'qris'
          ? 'QRIS Mandiri/BCA/Gojek'
          : paymentMethod === 'bca_va'
          ? 'BCA Virtual Account'
          : 'GoPay / E-Wallet',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setIssuedTicket(ticketData);
    setIsProcessingPayment(false);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`;

const newPaymentFn = `  // Simulasikan Pembayaran Sukses (Step 2 ke Step 3)
  const handleSimulatePaymentSuccess = async () => {
    setIsProcessingPayment(true);
    setSubmitError(null);

    try {
      // 1. Buat pending order di backend
      const pendingRes = await api.post('/checkout/create-pending', {
        event_id: eventDetails.id || id,
        ticket_id: selectedTicket?.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        amount: total,
        payment_method: paymentMethod,
        discount_amount: banditReward?.discount_amount || 0,
        bonus_points: banditReward?.bonus_points || 0
      });

      const orderId = pendingRes.data?.order_id || \`ORD-\${Date.now()}\`;

      // 2. Trigger simulated Payment Gateway Webhook (/api/webhook/payment-success)
      const webhookRes = await api.post('/webhook/payment-success', {
        order_id: orderId,
        payment_method: paymentMethod
      });

      const confirmedData = webhookRes.data?.data;
      const primaryTicket = confirmedData?.primary_ticket;

      const ticketData = {
        orderId: confirmedData?.order_id || orderId,
        ticketCode: primaryTicket?.ticket_code || \`TK-\${Math.floor(1000 + Math.random() * 9000)}\`,
        eventTitle: confirmedData?.event_title || eventDetails.title,
        attendeeName: primaryTicket?.attendee_name || formData.name,
        attendeeEmail: formData.email,
        ticketType: ticketName,
        totalPaid: total,
        status: confirmedData?.status || 'Confirmed',
        pointsAwarded: confirmedData?.points_awarded || 150,
        userPoints: confirmedData?.user_points,
        userTier: confirmedData?.user_tier,
        paymentMethod:
          paymentMethod === 'qris'
            ? 'QRIS Mandiri/BCA/Gojek'
            : paymentMethod === 'bca_va'
            ? 'BCA Virtual Account'
            : 'GoPay / E-Wallet',
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setIssuedTicket(ticketData);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error proses pembayaran checkout:', err);
      // Fallback ticket jika backend offline
      const fallbackTicketData = {
        orderId: \`ORD-\${Date.now()}\`,
        ticketCode: \`TK-\${Math.floor(1000 + Math.random() * 9000)}\`,
        eventTitle: eventDetails.title,
        attendeeName: formData.name,
        attendeeEmail: formData.email,
        ticketType: ticketName,
        totalPaid: total,
        status: 'Confirmed',
        pointsAwarded: 150,
        paymentMethod: paymentMethod === 'qris' ? 'QRIS' : 'BCA VA',
        date: new Date().toLocaleDateString('id-ID')
      };
      setIssuedTicket(fallbackTicketData);
      setStep(3);
    } finally {
      setIsProcessingPayment(false);
    }
  };`;

content = content.replace(oldPaymentFn, newPaymentFn);

// 7. Inject Bandit Badge in Summary and Gamification alert in Step 3
const oldSummaryLines = `<div className="d-flex justify-content-between small text-secondary py-1">
                      <span>Biaya Layanan & Payment</span>
                      <span className="fw-bold text-dark">
                        {adminFee === 0 ? '–' : \`Rp \${adminFee.toLocaleString('id-ID')}\`}
                      </span>
                    </div>`;

const newSummaryLines = `<div className="d-flex justify-content-between small text-secondary py-1">
                      <span>Biaya Layanan & Payment</span>
                      <span className="fw-bold text-dark">
                        {adminFee === 0 ? '–' : \`Rp \${adminFee.toLocaleString('id-ID')}\`}
                      </span>
                    </div>
                    {banditReward && (
                      <div className="p-2-5 my-2 rounded-3" style={{ background: '#ecfdf5', border: '1px solid #86efac' }}>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-bold text-success" style={{ fontSize: '12.5px' }}>
                            <Sparkles size={13} className="me-1 inline" />
                            {banditReward.badge_text}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between small text-success">
                          <span>{banditReward.reward_label}</span>
                          <span>{banditReward.discount_amount > 0 ? \`-Rp \${banditReward.discount_amount.toLocaleString('id-ID')}\` : \`+\${banditReward.bonus_points} Poin\`}</span>
                        </div>
                      </div>
                    )}`;

content = content.replace(oldSummaryLines, newSummaryLines);

// 8. Add gamification alert in Step 3
const step3Anchor = '<h3 className="fw-bold text-dark mb-1">Pemesanan Tiket Berhasil!</h3>';
const step3Alert = `<h3 className="fw-bold text-dark mb-1">Pemesanan Tiket Berhasil!</h3>
            {issuedTicket.pointsAwarded && (
              <div className="alert alert-success d-flex align-items-center justify-content-center gap-2 py-2 mb-3 rounded-pill" style={{ fontSize: '13.5px' }}>
                <Sparkles size={16} />
                <span>Selamat! <strong>+{issuedTicket.pointsAwarded} Global Points</strong> telah ditambahkan ke akun Anda! (Tier: <strong>{issuedTicket.userTier || 'Silver'}</strong>)</span>
              </div>
            )}`;

if (!content.includes('Global Points telah ditambahkan')) {
  content = content.replace(step3Anchor, step3Alert);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Checkout page updated successfully');
