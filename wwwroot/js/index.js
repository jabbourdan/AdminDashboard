const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

const menuBar = document.querySelector('.content nav .bx.bx-menu-alt-left');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const toggler = document.getElementById('theme-toggle');
    const body = document.body;

    // Check the current theme from local storage or server-set class
    const currentTheme = localStorage.getItem('theme') || (body.classList.contains('dark') ? 'dark' : 'light');
    toggler.checked = (currentTheme === 'dark');
    if (currentTheme === 'dark') {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }

    toggler.addEventListener('change', function() {
        const theme = this.checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme); // Save theme preference locally
        body.classList.toggle('dark', this.checked); // Toggle dark class immediately

        // Perform a server update without reloading the page
        fetch(`/Home/SetTheme?theme=${theme}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                console.log('Theme updated successfully');
            })
            .catch(error => {
                console.error('Error updating theme:', error);
            });
    });
});
