// POP-UP

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentImageIndex = 0;
    const images = document.querySelectorAll('.padding-img img, .imagesdescr img');

    images.forEach((img, index) => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImage.src = this.src;
            currentImageIndex = index;
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    prevBtn.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
        modalImage.src = images[currentImageIndex].src;
    });

    nextBtn.addEventListener('click', function() {
        currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
        modalImage.src = images[currentImageIndex].src;
    });

    // Close the modal when clicking outside the image area
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Prevent the modal from closing when clicking inside the image or navigation buttons
    modalImage.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    prevBtn.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    nextBtn.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    closeBtn.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close the modal when clicking outside the image area
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});