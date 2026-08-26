// ===== Zoxa — Supabase Admin Client (Legacy) =====
// تم الانتقال إلى Neon. هذا الملف للإشارة فقط.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = {
  from: (table: string) => ({
    select: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
    order: () => ({ data: null, error: null }),
    limit: () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}
