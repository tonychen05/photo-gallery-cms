import axios from 'axios';

const API_URL = 'http://localhost:8080/api/photos';

class PhotoService {
    uploadPhoto(file, title, description, isPublic) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('isPublic', isPublic);

        return axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    getPhotos(publicOnly = false) {
        return axios.get(API_URL, {
            params: {
                publicOnly
            }
        });
    }

    getPhoto(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    deletePhoto(id) {
        return axios.delete(`${API_URL}/${id}`);
    }

    updatePhoto(id, photo) {
        return axios.put(`${API_URL}/${id}`, photo);
    }
}

export default new PhotoService();
