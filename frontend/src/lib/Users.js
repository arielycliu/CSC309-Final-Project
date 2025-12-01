import { API_BASE, getAuthHeaders } from "./AuthGetter";

export const getUsers = async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.search) queryParams.append('search', params.search);
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
        throw new Error(error.error || 'Failed to fetch users');
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