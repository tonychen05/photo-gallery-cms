import React, { useState, useEffect } from 'react';
import PhotoService from '../services/PhotoService';
import { Card, Container, Row, Col } from 'react-bootstrap';
import PhotoModal from '../components/PhotoModal';

const HomePage = () => {
    const [photos, setPhotos] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    useEffect(() => {
        const fetchPhotos = () => {
            PhotoService.getPhotos(true).then(response => {
                setPhotos(response.data);
            });
        };

        fetchPhotos(); // Initial fetch
        const interval = setInterval(fetchPhotos, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
    };

    const handleCloseModal = () => {
        setSelectedPhoto(null);
    };

    return (
        <Container>
            <h1 className="my-4">Photo Gallery</h1>
            <Row>
                {photos.map(photo => (
                    <Col key={photo.id} sm={12} md={6} lg={4} className="mb-4">
                        <Card onClick={() => handlePhotoClick(photo)} style={{ cursor: 'pointer' }}>
                            <Card.Img variant="top" src={`http://localhost:8080/uploads/${photo.filePath}`} />
                            <Card.Body>
                                <Card.Title>{photo.title}</Card.Title>
                                <Card.Text>{photo.description}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <PhotoModal photo={selectedPhoto} onHide={handleCloseModal} />
        </Container>
    );
};

export default HomePage;
