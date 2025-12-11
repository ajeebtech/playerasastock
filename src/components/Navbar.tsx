import Link from 'next/link';
import styles from '../app/page.module.css';

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <Link href="/" className={styles.navLogo} style={{ textDecoration: 'none' }}>
                <span>moneyball</span>
                <span>ipl</span>
            </Link>
            <div className={styles.navLinks}>
                <Link href="/" className={styles.navLink}>Home</Link>
                <Link href="/data" className={styles.navLink}>formulae</Link>
            </div>
        </nav>
    );
}
