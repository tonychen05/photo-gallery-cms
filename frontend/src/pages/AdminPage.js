import React, { useState, useEffect } from 'react';
import PhotoService from '../services/PhotoService';
import { Button, Container, Row, Col, Card, Form } from 'react-bootstrap';

const AdminPage = () => {
    const [photos, setPhotos] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        PhotoService.getPhotos().then(response => {
            setPhotos(response.data);
        });
    }, []);

    const handleUpload = (e) => {
        e.preventDefault();
        PhotoService.uploadPhoto(file, title, description, isPublic).then((response) => {
            setPhotos([...photos, response.data]);
            // Clear input fields after successful upload
            setTitle('');
            setDescription('');
            setFile(null);
            setIsPublic(false);
            // Reset the file input visually
            e.target.reset();
        });
    };

    const handleDelete = (id) => {
        PhotoService.deletePhoto(id).then(() => {
            window.location.reload();
        });
    };

    const handleTogglePublic = (photo) => {
        const updatedPhoto = { ...photo, isPublic: !photo.isPublic };
        PhotoService.updatePhoto(updatedPhoto.id, updatedPhoto).then((response) => {
            setPhotos(photos.map(p => p.id === photo.id ? response.data : p));
        });
    };

    return (
        <Container>
            <h1 className="my-4">Admin Panel</h1>
            <Form onSubmit={handleUpload} className="mb-4">
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" onChange={(e) => setTitle(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" onChange={(e) => setDescription(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>File</Form.Label>
                            <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Check type="checkbox" label="Make Public" onChange={(e) => setIsPublic(e.target.checked)} />
                        </Form.Group>
                    </Col>
                </Row>
                <Button type="submit" className="mt-3">Upload</Button>
            </Form>
            <Row>
                {photos.map(photo => (
                    <Col key={photo.id} sm={12} md={6} lg={4} className="mb-4">
                        <Card>
                            <Card.Img variant="top" src={`http://localhost:8080/uploads/${photo.filePath}`} />
                            <Card.Body>
                                <Card.Title>{photo.title}</Card.Title>
                                <Card.Text>{photo.description}</Card.Text>
                                <Form.Check
                                    type="switch"
                                    id={`public-switch-${photo.id}`}
                                    label="Public"
                                    checked={photo.isPublic}
                                    onChange={() => handleTogglePublic(photo)}
                                />
                                <Button variant="danger" onClick={() => handleDelete(photo.id)}>Delete</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default AdminPage;
