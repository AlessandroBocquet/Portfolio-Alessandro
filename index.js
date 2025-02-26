document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const btn = document.querySelector('.btn');

    burgerMenu.addEventListener('click', function() {
        burgerMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    dropbtn.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.dropdown')) {
            dropdownContent.style.display = 'none';
        }
    });

    btn.addEventListener('mousemove', function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
    });

    btn.addEventListener('mouseleave', function() {
        btn.style.setProperty('--x', '50%');
        btn.style.setProperty('--y', '50%');
    });

    // New dropdown hover functionality
    const dropdown = document.querySelector('.dropdown');
    let timeout;

    dropdown.addEventListener('mouseover', () => {
        clearTimeout(timeout);
        dropdownContent.style.display = 'block';
        dropdownContent.style.opacity = '1';
        dropdownContent.style.visibility = 'visible';
    });

    dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            dropdownContent.style.display = 'none';
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
        }, 300);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const currentYearElement = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    currentYearElement.textContent = currentYear;


    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
    let timeout;

    dropdown.addEventListener('mouseover', () => {
        clearTimeout(timeout);
        dropdownContent.style.display = 'block';
        dropdownContent.style.opacity = '1';
        dropdownContent.style.visibility = 'visible';
    });

    dropdown.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            dropdownContent.style.display = 'none';
            dropdownContent.style.opacity = '0';
            dropdownContent.style.visibility = 'hidden';
        }, 300); 
    });
});