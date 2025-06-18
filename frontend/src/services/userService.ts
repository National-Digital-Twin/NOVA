export interface UserData {
    username: string;
    email: string;
    role: string;
}

export interface LogoutResponse {
    success: boolean;
    redirectUrl: string;
}

export const userService = {
    async getUserData(): Promise<UserData> {
        const USER_DATA_URL = import.meta.env.VITE_USER_DATA_URL;

        try {
            const response = await fetch(USER_DATA_URL);
            if (!response.ok) {
                console.error('Error fetching user data:', response.statusText);
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch user data');
        }
    },

    async logout(): Promise<LogoutResponse> {
        const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL;

        try {
            const response = await fetch(LOGOUT_URL);

            if (!response.ok) {
                console.error('Error logging out:', response.statusText);
                throw new Error('Failed to logout');
            }

            const data: LogoutResponse = await response.json();

            if (!data.redirectUrl) {
                throw new Error('Missing redirectUrl in logout response');
            }

            sessionStorage.clear();
            window.location.href = data.redirectUrl;
            return data;
        } catch (error) {
            console.error('Failed to logout:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to logout');
        }
    },
};
