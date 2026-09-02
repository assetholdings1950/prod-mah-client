type ApiEndPoints = {
    contact: string;
    auth: {
        signin: string;
        refresh: string;
        logout: string;
        forgotPassword: string;
        resendOtp: string;
        verifyOtp: string;
        submitKyc: string;
        approveKyc: (id: string) => string;
        rejectKyc: (id: string) => string;
        bulkApproveKyc: string;
        bulkRejectKyc: string;
    };
    cloudinary: {
        signature: string;
    };
    investmentPlans: {
        getList: (
            page: string,
            limit: string,
            search: string,
            category?: string,
            status?: string,
            riskLevel?: string
        ) => string;
        getById: (id: string) => string;
    };
    clients: {
        getById: (id: string) => string;
        bankDetails: {
            getList: (clientId: string) => string;
            add: string;
            update: string;
            delete: (id: string) => string;
        };
        wallets: {
            getList: (clientId: string) => string;
            add: string;
            update: string;
            delete: (id: string) => string;
        };
    };
    transactions: {
        fundBalances: (userId: string, userModel: string) => string;
    };
    consultant: {
        submit: string;
        my: string;
    };
    consult: {
        sendOtp: string;
        verifyOtp: string;
    };
};

export const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const BACKEND_ENDPOINTS = {
    clients: {
        getById: (id: string) => `/clients/${id}`,
        update: "/clients/update",
        bankDetails: {
            getList: (clientId: string) => `/clients/${clientId}/bank-details`,
            add: "/clients/bank-details",
            update: "/clients/bank-details/update",
            delete: (id: string) => `/clients/bank-details/${id}`,
        },
        wallets: {
            getList: (clientId: string) => `/clients/${clientId}/wallets`,
            add: "/clients/wallets",
            update: "/clients/wallets/update",
            delete: (id: string) => `/clients/wallets/${id}`,
        },
    },
    paymentMethods: {
        list: "/payment-methods",
    },
    deposits: {
        create: "/deposits",
        my: "/deposits/my",
        getById: (id: string) => `/deposits/my/${id}`,
    },
    withdrawals: {
        create: "/withdrawals",
        my: "/withdrawals/my",
        getById: (id: string) => `/withdrawals/my/${id}`,
    },
    transactions: {
        fundBalances: (userId: string, userModel: string) =>
            `/transactions/admin/fund-balances?userId=${userId}&userModel=${userModel}`,
        client: "/transactions/client",
    },
    countries: {
        list: "/countries",
    },
    planCharges: {
        getByPlanId: (planId: string) => `/plan-charges/${planId}`,
    },
    portfolio: {
        confirm:   "/portfolio/confirm",
        create:    "/portfolio/create",
        my:        "/portfolio/my",
        getById:   (id: string) => `/portfolio/${id}`,
        paySip:    (id: string) => `/portfolio/${id}/pay-sip`,
        claimMaturity:  (id: string) => `/portfolio/${id}/claim-maturity`,
        earlyExit:      (id: string) => `/portfolio/${id}/early-exit`,
        claimMonthly:   (id: string) => `/portfolio/${id}/claim-monthly`,
    },
    accountForms: {
        submit: "/account-forms",
        me: "/account-forms/me",
        pdf: "/account-forms/me/pdf",
    },
    jobs: {
        list: "/jobs",
    },
    fundTrustReports: {
        public: "/fund-trust-reports/public",
    },
    hiring: {
        applications: "/hiring/applications",
    },
    consultant: {
        submit: "/consultant",
        my: "/consultant/my",
    },
    consult: {
        sendOtp: "/consult/send-otp",
        verifyOtp: "/consult/verify-otp",
    },
};

export const API_ENDPOINTS: ApiEndPoints = {
    contact: "/contact",
    auth: {
        signin: "/clients/sign-in",
        refresh: "/clients/refresh",
        logout: "/clients/logout",
        forgotPassword: "/clients/forgot-password",
        resendOtp: "/clients/resend-otp",
        verifyOtp: "/clients/verify-otp",
        submitKyc: "/clients/submit-kyc",
        approveKyc: (id) => `/clients/approve-kyc/${id}`,
        rejectKyc: (id) => `/clients/reject-kyc/${id}`,
        bulkApproveKyc: "/clients/bulk-approve-kyc",
        bulkRejectKyc: "/clients/bulk-reject-kyc",
    },
    cloudinary: {
        signature: "/cloudionary",
    },
    investmentPlans: {
        getList: (page, limit, search, category?, status?, riskLevel?) => {
            const p = new URLSearchParams({ page, limit, search });
            if (category)  p.set("category",  category);
            if (status)    p.set("status",    status);
            if (riskLevel) p.set("riskLevel", riskLevel);
            return `/investment-plans?${p.toString()}`;
        },
        getById: (id) => `/investment-plans/${id}`,
    },
    clients: {
        getById: (id) => `/api/clients/${id}`,
        bankDetails: {
            getList: (clientId) => `/api/clients/bank-details?clientId=${clientId}`,
            add: "/api/clients/bank-details",
            update: "/api/clients/bank-details/update",
            delete: (id) => `/api/clients/bank-details/delete?id=${id}`,
        },
        wallets: {
            getList: (clientId) => `/api/clients/wallets?clientId=${clientId}`,
            add: "/api/clients/wallets",
            update: "/api/clients/wallets/update",
            delete: (id) => `/api/clients/wallets/delete?id=${id}`,
        },
    },
    transactions: {
        fundBalances: (userId, userModel) =>
            `/api/transactions/fund-balances?userId=${userId}&userModel=${userModel}`,
    },
    consultant: {
        submit: "/api/consultant",
        my: "/api/consultant/my",
    },
    consult: {
        sendOtp: "/api/consult/send-otp",
        verifyOtp: "/api/consult/verify-otp",
    },
};
