'use client';

import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import IntroSplash from "@/components/IntroSplash";
import GraphContainer from "@/components/GraphContainer";
import { useState } from "react";

const GRAPH_TYPES = ['OVERVIEW', 'TRENDS', 'STATS'] as const;
type GraphType = typeof GRAPH_TYPES[number];

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [graphType, setGraphType] = useState<GraphType>('OVERVIEW');
  const [error, setError] = useState<string | null>(null);

  const handlePlayerSelect = async (player: any) => {
    setSelectedPlayer(player);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stats?name=${encodeURIComponent(player.name)}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      setPlayerStats(result.data);
    } catch (e) {
      console.error("Failed to fetch stats", e);
      setError("Failed to load player data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPlayer(null);
    setPlayerStats(null);
    setGraphType('OVERVIEW');
    setError(null);
  };

  return (
    <div className={styles.page}>
      <IntroSplash />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.searchContainer}>
          <SearchAutocomplete
            placeholder="Search player..."
            onSelect={handlePlayerSelect}
            activeColor="#2563EB"
          />

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {selectedPlayer && (
            <>
              <button className={styles.resetButton} onClick={handleReset}>
                RESET
              </button>

              {playerStats?.info && (
                <div className={styles.infoStrip}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Age</span>
                    <span className={styles.infoValue}>{playerStats.info.age}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Specialism</span>
                    <span className={styles.infoValue}>{playerStats.info.specialism}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>IPL Team '25</span>
                    <span className={`${styles.infoValue} ${styles.highlight}`}>
                      {playerStats.info.ipl.team_2025}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={styles.infoValue}>{playerStats.info.ipl.status_2025}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Price</span>
                    <span className={styles.infoValue}>{playerStats.info.ipl.reserve_price}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Caps (T/ODI/T20)</span>
                    <span className={styles.infoValue}>
                      {playerStats.info.caps.test}/{playerStats.info.caps.odi}/{playerStats.info.caps.t20}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Type</span>
                    <span className={styles.infoValue}>{playerStats.info.ipl.cua_status}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {selectedPlayer && (
          <div className={styles.dashboard}>
            <div className={styles.graphHeader}>
              <h2 className={styles.playerName}>{selectedPlayer.name}</h2>
              <div className={styles.toggleGroup}>
                {GRAPH_TYPES.map(type => (
                  <button
                    key={type}
                    className={`${styles.toggleButton} ${graphType === type ? styles.activeToggle : ''}`}
                    onClick={() => setGraphType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.chartContainer}>
                {loading ? (
                  <div className={styles.loadingText}>Loading Data...</div>
                ) : (
                  <GraphContainer
                    data={playerStats}
                    graphType={graphType}
                    color="#2563EB"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedPlayer && !loading && (
          <div className={styles.emptyState} style={{ gridColumn: 2 }}>
            <p>Select a player to analyze</p>
          </div>
        )}
      </main>

      <div className={styles.footer}>
        made by
        <a href="https://x.com/ajeebtech" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
          ajeebtech
        </a>
      </div>
    </div >
  );
}
