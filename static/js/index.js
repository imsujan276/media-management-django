$(document).ready(function() {
    const dropZone = $('#dropZone');
    const fileInput = $('#fileInput');
    const preview = $('#preview');
    const uploadButton = $('#uploadButton');
    const loadingSpinner = $('#loadingSpinner');
    const errorDiv = $('#errorDiv');
    const mediaItems = $('#mediaItems');

    const csrfToken = $('#csrfToken').val();
    let isFileInputClick = false;

    function showToast(title, text, error = false) {
        $.toast({
            heading: title,
            text: text,
            showHideTransition: 'slide',
            icon: error ? 'error' : 'success',
            position: 'top-right'
        });
    }

    function showLoader() {
        loadingSpinner.removeClass('d-none');
    }

    function hideLoader() {
        loadingSpinner.addClass('d-none');
    }

    dropZone.on('click', function(e) {
        if (!isFileInputClick) {
            fileInput.click();
        }
        isFileInputClick = false;
    });

    fileInput.on('click', function() {
        isFileInputClick = true;
    });

    dropZone.on('dragover', function(e) {
        e.preventDefault();
        dropZone.addClass('dragover');
    });

    dropZone.on('dragleave', function() {
        dropZone.removeClass('dragover');
    });

    dropZone.on('drop', function(e) {
        e.preventDefault();
        dropZone.removeClass('dragover');
        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.on('change', function() {
        const files = this.files;
        handleFiles(files);
    });

    // Display selected files in preview
    function handleFiles(files) {
        preview.empty();
        errorDiv.empty();
        
        if (files.length > 0) {
            uploadButton.removeClass('d-none');
        } else {
            uploadButton.addClass('d-none');
        }
    
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const [fileType, extension] = file.type.split('/');
            const hasAllowedExtension = window.allowed_extensions.includes(extension.toLowerCase());
            const fileSizeFormatted = formatFileSize(file.size);
            const commonCardBody = `
                <div class="card-body">
                    <h6 class="card-title">${file.name} <span> Size: ${fileSizeFormatted} </span></h6>
                    <button class="btn btn-danger remove-file" data-file-index="${i}" title="Remove"><i class="fas fa-trash-alt"></i></button>
                </div>`;
    
            let previewElement;
    
            if (fileType === 'image' && hasAllowedExtension) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewElement = `
                        <div class="col-md-4 preview-card">
                            <div class="card mb-4">
                                <img src="${e.target.result}" class="card-img-top" alt="${file.name}" style="height: 200px; object-fit: cover;">
                                ${commonCardBody}
                            </div>
                        </div>`;
                    preview.append(previewElement);
                };
                reader.readAsDataURL(file);
            } else if (fileType === 'audio' && hasAllowedExtension) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewElement = `
                        <div class="col-md-4 preview-card">
                            <div class="card mb-4">
                                <audio controls class="card-img-top">
                                    <source src="${e.target.result}" type="${file.type}">
                                    Your browser does not support the audio element.
                                </audio>
                                ${commonCardBody}
                            </div>
                        </div>`;
                    preview.append(previewElement);
                };
                reader.readAsDataURL(file);
            } else if (fileType === 'video' && hasAllowedExtension) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.addEventListener('loadeddata', function() {
                        video.currentTime = 1; // Capture a frame at 1 second
                    });
                    video.addEventListener('seeked', function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const thumbnail = canvas.toDataURL('image/png');
                        previewElement = `
                            <div class="col-md-4 preview-card">
                                <div class="card mb-4">
                                    <img src="${thumbnail}" class="card-img-top" alt="${file.name}" style="height: 200px; object-fit: cover;">
                                    ${commonCardBody}
                                </div>
                            </div>`;
                        preview.append(previewElement);
                    });
                };
                reader.readAsDataURL(file);
            } else {
                previewElement = `
                    <div class="col-md-4 preview-card">
                        <div class="card mb-4">
                            <div class="card-body">
                                <h6 class="card-title">${file.name}</h6>
                                <button class="btn btn-danger remove-file" data-file-index="${i}" title="Remove"><i class="fas fa-trash-alt"></i></button>
                            </div>
                            <div class="card-footer text-muted">
                                <div class="alert-danger">File type not allowed: ${extension}</div>
                            </div>
                        </div>
                    </div>`;
                preview.append(previewElement);
            }
        }
    }

    // Remove file from preview
    $(document).on('click', '.remove-file', function() {
        const fileIndex = $(this).data('file-index');
        const files = fileInput[0].files;
        const dataTransfer = new DataTransfer();
        for (let i = 0; i < files.length; i++) {
            if (i !== fileIndex) {
                dataTransfer.items.add(files[i]);
            }
        }
        fileInput[0].files = dataTransfer.files;
        $(this).closest('.col-md-4').remove();
        if (fileInput[0].files.length === 0) {
            uploadButton.addClass('d-none');
        }
    });

    // Upload files to the server
    uploadButton.on('click', function() {
        errorDiv.empty();
        const formData = new FormData();
        const files = fileInput[0].files;
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        if (files.length === 0) {
            showToast('Error', 'Please select a file to upload.', true);
            return;
        }
        if(files.length > window.max_allowed_files ) {
            showToast('Error', `You can only upload ${window.max_allowed_files} files at a time.`, true);
            return;
        }
        showLoader();

        $.ajax({
            url: '/api/upload_files/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                hideLoader();
                if(response.error) {
                    showToast('Error', response.message, true);
                    return;
                }
                showToast('Success', response.message);
                if (response?.invalid_file_errors) {
                    response.invalid_file_errors.forEach(function(error) {
                        for (const [fileName, errorMessage] of Object.entries(error)) {
                            errorDiv.append(`<div class="alert alert-danger" role="alert">${fileName}: ${errorMessage}</div>`);
                        }
                    });
                }
                preview.empty();
                fileInput.val('');
                uploadButton.addClass('d-none');
                fetchMediaList();
            },
            error: function(xhr, status, error) {
                hideLoader();
                showToast('Error', 'Failed to upload files. Please try again.', true);
            }
        });
    });

    // Fetch media list from the server
    function fetchMediaList() {
        showLoader();
        $.ajax({
            url: '/api/media_list/',
            type: 'GET',
            success: function(response) {
                hideLoader();
                mediaItems.empty();
                
                response.forEach(function(media) {
                    let mediaElement;
                    const commonCardBody = `<div class="card-body">
                                    <h6 class="card-title">${media.file_name}</h6>
                                    <button class="btn btn-primary view-media" data-media='${JSON.stringify(media)}'>View</button>
                                </div>`;
                        
                    if (media.type.startsWith('image')) {
                        mediaElement = `<div class="col-md-4">
                            <div class="card mb-4">
                                <img src="${media.file}" class="card-img-top" alt="${media.file_name}"  style="height: 200px; object-fit: cover;">
                                ${commonCardBody}
                            </div>
                        </div>`;
                    } else if (media.type.startsWith('audio')) {
                        mediaElement = `<div class="col-md-4">
                            <div class="card mb-4">
                                <audio controls class="card-img-top">
                                    <source src="${media.file}" type="${media.type}">
                                    Your browser does not support the audio element.
                                </audio>
                                ${commonCardBody}
                            </div>
                        </div>`;
                    } else if (media.type.startsWith('video')) {
                        mediaElement = `<div class="col-md-4">
                            <div class="card mb-4">
                                <video controls class="card-img-top" style="height: 200px; object-fit: cover;">
                                    <source src="${media.file}" type="${media.type}">
                                    Your browser does not support the video element.
                                </video>
                                ${commonCardBody}
                            </div>
                        </div>`;
                    }
                    mediaItems.append(mediaElement);
                });
            },
            error: function(xhr, status, error) {
                hideLoader();
                showToast('Error', 'Failed to fetch media list. Please try again.', true);
            }
        });
    }

    // View media in modal
    $(document).on('click', '.view-media', function() {
        const media = $(this).data('media');
        $('#mediaModalLabel').text(media.file_name);
        let mediaContent;
        if (media.type.startsWith('image')) {
            mediaContent = `<img src="${media.file}" class="img-fluid" alt="${media.file_name}">`;
        } else if (media.type.startsWith('audio')) {
            mediaContent = `<audio controls class="w-100">
                <source src="${media.file}" type="${media.type}">
                Your browser does not support the audio element.
            </audio>`;
        } else if (media.type.startsWith('video')) {
            mediaContent = `<video controls class="w-100">
                <source src="${media.file}" type="${media.type}">
                Your browser does not support the video element.
            </video>`;
        }
        $('#mediaModalBody').html(mediaContent);
        $('#downloadButton').attr('href', media.file);
        $('#deleteButton').data('media-id', media.id);
        $('#mediaModal').modal('show');
    });

    // Delete media from the server
    $('#deleteButton').on('click', function() {
        const mediaId = $(this).data('media-id');
        showLoader();
        $.ajax({
            url: `/api/delete_media/${mediaId}/`,
            type: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                hideLoader();
                if(response.error){
                    showToast('Error', response.message, true);
                    return;
                }
                showToast('Success', 'Media deleted successfully.');
                $('#mediaModal').modal('hide');
                fetchMediaList();
            },
            error: function(xhr, status, error) {
                hideLoader();
                showToast('Error', 'Failed to delete media. Please try again.', true);
            }
        });
    });

    // Fetch the media list on page load
    fetchMediaList();

    // Format file size in human readable format
    function formatFileSize(size) {
        if (size < 1024) {
            return `${size} Bytes`;
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
    }
});