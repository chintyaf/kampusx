# React (Axios) Integration Guide for KampusX Payment Gateway Simulator

This guide outlines how to integrate your React + Bootstrap frontend with the newly designed Payment Gateway Simulator.

---

## 1. POST Create Payment Session
When a participant completes checkout, make an API call to create the simulated transaction session:

```javascript
import axios from 'axios';

/**
 * Triggers the simulated payment session creation.
 * @param {Object} orderData 
 */
export const initiatePayment = async (orderData) => {
  try {
    // Standard payload expected by the simulator
    const payload = {
      order_id: orderData.orderId,          // e.g. "ORD-120489"
      amount: orderData.amount,              // e.g. 150000
      customer_name: orderData.customerName, // e.g. "Chintya"
      customer_email: orderData.customerEmail,// e.g. "chintya@example.com"
      item_name: orderData.itemName,         // e.g. "Tiket Seminar KampusX"
      callback_url: 'http://localhost:8000/api/v1/payment/callback', // Your merchant callback API
      redirect_url: 'http://localhost:5173/payment/status',        // React status page
    };

    const response = await axios.post('http://localhost:8000/payment/create', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const { payment_url, token, expired_at } = response.data;
    
    // Redirect the user to the simulator checkout page (Blade)
    window.location.href = payment_url;
    
  } catch (error) {
    console.error('Failed to initiate simulated checkout:', error.response?.data || error.message);
    alert('Terjadi kesalahan saat memproses pembayaran simulator.');
  }
};
```

---

## 2. Polling / Check Transaction Status in React
On your React frontend redirect/status page (e.g. `/payment/status`), you can display a loading spinner and poll the status of the payment until it is completed:

```jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const orderId = searchParams.get('order_id');
  const initialStatus = searchParams.get('status');
  
  const [status, setStatus] = useState(initialStatus || 'pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let intervalId;

    const checkStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/payment/${token}/status`);
        const currentStatus = response.data.status; // success, failed, expired, pending
        
        setStatus(currentStatus);

        if (currentStatus !== 'pending') {
          setLoading(false);
          clearInterval(intervalId); // Stop polling when finished
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Initial check
    checkStatus();

    // Start polling every 3 seconds
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [token]);

  return (
    <div className="container py-5 text-center">
      <div className="card shadow-lg p-5 max-w-md mx-auto rounded-3">
        {loading ? (
          <div>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h3>Memverifikasi Pembayaran Anda...</h3>
            <p className="text-muted">Jangan menutup halaman ini. Kami sedang mengonfirmasi status pembayaran simulator Anda.</p>
          </div>
        ) : (
          <div>
            {status === 'success' && (
              <div className="text-success">
                <i className="bi bi-check-circle-fill display-1"></i>
                <h2 class="mt-3">Pembayaran Berhasil!</h2>
                <p>Terima kasih. Tiket event Anda telah aktif dan siap digunakan.</p>
                <button className="btn btn-success mt-4 w-100" onClick={() => navigate('/my-tickets')}>
                  Lihat Tiket Saya
                </button>
              </div>
            )}

            {status === 'failed' && (
              <div className="text-danger">
                <i className="bi bi-x-circle-fill display-1"></i>
                <h2 class="mt-3">Pembayaran Dibatalkan</h2>
                <p>Pembayaran dibatalkan atau ditolak. Silakan coba checkout ulang.</p>
                <button className="btn btn-outline-danger mt-4 w-100" onClick={() => navigate('/')}>
                  Kembali ke Beranda
                </button>
              </div>
            )}

            {status === 'expired' && (
              <div className="text-warning">
                <i className="bi bi-exclamation-triangle-fill display-1"></i>
                <h2 class="mt-3">Pembayaran Kedaluwarsa</h2>
                <p>Batas waktu pembayaran simulasi (15 menit) telah habis.</p>
                <button className="btn btn-warning mt-4 w-100" onClick={() => navigate('/')}>
                  Kembali ke Beranda
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
```
