import { getSession } from "next-auth/react";
import { useState } from "react";

const TOPICS = [
  "Autoimmune",
  "Cancer",
  "Diabetes",
  "Digestive Health",
  "Eye Health",
  "General Wellness",
  "Heart Health",
  "Lung Health",
  "Men's Health",
  "Mental Health",
  "Neurological",
  "Skin Health",
];
export default function Dashboard({ user }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const toggleTopic = (topic) => {
    setSelected((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div style={styles.page}>
      {/* Main Content ONLY (no header, no logout) */}
      <main style={styles.main}>
        <div style={styles.card}>
          <h2>Your Health Dashboard</h2>
          <p style={{ marginBottom: 12 }}>
            Choose health topics to personalize your experience.
          </p>

          <button onClick={() => setOpen(true)} style={styles.primaryBtn}>
            Manage Interests
          </button>

          {selected.length > 0 && (
            <div style={styles.tags}>
              {selected.map((t) => (
                <span key={t} style={styles.tag}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Side Panel / Modal */}
      {open && (
        <div style={styles.overlay}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3>Health Interests</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            <div style={styles.list}>
              {TOPICS.map((topic) => (
                <label key={topic} style={styles.item}>
                  <input
                    type="checkbox"
                    checked={selected.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                  />
                  {topic}
                </label>
              ))}
            </div>

            <button
              style={styles.saveBtn}
              onClick={() => {
                setOpen(false);
                console.log("Save to backend:", selected);
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);

  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return {
    props: { user: session.user },
  };
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
  },
  main: {
    padding: 40,
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    maxWidth: 600,
  },
  primaryBtn: {
    marginTop: 16,
    padding: "10px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  tags: {
    marginTop: 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    background: "#e0e7ff",
    padding: "6px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "flex-end",
  },
  panel: {
    width: 360,
    background: "#fff",
    padding: 20,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  list: {
    flex: 1,
    overflowY: "auto",
  },
  item: {
    display: "block",
    marginBottom: 12,
  },
  saveBtn: {
    padding: 12,
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
