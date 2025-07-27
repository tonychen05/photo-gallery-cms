package com.photos.gallery.component;

import org.springframework.beans.factory.annotation.Value;
import com.photos.gallery.entity.Photo;
import com.photos.gallery.repository.PhotoRepository;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.time.ZoneId;
import java.util.UUID;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;


@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoRepository photoRepository;
    private final String uploadDir;

    public PhotoController(PhotoRepository photoRepository, @Value("${file.upload-dir}") String uploadDir) {
        this.photoRepository = photoRepository;
        this.uploadDir = uploadDir;
    }

    @PostMapping
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") MultipartFile file,
                                         @RequestParam String title,
                                         @RequestParam String description,
                                         @RequestParam Boolean isPublic) {
        Photo photo = new Photo();
        photo.setTitle(title);
        photo.setDescription(description);
        photo.setIsPublic(isPublic);

        Photo savedPhoto = null;
        try {
            // 1. Extract metadata
            extractMetadata(photo, file);

            // 2. Save metadata and generate ID
            savedPhoto = photoRepository.save(photo);

            // 3. Construct filename and save file
            String fileName = savedPhoto.getId() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(fileName);
            try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                fos.write(file.getBytes());
            }

            // 4. Update entity with file path and save again
            savedPhoto.setFilePath(fileName);
            Photo finalPhoto = photoRepository.save(savedPhoto);

            return ResponseEntity.ok(finalPhoto);

        } catch (Exception e) {
            // If any part fails, delete the orphaned DB record if it was created
            if (savedPhoto != null && savedPhoto.getId() != null) {
                photoRepository.deleteById(savedPhoto.getId());
            }
            return ResponseEntity.badRequest().body("Could not upload photo: " + e.getMessage());
        }
    }

    private void extractMetadata(Photo photo, MultipartFile file) throws Exception {
        File convFile = convertToFile(file);
        Metadata metadata = ImageMetadataReader.readMetadata(convFile);

        ExifIFD0Directory ifd0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
        ExifSubIFDDirectory exif = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);

        if (ifd0 != null) {
            photo.setCameraMake(ifd0.getString(ExifIFD0Directory.TAG_MAKE));
            photo.setCameraModel(ifd0.getString(ExifIFD0Directory.TAG_MODEL));
        }

        if (exif != null) {
            photo.setIso(exif.getInteger(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT));
            photo.setAperture(exif.getDescription(ExifSubIFDDirectory.TAG_FNUMBER));
            photo.setShutterSpeed(exif.getDescription(ExifSubIFDDirectory.TAG_EXPOSURE_TIME));
            photo.setFocalLength(exif.getDescription(ExifSubIFDDirectory.TAG_FOCAL_LENGTH));
            if (exif.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL) != null) {
                photo.setTakenAt(exif.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL)
                        .toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
            }
        }

        // It's important to close the input stream before deleting the file
        try {
            convFile.delete();
        } catch (Exception e) {
            // Log the exception
        }
    }

    private File convertToFile(MultipartFile multipartFile) throws IOException {
        File convFile = File.createTempFile("upload-", ".tmp");
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(multipartFile.getBytes());
        }
        return convFile;
    }

    @GetMapping
    public List<Photo> listPhotos(@RequestParam(defaultValue = "false") boolean publicOnly) {
        if (publicOnly) {
            return photoRepository.findByIsPublicTrue();
        } else {
            return photoRepository.findAll();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhoto(@PathVariable UUID id) {
        return photoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhoto(@PathVariable UUID id) {
        if (photoRepository.existsById(id)) {
            photoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<Photo> updatePhoto(@PathVariable UUID id, @RequestBody Photo photoDetails) {
        return photoRepository.findById(id)
                .map(photo -> {
                    photo.setTitle(photoDetails.getTitle());
                    photo.setDescription(photoDetails.getDescription());
                    photo.setIsPublic(photoDetails.getIsPublic());
                    return ResponseEntity.ok(photoRepository.save(photo));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
