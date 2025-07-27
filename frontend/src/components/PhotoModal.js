import React from 'react';
import { Modal, Image, Col, Row } from 'react-bootstrap';

const PhotoModal = ({ photo, onHide }) => {
    if (!photo) return null;

    const formatMetadata = () => {
        const parts = [];
        if (photo.cameraMake && photo.cameraModel) {
            parts.push(`${photo.cameraMake} ${photo.cameraModel}`);
        }
        if (photo.aperture) {
            parts.push(photo.aperture);
        }
        if (photo.shutterSpeed) {
            parts.push(photo.shutterSpeed);
        }
        if (photo.focalLength) {
            parts.push(photo.focalLength);
        }
        if (photo.iso) {
            parts.push(`ISO${photo.iso}`);
        }
        return parts.join(' ');
    };

    return (
        <Modal show={!!photo} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{photo.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <Image src={`http://localhost:8080/uploads/${photo.filePath}`} fluid />
                    </Col>
                    <Col md={4}>
                        <h5>{photo.description}</h5>
                        <p className="text-muted">{formatMetadata()}</p>
                        <p className="text-muted">{new Date(photo.takenAt).toLocaleString()}</p>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
};

export default PhotoModal;
