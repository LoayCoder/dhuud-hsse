
// Mock API service for Authentication & Invitation flow

export interface ValidateInviteResponse {
  valid: boolean;
  email: string;
  tenant_name: string;
  tenant_id: string;
  role: string;
  existingUser: boolean; // Flag to determine flow (Login vs Register)
}

export const authApi = {
  // Validate the invitation code
  validateInvite: async (code: string): Promise<ValidateInviteResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // SCENARIO 1: Existing Dhuud User -> Redirect to Login
    if (code === 'INVITE-DHUUD-LOGIN') {
      return {
        valid: true,
        email: 'admin@dhuud.com',
        tenant_name: 'Dhuud Platform',
        tenant_id: 'dhuud-admin',
        role: 'Super Admin',
        existingUser: true
      };
    }

    // SCENARIO 2: New Client User (Golf Saudi) -> Show Registration Form
    if (code === 'INVITE-GOLF-SIGNUP') {
      return {
        valid: true,
        email: 'consultant@golfsaudi.com',
        tenant_name: 'GOLF SAUDI Co.',
        tenant_id: 'golf-saudi', // Matches the ID in tenant-store.ts
        role: 'Safety Officer',
        existingUser: false
      };
    }

    // SCENARIO 3: New Dhuud Staff -> Show Registration Form (Blue Branding)
    if (code === 'INVITE-DHUUD-STAFF') {
      return {
        valid: true,
        email: 'new.staff@dhuud.com',
        tenant_name: 'Dhuud Platform',
        tenant_id: 'dhuud-admin',
        role: 'System Administrator',
        existingUser: false
      };
    }

    if (code === 'expired') {
      throw new Error('This invitation link has expired.');
    }

    throw new Error('Invalid invitation code. Please check your link.');
  },

  // Complete registration
  register: async (payload: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In a real app, this would validate against the database
    if (!payload.code) {
      throw new Error('Security Error: Code missing.');
    }
    
    return { success: true };
  }
};
