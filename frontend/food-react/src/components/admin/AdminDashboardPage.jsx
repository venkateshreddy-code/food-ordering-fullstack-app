import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/ApiService";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [orders, setOrders] = useState([]); // flat list of orders
  const [payments, setPayments] = useState([]); // flat list of payments
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [menuItemsCount, setMenuItemsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const [ordersRes, paymentsRes, activeRes, menusRes] = await Promise.all([
          ApiService.getAllOrders(null, 0, 200),
          ApiService.getAllPayments(),
          ApiService.countTotalActiveCustomers(),
          ApiService.getAllMenus(),
        ]);

        const ordersList = Array.isArray(ordersRes?.data?.content)
          ? ordersRes.data.content
          : [];

        const paymentsList = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];

        const activeCount =
          typeof activeRes?.data === "number" ? activeRes.data : 0;

        const menusCount = Array.isArray(menusRes?.data) ? menusRes.data.length : 0;

        setOrders(ordersList);
        setPayments(paymentsList);
        setActiveCustomers(activeCount);
        setMenuItemsCount(menusCount);
      } catch (e) {
        setErr(e?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const money = (n) => {
    const num = Number(n || 0);
    return `$${num.toFixed(2)}`;
  };

  const totalOrders = orders.length;

  const totalRevenue = useMemo(() => {
    // Use payments (best) because orders can be PENDING but delivered in your sample
    return payments.reduce((sum, p) => {
      const status = String(p?.paymentStatus || "").toUpperCase();
      if (status === "COMPLETED") return sum + Number(p?.amount || 0);
      return sum;
    }, 0);
  }, [payments]);

  const recentOrders = useMemo(() => {
    // your backend already sorts desc by id for /orders/all
    return orders.slice(0, 6);
  }, [orders]);

  const popularItems = useMemo(() => {
    const map = new Map(); // name -> count
    for (const o of orders) {
      const items = Array.isArray(o?.orderItems) ? o.orderItems : [];
      for (const it of items) {
        const name = it?.menu?.name || "Unknown";
        const qty = Number(it?.quantity || 0);
        map.set(name, (map.get(name) || 0) + (qty || 1));
      }
    }
    const arr = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 6);
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts = {};
    for (const o of orders) {
      const s = String(o?.orderStatus || "UNKNOWN");
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    // Build array Jan..Dec
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      label: new Date(2026, i, 1).toLocaleString("en-US", { month: "short" }),
      value: 0,
    }));

    for (const p of payments) {
      const status = String(p?.paymentStatus || "").toUpperCase();
      if (status !== "COMPLETED") continue;

      const dt = p?.paymentDate ? new Date(p.paymentDate) : null;
      if (!dt || Number.isNaN(dt.getTime())) continue;

      const m = dt.getMonth();
      months[m].value += Number(p?.amount || 0);
    }

    return months;
  }, [payments]);

  // ---------- Simple SVG charts (no external libraries) ----------
  const LineChart = ({ data, height = 220 }) => {
    const width = 520;
    const padding = 34;

    const maxVal = Math.max(1, ...data.map((d) => d.value));
    const xStep = (width - padding * 2) / (data.length - 1);

    const points = data
      .map((d, idx) => {
        const x = padding + idx * xStep;
        const y =
          padding + (1 - d.value / maxVal) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (i * (height - padding * 2)) / 4;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e9ecef"
              strokeWidth="1"
            />
          );
        })}

        {/* axis */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#d0d7de"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#d0d7de"
          strokeWidth="1"
        />

        {/* line */}
        <polyline
          fill="none"
          stroke="#4ea5ff"
          strokeWidth="2.5"
          points={points}
        />

        {/* dots */}
        {data.map((d, idx) => {
          const x = padding + idx * xStep;
          const y =
            padding + (1 - d.value / maxVal) * (height - padding * 2);
          return <circle key={idx} cx={x} cy={y} r="3.5" fill="#4ea5ff" />;
        })}

        {/* x labels */}
        {data.map((d, idx) => {
          const x = padding + idx * xStep;
          return (
            <text
              key={idx}
              x={x}
              y={height - 10}
              fontSize="11"
              textAnchor="middle"
              fill="#6b7280"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  const PieChart = ({ counts }) => {
    const entries = Object.entries(counts);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

    const size = 240;
    const r = 80;
    const cx = 110;
    const cy = 120;

    // fixed colors for stable look
    const palette = ["#ff7aa2", "#4ea5ff", "#34c38f", "#f1b44c", "#9b7bff", "#6c757d"];

    let startAngle = -Math.PI / 2;

    const slices = entries.map(([label, value], i) => {
      const frac = value / total;
      const angle = frac * Math.PI * 2;
      const endAngle = startAngle + angle;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const d = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      startAngle = endAngle;

      return {
        label,
        value,
        color: palette[i % palette.length],
        d,
      };
    });

    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: 240, height: 220 }}>
          {slices.map((s) => (
            <path key={s.label} d={s.d} fill={s.color} />
          ))}
        </svg>

        <div style={{ minWidth: 180 }}>
          {slices.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 10,
                  background: s.color,
                  display: "inline-block",
                  borderRadius: 2,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span style={{ color: "#6b7280" }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ---------- UI styles ----------
  const styles = {
    page: { padding: "28px 28px 60px" },
    title: { fontSize: 40, fontWeight: 800, marginBottom: 16 },
    grid4: {
      display: "grid",
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
      gap: 18,
      marginBottom: 20,
    },
    card: {
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 6px 18px rgba(16, 24, 40, 0.06)",
      border: "1px solid #f1f3f5",
      padding: 18,
    },
    cardTitle: { color: "#6b7280", fontWeight: 600, marginBottom: 10 },
    cardValue: { fontSize: 34, fontWeight: 800, marginBottom: 4 },
    cardSub: { color: "#9aa0a6", fontSize: 13 },

    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 18,
      marginBottom: 18,
    },

    sectionTitle: { fontSize: 18, fontWeight: 800, marginBottom: 12 },

    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      background: "#f8f9fa",
      padding: "12px 12px",
      fontSize: 13,
      color: "#495057",
      borderBottom: "1px solid #e9ecef",
    },
    td: {
      padding: "12px 12px",
      borderBottom: "1px solid #e9ecef",
      fontSize: 14,
    },
    badge: (status) => {
      const s = String(status || "").toUpperCase();
      const map = {
        ON_THE_WAY: { bg: "#e7f6ff", fg: "#1366a5" },
        DELIVERED: { bg: "#e7f8ef", fg: "#137a3a" },
        CONFIRMED: { bg: "#efe9ff", fg: "#5a3bd6" },
        FAILED: { bg: "#ffe9e9", fg: "#b42318" },
        CANCELLED: { bg: "#f1f3f5", fg: "#495057" },
        INITIALIZED: { bg: "#fff7e6", fg: "#8a5a00" },
      };
      const c = map[s] || { bg: "#f1f3f5", fg: "#495057" };
      return {
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: c.bg,
        color: c.fg,
      };
    },
    btn: {
      background: "#4ea5ff",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 700,
    },
    error: {
      background: "#fff5f5",
      border: "1px solid #ffd5d5",
      color: "#b42318",
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.title}>Admin Dashboard</div>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.title}>Dashboard Overview</div>

      {err ? <div style={styles.error}>{err}</div> : null}

      {/* TOP CARDS */}
      <div style={styles.grid4}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Orders</div>
          <div style={styles.cardValue}>{totalOrders}</div>
          <div style={styles.cardSub}>All time</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Total Revenue</div>
          <div style={styles.cardValue}>{money(totalRevenue)}</div>
          <div style={styles.cardSub}>All time</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Active Customers</div>
          <div style={styles.cardValue}>{activeCustomers}</div>
          <div style={styles.cardSub}>Recently ordered</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Menu Items</div>
          <div style={styles.cardValue}>{menuItemsCount}</div>
          <div style={styles.cardSub}>Available</div>
        </div>
      </div>

      {/* CHARTS */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Monthly Revenue</div>
          <LineChart data={monthlyRevenue} />
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Order Status Distribution</div>
          <PieChart counts={statusCounts} />
        </div>
      </div>

      {/* TABLES */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Recent Orders</div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((o) => {
                const dateStr = o?.orderDate
                  ? new Date(o.orderDate).toLocaleDateString()
                  : "-";
                const customerName = o?.user?.name || "-";
                const amount = money(o?.totalAmount);

                return (
                  <tr key={o.id}>
                    <td style={styles.td}>#{o.id}</td>
                    <td style={styles.td}>{dateStr}</td>
                    <td style={styles.td}>{customerName}</td>
                    <td style={styles.td}>{amount}</td>
                    <td style={styles.td}>
                      <span style={styles.badge(o?.orderStatus)}>
                        {String(o?.orderStatus || "-")}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button
                        style={styles.btn}
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {recentOrders.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <div style={styles.sectionTitle}>Most Popular Items</div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={{ ...styles.th, textAlign: "right" }}>
                  Orders
                </th>
              </tr>
            </thead>
            <tbody>
              {popularItems.map((it) => (
                <tr key={it.name}>
                  <td style={styles.td}>{it.name}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: 800 }}>
                    {it.count}
                  </td>
                </tr>
              ))}

              {popularItems.length === 0 ? (
                <tr>
                  <td style={styles.td} colSpan={2}>
                    No items found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;