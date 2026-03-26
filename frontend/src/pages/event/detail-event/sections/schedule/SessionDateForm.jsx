import { Form, Badge, Row, Col } from "react-bootstrap";

const SessionDateForm = ({ formData, totalDays, onSetTotalDays, onChange }) => {
    const TimezoneId = [
        { value: "WIB", name: "WIB - Waktu Indonesia Barat (UTC+7)" },
        { value: "WITA", name: "WITA - Waktu Indonesia Tengah (UTC+8)" },
        { value: "WIT", name: "WIT - Waktu Indonesia Timur (UTC+9)" },
    ];

    const todayDate = new Date().toISOString().split("T")[0];

    // Derived state: Automatically know if it's multiple days
    const isMultipleDay =
        formData.startDate &&
        formData.endDate &&
        formData.startDate !== formData.endDate;

    // Helper function to calculate days and update parent
    const calculateAndSetDays = (start, end) => {
        if (!start || !end) {
            onSetTotalDays(1);
            return;
        }
        const diffDays =
            Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;
        onSetTotalDays(diffDays > 0 ? diffDays : 1);
    };

    // Custom handler for dates to handle the business logic before sending to parent
    const handleDateChange = (e) => {
        const { name, value } = e.target;

        // 1. Send the actual change to the parent
        onChange(e);

        // 2. Calculate days based on the new input
        if (name === "startDate") {
            const newEndDate = isMultipleDay ? formData.endDate : value;
            calculateAndSetDays(value, newEndDate);

            // If it's a single day event, force endDate to match startDate
            if (!isMultipleDay) {
                // We simulate an event object to reuse the parent's onChange
                onChange({ target: { name: "endDate", value: value } });
            }
        } else if (name === "endDate") {
            calculateAndSetDays(formData.startDate, value);
        }
    };

    // Handler for the Multiple Days Switch
    const handleSwitchChange = (e) => {
        const checked = e.target.checked;
        if (!checked) {
            // Revert back to single day
            onChange({
                target: { name: "endDate", value: formData.startDate },
            });
            onSetTotalDays(1);
        }
    };

    return (
        <>
            {/* Zona Waktu */}
            <Form.Group as={Col} controlId="formGridTimezone" className="mb-4">
                <Form.Label className="fw-bold">Zona Waktu</Form.Label>
                <Form.Select
                    name="timezone"
                    value={formData.timezone || ""}
                    onChange={onChange}
                >
                    <option value="">Pilih Zona Waktu</option>
                    {TimezoneId.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Text className="text-muted small">
                    Penting jika peserta berasal dari berbagai zona waktu.
                </Form.Text>
            </Form.Group>

            {/* Bagian Switch & Info */}
            <Row className="g-3 align-items-end mb-3">
                {/* Kolom Tanggal Mulai */}
                <Col md={isMultipleDay ? 5 : 10} xs={12}>
                    <Form.Group>
                        <Form.Label className="small fw-bold text-muted text-uppercase">
                            {isMultipleDay
                                ? "Tanggal Mulai"
                                : "Tanggal Pelaksanaan"}
                        </Form.Label>
                        <Form.Control
                            type="date"
                            size="sm"
                            name="startDate"
                            min={todayDate}
                            value={formData.startDate || ""}
                            onChange={handleDateChange}
                        />
                    </Form.Group>
                </Col>

                {/* Kolom Tanggal Berakhir */}
                {isMultipleDay && (
                    <Col md={5} xs={12}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase text-danger">
                                Tanggal Berakhir
                            </Form.Label>
                            <Form.Control
                                type="date"
                                size="sm"
                                name="endDate"
                                min={formData.startDate} // Cannot end before it starts
                                className="border-start-0 ps-0"
                                value={formData.endDate || ""}
                                onChange={handleDateChange}
                            />
                        </Form.Group>
                    </Col>
                )}

                {/* Kolom Switch Multi-hari */}
                <Col md={2} xs={5}>
                    <div className="d-flex align-items-center mb-1 h-100">
                        <Form.Check
                            type="switch"
                            id="isMultipleDay"
                            label={
                                <span className="small fw-semibold ms-2">
                                    Multi-hari
                                </span>
                            }
                            checked={isMultipleDay}
                            onChange={handleSwitchChange}
                            className="mb-0"
                        />
                        {/* {totalDays > 1 && isMultipleDay && (
                            <Badge
                                bg="primary-subtle"
                                className="text-primary border border-primary-subtle ms-2"
                                style={{ fontSize: "0.7rem" }}
                            >
                                {totalDays} Hari
                            </Badge>
                        )} */}
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default SessionDateForm;
