import api from '@/api/axios';

/**
 * Service API untuk Modul Recruiter View (Domain Brigitta)
 * Menghubungkan frontend ke endpoint Laravel /api/recruiter/* dan /api/blockchain/*
 */

export const recruiterApi = {
  /**
   * Mengambil data agregat metrik dashboard recruiter
   * GET /api/recruiter/dashboard
   */
  async getDashboard() {
    try {
      const response = await api.get('/recruiter/dashboard');
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Gagal memuat data dashboard.',
        data: null,
      };
    } catch (error) {
      console.error('Error fetching recruiter dashboard:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Koneksi ke server gagal.',
        data: null,
      };
    }
  },

  /**
   * Mengambil daftar kandidat mahasiswa dengan filter (search, tier, has_sbt)
   * GET /api/recruiter/candidates
   */
  async getCandidates(params = {}) {
    try {
      const queryParams = {};
      if (params.search && params.search.trim()) {
        queryParams.search = params.search.trim();
      }
      if (params.tier && params.tier !== 'ALL') {
        queryParams.tier = params.tier;
      }
      if (params.has_sbt) {
        queryParams.has_sbt = 'true';
      }
      if (params.page) {
        queryParams.page = params.page;
      }

      const response = await api.get('/recruiter/candidates', { params: queryParams });
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || [],
          meta: response.data.meta || { total: (response.data.data || []).length },
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Gagal memuat kandidat.',
        data: [],
        meta: { total: 0 },
      };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Koneksi gagal.',
        data: [],
        meta: { total: 0 },
      };
    }
  },

  /**
   * Mengambil profil lengkap kandidat mahasiswa dan sertifikat SBT
   * GET /api/recruiter/candidates/{id}
   */
  async getCandidateById(id) {
    if (!id) return { success: false, message: 'ID kandidat tidak valid.' };
    try {
      const response = await api.get(`/recruiter/candidates/${id}`);
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Profil kandidat tidak ditemukan.',
        data: null,
      };
    } catch (error) {
      console.error(`Error fetching candidate ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Gagal memuat profil.',
        data: null,
      };
    }
  },

  /**
   * Menjalankan pencocokan kualifikasi pekerjaan menggunakan Cosine Similarity
   * POST /api/recruiter/skill-match
   */
  async runSkillMatch({ job_title, required_skills, candidate_id = null }) {
    if (!required_skills || required_skills.length === 0) {
      return { success: false, message: 'Kualifikasi keahlian tidak boleh kosong.' };
    }
    try {
      const payload = {
        job_title: job_title || 'Software Engineer',
        required_skills: required_skills,
      };
      if (candidate_id) {
        payload.candidate_id = candidate_id;
      }

      const response = await api.post('/recruiter/skill-match', payload);
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          mode: response.data.mode,
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Gagal menghitung skor kecocokan.',
        data: null,
      };
    } catch (error) {
      console.error('Error running skill match:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Koneksi gagal.',
        data: null,
      };
    }
  },

  /**
   * Verifikasi sertifikat Soulbound Token di ledger Polygon secara zero-trust
   * GET /api/blockchain/verify/{identifier}
   */
  async verifySbt(identifier) {
    if (!identifier) return { success: false, message: 'Token identifier kosong.' };
    try {
      const response = await api.get(`/blockchain/verify/${encodeURIComponent(identifier)}`);
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      return {
        success: false,
        message: response.data?.message || 'Verifikasi on-chain gagal.',
        data: null,
      };
    } catch (error) {
      console.warn(`Verifikasi on-chain identifier ${identifier} gagal:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memvalidasi bukti on-chain.',
        data: null,
      };
    }
  },
};

export default recruiterApi;
