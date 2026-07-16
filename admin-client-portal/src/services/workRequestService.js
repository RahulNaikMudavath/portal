import axios from "axios";

const API = "http://localhost:5001/api/workrequests";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

export const getWorkRequests = async () => {
    const res = await axios.get(API, getAuthConfig());
    return res.data;
};

export const getWorkRequest = async (id) => {
    const res = await axios.get(
        `${API}/${id}`,
        getAuthConfig()
    );

    return res.data;
};

export const createWorkRequest = async (data) => {
    const res = await axios.post(
        API,
        data,
        getAuthConfig()
    );

    return res.data;
};

export const updateWorkRequest = async (id, data) => {
    const res = await axios.put(
        `${API}/${id}`,
        data,
        getAuthConfig()
    );

    return res.data;
};

export const deleteWorkRequest = async (id) => {
    const res = await axios.delete(
        `${API}/${id}`,
        getAuthConfig()
    );

    return res.data;
};

export const convertWorkRequest = async (id, data) => {
    const res = await axios.post(
        `${API}/${id}/convert`,
        data,
        getAuthConfig()
    );

    return res.data;
};