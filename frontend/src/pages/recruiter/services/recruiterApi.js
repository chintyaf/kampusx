import api from '@/api/axios';

const normalizeSkillItem = (skill) => {
  const score = Number(skill.score || 0);
  return {
    id: skill.id,
    name: skill.name,
    skill: skill.name,
    score,
    proficiency: score,
  };
};

const getCompetencyVerdict = (matchScorePct) => {
  if (matchScorePct >= 75) return 'Sangat Direkomendasikan (Highly Qualified)';
  if (matchScorePct >= 50) return 'Potensial (Good Match)';
  return 'Perlu Penyesuaian (Under-Qualified)';
};

const mapJobMatchCandidate = (member, requiredSkills, hasNamedSkills) => {
  const rawScore = Number(member.match_score || 0);
  const matchScorePct = Number((rawScore * 100).toFixed(1));
  const matchedSkills = (member.matched_skills || []).map(normalizeSkillItem);
  const otherSkills = (member.other_skills || []).map(normalizeSkillItem);

  const matchedIdSet = new Set(matchedSkills.map((s) => Number(s.id)));
  const unmetSkills = hasNamedSkills
    ? requiredSkills
      .filter((s) => typeof s === 'object' && !matchedIdSet.has(Number(s.id)))
      .map((s) => s.name)
    : [];

  return {
    candidate_id: member.id,
    name: member.name,
    email: member.email,
    match_score: rawScore,
    match_score_pct: matchScorePct,
    matched_skills: matchedSkills,
    other_skills: otherSkills,
    unmet_skills: unmetSkills,
    competency_verdict: getCompetencyVerdict(matchScorePct),
  };
};

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
   * Mengambil daftar skill publik dari database untuk Job Matching
   * GET /api/public/skills
   */
  async getPublicSkills() {
    try {
      const response = await api.get('/public/skills');
      const data = response.data?.data ?? response.data;
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
      };
    } catch (error) {
      console.error('Error fetching public skills:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Gagal memuat daftar skill.',
        data: [],
      };
    }
  },

  /**
   * Menjalankan pencocokan kualifikasi pekerjaan menggunakan Cosine Similarity
   * POST /api/job-matching/search
   */
  async runSkillMatch({ job_title, required_skills }) {
    if (!required_skills || required_skills.length === 0) {
      return { success: false, message: 'Kualifikasi keahlian tidak boleh kosong.' };
    }

    const skillIds = required_skills
      .map((s) => (typeof s === 'object' ? Number(s.id) : Number(s)))
      .filter((id) => !Number.isNaN(id) && id > 0);

    if (skillIds.length === 0) {
      return { success: false, message: 'Pilih minimal satu keahlian yang valid.' };
    }

    try {
      const response = await api.post('/job-matching/search', {
        required_skills: skillIds,
      });

      const results = response.data?.results || [];
      const hasNamedSkills = required_skills.some((s) => typeof s === 'object' && Boolean(s.name));
      const candidates = results.map((member) =>
        mapJobMatchCandidate(member, required_skills, hasNamedSkills)
      );

      return {
        success: true,
        data: {
          job_title: job_title || 'Posisi Kualifikasi',
          total_members: response.data?.total_members ?? candidates.length,
          highest_match_score: response.data?.highest_match_score ?? 0,
          candidates,
        },
      };
    } catch (error) {
      console.error('Error running skill match:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Gagal mencari kandidat yang cocok.',
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
