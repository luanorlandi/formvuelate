import { onMounted, onUnmounted, onUpdated } from 'vue';
export function useActiveSidebarLinks() {
    let rootActiveLink = null;
    let activeLink = null;
    const decode = decodeURIComponent;
    const deactiveLink = (link) => link && link.classList.remove('active');
    const activateLink = (hash) => {
        deactiveLink(activeLink);
        deactiveLink(rootActiveLink);
        activeLink = document.querySelector(`.sidebar a[href="${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            // also add active class to parent h2 anchors
            const rootLi = activeLink.closest('.sidebar > ul > li');
            if (rootLi && rootLi !== activeLink.parentElement) {
                rootActiveLink = rootLi.querySelector('a');
                rootActiveLink && rootActiveLink.classList.add('active');
            }
            else {
                rootActiveLink = null;
            }
        }
    };
    const setActiveLink = () => {
        const sidebarLinks = [].slice.call(document.querySelectorAll('.sidebar a'));
        const anchors = [].slice
            .call(document.querySelectorAll('.header-anchor'))
            .filter((anchor) => sidebarLinks.some((sidebarLink) => sidebarLink.hash === anchor.hash));
        const pageOffset = document.getElementById('app').offsetTop;
        const scrollTop = window.scrollY;
        const getAnchorTop = (anchor) => anchor.parentElement.offsetTop - pageOffset - 15;
        for (let i = 0; i < anchors.length; i++) {
            const anchor = anchors[i];
            const nextAnchor = anchors[i + 1];
            const isActive = (i === 0 && scrollTop === 0) ||
                (scrollTop >= getAnchorTop(anchor) &&
                    (!nextAnchor || scrollTop < getAnchorTop(nextAnchor)));
            if (isActive) {
                const targetHash = decode(anchor.hash);
                history.replaceState(null, document.title, targetHash);
                activateLink(targetHash);
                return;
            }
        }
    };
    const onScroll = debounce(setActiveLink, 100);
    onMounted(() => {
        setActiveLink();
        window.addEventListener('scroll', onScroll);
    });
    onUpdated(() => {
        // sidebar update means a route change
        activateLink(decode(location.hash));
    });
    onUnmounted(() => {
        window.removeEventListener('scroll', onScroll);
    });
}
function debounce(fn, delay) {
    let timeout;
    return () => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(fn, delay);
    };
}
