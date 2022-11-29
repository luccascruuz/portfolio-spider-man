const header = document.querySelector("header");

window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", window.scrollY > 100)
    ativaNoScroll()
});

function ativaNoScroll() {
    document.querySelectorAll('img').forEach((img, index) => {
        if(img.getBoundingClientRect().top < window.innerHeight){
            img.src = img.getAttribute('data-src')
        }
    })
}

const menu = document.querySelector('#menu-icon');
const navlist = document.querySelector('.navlist');

menu.addEventListener('click', () => {
    menu.classList.toggle('bx-x');
    navlist.classList.toggle('open');
})

window.onscroll = () => {
    menu.classList.remove('bx-x');
    navlist.classList.remove('open')
}