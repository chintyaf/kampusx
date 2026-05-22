import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Nav, Form, Button, Alert, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { User, Lock, Tag, Upload, Trash2, Camera } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings = () => {
    const { user: authUser, setUser: setAuthUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Data States
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        university_id: '',
        avatar_path: null,
        categories: []
    });
    
    // Options
    const [institutions, setInstitutions] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    // File Upload
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    // Password States
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user settings
                const userRes = await api.get('/user/settings');
                const userData = userRes.data.data;
                
                setProfileData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    university_id: userData.university_id || '',
                    avatar_path: userData.avatar_path || null,
                    categories: userData.categories || []
                });

                if (userData.avatar_path) {
                    setAvatarPreview(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/storage/${userData.avatar_path}`);
                }

                // Fetch dropdowns
                const [instRes, catRes] = await Promise.all([
                    api.get('/institutions'),
                    api.get('/categories')
                ]);
                
                setInstitutions(instRes.data.data || []);
                setAllCategories(catRes.data.data || catRes.data || []);
            } catch (err) {
                console.error(err);
                setMessage({ type: 'danger', text: 'Gagal memuat data profil.' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handlers
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' && value !== '' && !/^\d+$/.test(value)) return; // Only numbers
        
        setProfileData({ ...profileData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size max 2MB
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'danger', text: 'Ukuran foto maksimal 2MB.' });
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const toggleInterest = (id) => {
        const isSelected = profileData.categories.some(c => c.id === id);
        let newCategories;
        if (isSelected) {
            newCategories = profileData.categories.filter(c => c.id !== id);
        } else {
            const catToAdd = allCategories.find(c => c.id === id);
            newCategories = [...profileData.categories, catToAdd];
        }
        setProfileData({ ...profileData, categories: newCategories });
    };

    // Submits
    const submitProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            if (profileData.phone) formData.append('phone', profileData.phone);
            if (profileData.university_id) formData.append('university_id', profileData.university_id);
            if (avatarFile) formData.append('avatar', avatarFile);
            
            // Append categories
            const categoryIds = profileData.categories.map(c => c.id);
            formData.append('category_ids', JSON.stringify(categoryIds));

            const response = await api.post('/user/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage({ type: 'success', text: response.data.message });
            
            // Update global auth state if name/avatar changed
            setAuthUser({
                ...authUser,
                name: response.data.data.name,
                avatar_path: response.data.data.avatar_path
            });
            
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Gagal memperbarui profil.' });
        } finally {
            setSaving(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (passwords.new_password.length < 8) {
            setMessage({ type: 'danger', text: 'Password baru minimal 8 karakter.' });
            return;
        }
        if (passwords.new_password !== passwords.new_password_confirmation) {
            setMessage({ type: 'danger', text: 'Konfirmasi password tidak cocok.' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/user/settings/password', passwords);
            setMessage({ type: 'success', text: response.data.message });
            setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Gagal mengubah password.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    // Default avatar if none
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=random&color=fff&size=150`;

    return (
        <Container className="py-4 py-md-5">
            <h2 className="fw-bold mb-4">Pengaturan Akun</h2>
            
            {message.text && (
                <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>
                    {message.text}
                </Alert>
            )}

            <Row>
                {/* Left Sidebar (Nav) */}
                <Col lg={3} md={4} className="mb-4">
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                        <Card.Body className="p-0">
                            <Nav className="flex-column custom-pills">
                                <Nav.Link 
                                    active={activeTab === 'personal'} 
                                    onClick={() => setActiveTab('personal')}
                                    className="d-flex align-items-center py-3 px-4 border-bottom rounded-top-12"
                                >
                                    <User size={18} className="me-3" /> Informasi Pribadi
                                </Nav.Link>
                                <Nav.Link 
                                    active={activeTab === 'interests'} 
                                    onClick={() => setActiveTab('interests')}
                                    className="d-flex align-items-center py-3 px-4 border-bottom"
                                >
                                    <Tag size={18} className="me-3" /> Minat & Kategori
                                </Nav.Link>
                                <Nav.Link 
                                    active={activeTab === 'security'} 
                                    onClick={() => setActiveTab('security')}
                                    className="d-flex align-items-center py-3 px-4 rounded-bottom-12"
                                >
                                    <Lock size={18} className="me-3" /> Keamanan Akun
                                </Nav.Link>
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Content */}
                <Col lg={9} md={8}>
                    <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', minHeight: '400px' }}>
                        <Card.Body className="p-4 p-md-5">
                            
                            {/* TAB: PERSONAL */}
                            {activeTab === 'personal' && (
                                <Form onSubmit={submitProfile}>
                                    <h5 className="fw-bold mb-4">Informasi Pribadi & Kampus</h5>
                                    
                                    <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                                        <div className="position-relative me-4">
                                            <img 
                                                src={avatarPreview || defaultAvatar} 
                                                alt="Avatar" 
                                                className="rounded-circle object-fit-cover border shadow-sm"
                                                style={{ width: '100px', height: '100px', backgroundColor: '#f8f9fa' }}
                                                onError={(e) => { e.target.src = defaultAvatar }}
                                            />
                                            <OverlayTrigger placement="bottom" overlay={<Tooltip>Ganti Foto (Max 2MB)</Tooltip>}>
                                                <div 
                                                    className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow"
                                                    style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                                                    onClick={handleAvatarClick}
                                                >
                                                    <Camera size={16} />
                                                </div>
                                            </OverlayTrigger>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                className="d-none" 
                                                accept="image/jpeg, image/png, image/jpg" 
                                                onChange={handleFileChange} 
                                            />
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">Foto Profil</h6>
                                            <p className="text-muted small mb-0">Format JPG/PNG maksimal 2MB. Foto akan terlihat secara publik jika profil Anda diakses.</p>
                                        </div>
                                    </div>

                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="6" className="mb-3 mb-md-0">
                                            <Form.Label className="fw-semibold small">Nama Lengkap</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="name"
                                                value={profileData.name} 
                                                onChange={handleProfileChange} 
                                                required 
                                            />
                                        </Form.Group>
                                        <Form.Group as={Col} md="6">
                                            <Form.Label className="fw-semibold small">Email (Read-Only)</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                value={profileData.email} 
                                                disabled 
                                                className="bg-light"
                                            />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-4 pb-3 border-bottom">
                                        <Form.Group as={Col} md="6">
                                            <Form.Label className="fw-semibold small">Nomor WhatsApp</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                name="phone"
                                                value={profileData.phone} 
                                                onChange={handleProfileChange} 
                                                placeholder="Contoh: 08123456789"
                                            />
                                        </Form.Group>
                                    </Row>

                                    <h6 className="fw-bold mb-3">Data Akademik</h6>
                                    <Row className="mb-4">
                                        <Form.Group as={Col} md="12">
                                            <Form.Label className="fw-semibold small">Asal Universitas / Institusi</Form.Label>
                                            <Form.Select 
                                                name="university_id"
                                                value={profileData.university_id || ''}
                                                onChange={handleProfileChange}
                                            >
                                                <option value="">Pilih Kampus...</option>
                                                {institutions.map(inst => (
                                                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Row>

                                    <div className="d-flex justify-content-end mt-4">
                                        <Button variant="primary" type="submit" disabled={saving} className="rounded-pill px-4">
                                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </Form>
                            )}

                            {/* TAB: INTERESTS */}
                            {activeTab === 'interests' && (
                                <div>
                                    <h5 className="fw-bold mb-4">Pengaturan Minat (Interest Tagging)</h5>
                                    <p className="text-muted mb-4">Pilih topik dan kategori event yang Anda sukai. Ini membantu kami merekomendasikan event yang sesuai.</p>
                                    
                                    <div className="mb-4 p-4 bg-light rounded-3">
                                        <h6 className="fw-semibold mb-3">Minat Saya Saat Ini:</h6>
                                        {profileData.categories.length > 0 ? (
                                            <div className="d-flex flex-wrap gap-2">
                                                {profileData.categories.map(cat => (
                                                    <Badge 
                                                        key={cat.id} 
                                                        bg="primary" 
                                                        className="px-3 py-2 rounded-pill fw-normal cursor-pointer d-flex align-items-center"
                                                        onClick={() => toggleInterest(cat.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        #{cat.name} <Trash2 size={14} className="ms-2 opacity-75" />
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted small mb-0">Belum ada minat yang dipilih.</p>
                                        )}
                                    </div>

                                    <h6 className="fw-semibold mb-3">Kategori Tersedia:</h6>
                                    <div className="d-flex flex-wrap gap-2 mb-4">
                                        {allCategories.map(cat => {
                                            const isSelected = profileData.categories.some(c => c.id === cat.id);
                                            if (isSelected) return null; // Sembunyikan yang sudah dipilih
                                            
                                            return (
                                                <Badge 
                                                    key={cat.id} 
                                                    bg="white" 
                                                    text="dark"
                                                    border="secondary"
                                                    className="px-3 py-2 border rounded-pill fw-normal shadow-sm"
                                                    onClick={() => toggleInterest(cat.id)}
                                                    style={{ cursor: 'pointer', borderColor: '#dee2e6' }}
                                                >
                                                    + {cat.name}
                                                </Badge>
                                            )
                                        })}
                                    </div>

                                    <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                        <Button variant="primary" onClick={submitProfile} disabled={saving} className="rounded-pill px-4">
                                            {saving ? 'Menyimpan...' : 'Simpan Minat'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === 'security' && (
                                <Form onSubmit={submitPassword}>
                                    <h5 className="fw-bold mb-4">Keamanan Akun</h5>
                                    <p className="text-muted mb-4">Perbarui password Anda secara berkala untuk menjaga keamanan akun.</p>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Password Saat Ini</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="current_password"
                                            value={passwords.current_password}
                                            onChange={handlePasswordChange}
                                            required 
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small">Password Baru</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="new_password"
                                            value={passwords.new_password}
                                            onChange={handlePasswordChange}
                                            required 
                                            minLength={8}
                                        />
                                        <Form.Text className="text-muted">Minimal 8 karakter.</Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold small">Konfirmasi Password Baru</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="new_password_confirmation"
                                            value={passwords.new_password_confirmation}
                                            onChange={handlePasswordChange}
                                            required 
                                            minLength={8}
                                        />
                                    </Form.Group>

                                    <div className="d-flex justify-content-end pt-3 border-top">
                                        <Button variant="danger" type="submit" disabled={saving} className="rounded-pill px-4">
                                            {saving ? 'Memperbarui...' : 'Ubah Password'}
                                        </Button>
                                    </div>
                                </Form>
                            )}

                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .custom-pills .nav-link {
                    color: #495057;
                    transition: all 0.2s;
                }
                .custom-pills .nav-link:hover {
                    background-color: #f8f9fa;
                }
                .custom-pills .nav-link.active {
                    background-color: var(--bs-primary);
                    color: white;
                    font-weight: 600;
                }
                .rounded-top-12 { border-top-left-radius: 12px; border-top-right-radius: 12px; }
                .rounded-bottom-12 { border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </Container>
    );
};

export default ProfileSettings;
