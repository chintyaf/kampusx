import { useState } from "react";
import api from "@/api/axios";
import { notify } from "@/utils/notify";

const PinStep = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/committee/verify-pin",
        {
          pin,
        }
      );

      onSuccess(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Masukkan PIN POS</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN Event"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Masuk"}
        </button>
      </form>

      {error && <p>{error}</p>}
    </div>
  );
};

export default PinStep;