import { API_BASE, getAuthHeaders } from "./AuthGetter";

export const getUsers = async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.name) queryParams.append('name', params.name);
    if (params.role) queryParams.append('role', params.role);
    if (params.verified !== undefined) queryParams.append('verified', params.verified);
    if (params.suspicious !== undefined) queryParams.append('suspicious', params.suspicious);
    if (params.orderByPoints) queryParams.append('orderByPoints', params.orderByPoints);
    
    const response = await fetch(`${API_BASE}/users?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw error;
    }
    
    return await response.json();
};

export const getUserAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    // If it's already a full URL return as-is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }
    // Otherwise, prepend API_BASE
    return `${API_BASE}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

export const patchUser = async (params = {}) => {
    const body = {};
    if (params.name !== undefined) body.name = params.name;
    if (params.email !== undefined) body.email = params.email;
    if (params.verified !== undefined) body.verified = params.verified;
    if (params.suspicious !== undefined) body.suspicious = params.suspicious;
    if (params.role !== undefined) body.role = params.role;

    const response = await fetch(`${API_BASE}/users/${params.userId}`, {
        method: 'PATCH',
        headers: {                  
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw error;
    }

    return await response.json();
};

export const createUser = async (params = {}) => {
    const body = {
        utorid: params.utorid, 
        name: params.name,
        email: params.email,
    };

    const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {                  
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw error;
    }

    return await response.json();
};