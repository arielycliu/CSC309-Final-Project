import { API_BASE, getAuthHeaders } from "./AuthGetter";

export const updateUserProfile = async (formData, avatarFile = null) => {
    const formPayload = new FormData();
    
    if (formData.name) {
        formPayload.append('name', formData.name);
    }
    if (formData.email) {
        formPayload.append('email', formData.email);
    }
    if (formData.birthday) {
        formPayload.append('birthday', formData.birthday);
    }
    if (avatarFile) {
        formPayload.append('avatar', avatarFile);
    }

    const response = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: formPayload
    });

    if (!response.ok) {
        const error = await response.json();
        throw error;
    }

    return await response.json();
};

export const updatePassword = async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE}/users/me/password`, {
        method: 'PATCH',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old: oldPassword, new: newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw error;
    }

    return await response.json();
};
