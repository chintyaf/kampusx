import React, { useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { Lock, X, Plus } from "lucide-react";
import ScheduleForm from "./ScheduleForm"; // Make sure this path is correct

const ScheduleTable = ({ sessions = [], setSessions, totalDays }) => {
    const [activeRow, setActiveRow] = useState(null);

    const handleAddSession = () => {
        // Group sessions by day to find the next session number
        const sessionsInDay1 = sessions.filter((s) => s.day === 1);
        const nextSessionNum =
            sessionsInDay1.length > 0
                ? Math.max(...sessionsInDay1.map((s) => s.session || 0)) + 1
                : 1;

        const newSession = {
            id: crypto.randomUUID(), // Always ensure a unique ID for React keys
            day: 1,
            session: nextSessionNum,
            startTime: "", // Matches your API payload structure
            endTime: "",
            time: "", // Formatted string for UI (e.g., "09:00 - 12:00")
            title: "",
            description: "",
            prerequisites: [], // Note: Your backend expects 'prerequisites' as an array
        };

        setSessions([...sessions, newSession]);
        setActiveRow(newSession.id);
    };

    const handleSaveSession = (updatedSession) => {
        // Format the time string for the UI display based on start and end time
        if (updatedSession.startTime && updatedSession.endTime) {
            updatedSession.time = `${updatedSession.startTime}–${updatedSession.endTime}`;
        }

        const updatedSessionsList = sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session,
        );

        // Sorting Logic: Sort by Day first, then by Start Time
        updatedSessionsList.sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;

            // Safely handle missing times during draft creation
            const timeA =
                a.startTime || (a.time ? a.time.split("–")[0] : "23:59");
            const timeB =
                b.startTime || (b.time ? b.time.split("–")[0] : "23:59");

            return timeA.localeCompare(timeB);
        });

        // Re-calculate Session Numbers sequentially per day
        let currentDay = 0;
        let sessionCounter = 1;

        const finalSessionsList = updatedSessionsList.map((session) => {
            if (session.day !== currentDay) {
                currentDay = session.day;
                sessionCounter = 1;
            } else {
                sessionCounter++;
            }
            return { ...session, session: sessionCounter };
        });

        setSessions(finalSessionsList);
        setActiveRow(null); // Close the expandable form
    };

    const handleDeleteSession = (idToDelete, e) => {
        e.stopPropagation();
        const filteredSessions = sessions.filter((s) => s.id !== idToDelete);

        // Re-calculate session numbers after deletion
        let currentDay = 0;
        let sessionCounter = 1;
        const reorderedSessions = filteredSessions.map((session) => {
            if (session.day !== currentDay) {
                currentDay = session.day;
                sessionCounter = 1;
            } else {
                sessionCounter++;
            }
            return { ...session, session: sessionCounter };
        });

        setSessions(reorderedSessions);
        if (activeRow === idToDelete) setActiveRow(null);
    };

    // Empty State UI
    if (sessions.length === 0) {
        return (
            <>
                <div className="text-center p-5 border rounded-3 bg-light text-muted">
                    <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                    <h6 className="fw-semibold mb-1">Data belum ditambahkan</h6>
                    <p className="small mb-0">
                        Silakan tambah sesi jadwal terlebih dahulu.
                    </p>
                </div>

                <div className="d-flex gap-3 mt-4">
                    <Button
                        variant="outline-secondary"
                        className="rounded-3 border-dashed px-4 py-2 border-2 d-flex align-items-center gap-2 small fw-bold"
                        onClick={handleAddSession}
                    >
                        <Plus size={18} /> Tambah Sesi
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Table
                responsive
                className="form-table align-middle border rounded-4 mt-3"
            >
                <thead className="bg-light">
                    <tr>
                        <th>Hari</th>
                        <th>Sesi</th>
                        <th>Waktu</th>
                        <th>Agenda / Judul</th>
                        <th>
                            <Lock size={14} className="me-1" /> Prasyarat
                        </th>
                        <th style={{ width: "40px" }}></th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((s, idx) => {
                        // Determine if we need to print the Day number (only for the first session of that day)
                        const showDay =
                            idx === 0 || sessions[idx - 1].day !== s.day;

                        // Formatting the time display safely
                        const displayTime =
                            s.time ||
                            (s.startTime && s.endTime
                                ? `${s.startTime}–${s.endTime}`
                                : "Belum diatur");

                        return (
                            <React.Fragment key={s.id}>
                                <tr
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        setActiveRow(
                                            activeRow === s.id ? null : s.id,
                                        )
                                    }
                                    className={
                                        activeRow === s.id ? "table-active" : ""
                                    }
                                >
                                    <td className="fw-bold">
                                        {showDay ? `Hari ${s.day}` : ""}
                                    </td>
                                    <td className="text-muted">
                                        Sesi {s.session}
                                    </td>
                                    <td>{displayTime}</td>
                                    <td className="fw-semibold">
                                        {s.title || (
                                            <span className="text-danger fst-italic">
                                                Belum ada judul
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {/* Handle both string and array prerequisite structures safely */}
                                        {s.prerequisites &&
                                        s.prerequisites.length > 0 ? (
                                            <Badge
                                                bg="warning"
                                                text="dark"
                                                className="fw-normal rounded-pill px-3"
                                            >
                                                <Lock
                                                    size={12}
                                                    className="me-1"
                                                />{" "}
                                                {s.prerequisites.length} Sesi
                                            </Badge>
                                        ) : s.prerequisite ? (
                                            <Badge
                                                bg="warning"
                                                text="dark"
                                                className="fw-normal rounded-pill px-3"
                                            >
                                                <Lock
                                                    size={12}
                                                    className="me-1"
                                                />{" "}
                                                Bersyarat
                                            </Badge>
                                        ) : (
                                            <span className="text-muted small">
                                                —
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <X
                                            size={18}
                                            className="text-danger hover-scale"
                                            style={{ cursor: "pointer" }}
                                            onClick={(e) =>
                                                handleDeleteSession(s.id, e)
                                            }
                                        />
                                    </td>
                                </tr>

                                {/* Expandable Form inside Table Row */}
                                {activeRow === s.id && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-0 border-0 bg-light"
                                        >
                                            <div className="p-3 border-bottom border-top border-primary border-opacity-25 bg-white m-2 rounded shadow-sm">
                                                <ScheduleForm
                                                    totalDays={totalDays}
                                                    sessionData={s}
                                                    allSessions={sessions}
                                                    onSave={handleSaveSession}
                                                    onClose={() =>
                                                        setActiveRow(null)
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </Table>

            <div className="d-flex gap-3 mt-3">
                <Button
                    variant="outline-primary"
                    className="rounded-3 border-dashed px-4 py-2 border-2 d-flex align-items-center gap-2 small fw-bold"
                    onClick={handleAddSession}
                >
                    <Plus size={18} /> Tambah Sesi
                </Button>
            </div>
        </>
    );
};

export default ScheduleTable;
