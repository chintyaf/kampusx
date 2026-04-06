<!DOCTYPE html>
<html>
<head>
    <title>Reset Password OTP</title>
</head>
<body>
    <h2>Halo!</h2>
    <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
    <p>Berikut adalah kode OTP Anda:</p>
    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">
        {{ $otp }}
    </h1>
    <p>Kode ini hanya berlaku selama 15 menit.</p>
    <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
</body>
</html>