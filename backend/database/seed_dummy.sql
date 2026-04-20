-- SQL Dummy Data untuk testing Event Staff dan Attendance Logs
-- Anda dapat menjalankan query ini langsung di DBeaver atau phpMyAdmin

-- 1. Dummy Data: Event Staff (Panitia)
-- Asumsi: 
-- user_id = 1 (anda bisa ganti dengan ID user yang ada)
-- event_id = 1 (anda bisa ganti dengan ID event yang ada)
INSERT INTO event_staff (user_id, event_id, created_at, updated_at) 
VALUES (1, 1, NOW(), NOW());

-- 2. Dummy Data: Attendance Logs (Log Kehadiran)
-- Asumsi:
-- ticket_id = 1 (anda bisa ganti dengan ID ticket yang ada)
-- event_id = 1 (anda bisa ganti dengan ID event yang ada)
-- scanned_by = 1 (ID panitia yang melakukan scan)
INSERT INTO attendance_logs (ticket_id, event_id, session_id, scan_time, scanned_by, method, created_at, updated_at) 
VALUES (1, 1, NULL, NOW(), 1, 'qr', NOW(), NOW());
