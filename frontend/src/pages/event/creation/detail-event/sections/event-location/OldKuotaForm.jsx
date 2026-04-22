            {/* Batas Kuota */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Batas Kuota</Form.Label>
                <Row className="align-items-center g-3">
                    <Col xs={8} sm={9}>
                        <Form.Control
                            name="offline_quota"
                            type="number"
                            value={data.offline_quota || ""}
                            onChange={onChange}
                            disabled={data.is_offline_quota_unlimited}
                            placeholder="0"
                            min="1"
                        />
                    </Col>
                    <Col xs={4} sm={3}>
                        <Form.Check
                            type="checkbox"
                            id="is_offline_quota_unlimited"
                            name="is_offline_quota_unlimited"
                            checked={data.is_offline_quota_unlimited || false}
                            onChange={(e) => {
                                onChange({
                                    target: {
                                        name: "is_offline_quota_unlimited",
                                        value: e.target.checked,
                                    },
                                });
                                if (e.target.checked) {
                                    onChange({
                                        target: {
                                            name: "offline_quota",
                                            value: "",
                                        },
                                    });
                                }
                            }}
                            label="Unlimited"
                            className="mb-0"
                        />
                    </Col>
                </Row>
            </Form.Group>


			{/* Pengaturan Kuota Gabungan */}
			<h5 className="mb-3 text-dark font-semibold">Pengaturan Kapasitas (Hybrid)</h5>
			<Row className="mb-3">
				<Form.Group as={Col} md={6}>
					<Form.Label className="small fw-bold text-muted">
						Kuota Peserta Online
					</Form.Label>
					<Form.Control
						type="number"
						name="online_quota" // Sesuaikan dengan snake_case formData
						placeholder="0"
						value={data.online_quota}
						onChange={onChange}
						isInvalid={!!errors.online_quota}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.online_quota}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group as={Col} md={6}>
					<Form.Label className="small fw-bold text-muted">
						Kuota Peserta Offline
					</Form.Label>
					<Form.Control
						type="number"
						name="offline_quota" // Sesuaikan dengan snake_case formData
						placeholder="0"
						value={data.offline_quota}
						onChange={onChange}
						isInvalid={!!errors.offline_quota}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.offline_quota}
					</Form.Control.Feedback>
				</Form.Group>
			</Row>