// Mock API service for Authentication & Invitation flow

export interface ValidateInviteResponse {
  valid: boolean;
  email: string;
  tenant_name: string;
  tenant_id: string;
  role: string;
}

export const authApi = {
  // Validate the invitation code
  validateInvite: async (code: string): Promise<ValidateInviteResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (code === 'valid-code-123') {
      return {
        valid: true,
        email: 'consultant@golfsaudi.com',
        tenant_name: 'GOLF SAUDI Co.',
        tenant_id: 'golf-saudi', // Matches the ID in tenant-store.ts
        role: 'Safety Officer',
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
    
    if (payload.code !== 'valid-code-123') {
      throw new Error('Security Error: Code invalid.');
    }
    
    return { success: true };
  }
};
