import styles from '../page.module.css';
import Navbar from '../../components/Navbar';

export default function FormulaePage() {
    return (
        <main className={styles.page}>
            <Navbar />
            <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                marginTop: '10vh',
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-unbounded), monospace',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                lineHeight: '1.4',
                padding: '2rem',
                border: '2px solid var(--accent-primary)',
                boxShadow: '10px 10px 0px var(--accent-primary)',
                backgroundColor: 'black',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                <p>
                    The data is scraped from <a href="https://vlr.gg" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>vlr.gg</a> and <a href="https://bo3.gg" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>bo3.gg</a>.
                </p>
                <div style={{ margin: '1.5rem 0', height: '2px', background: 'var(--accent-primary)', opacity: 0.5 }}></div>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 51, 0, 0.8)' }}>
                    Data refreshes every 24 hours at 00:30 UTC.
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#666' }}>
                    there is no intention of monetizing this, it's free for everyone to use.
                </p>
            </div>
            <div style={{
                maxWidth: '600px',
                textAlign: 'left',
                marginTop: '3rem',
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-unbounded), monospace',
                fontSize: '0.9rem',
                fontWeight: 'normal',
                lineHeight: '1.6',
                padding: '2rem',
                border: '2px solid var(--accent-primary)',
                boxShadow: '10px 10px 0px var(--accent-primary)',
                backgroundColor: 'black',
                letterSpacing: '0.05em'
            }}>
                <h3 style={{
                    textAlign: 'center',
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    borderBottom: '1px solid var(--accent-primary)',
                    paddingBottom: '0.5rem'
                }}>
                    Architecture & Plans
                </h3>

                <p style={{ marginBottom: '1rem' }}>
                    <strong style={{ textTransform: 'uppercase' }}>Current State:</strong> We have migrated to <strong>Supabase</strong> as our backend. The app now queries a dedicated <code>players</code> table, using 'List Sr. No.' as the primary key for reliable identification. This allows for dynamic updates and better data integrity compared to static CSVs.
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ textTransform: 'uppercase' }}>Considerations:</strong>
                </p>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}>• displaying <strong>Country</strong> instead of Team (implemented).</li>
                    <li style={{ marginBottom: '0.5rem' }}>• optimizing search with server-side filtering.</li>
                    <li style={{ marginBottom: '0.5rem' }}>• potential real-time auction tracking integration.</li>
                </ul>
            </div>
            <div style={{
                maxWidth: '600px',
                textAlign: 'center',
                marginTop: '2rem',
                color: 'var(--accent-primary)',
                fontFamily: 'var(--font-unbounded), monospace',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                lineHeight: '1.4',
                padding: '1.5rem',
                border: '2px solid var(--accent-primary)',
                boxShadow: '10px 10px 0px var(--accent-primary)',
                backgroundColor: 'black',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                <a href="https://x.com/ajeebtech" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>ajeebtech</a> also made <a href="https://vods.space" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>vods.space</a>
            </div>
            <div className={styles.footer}>
                made by
                <a href="https://x.com/ajeebtech" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                    ajeebtech
                </a>
            </div>
        </main>
    );
}
