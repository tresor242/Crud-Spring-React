import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Stack, IconButton, Tooltip, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { deleteOrder, listOrders } from "../../api/orderApi";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const data = await listOrders();
      setOrders(data);
    } catch (e) {
      setErr(readApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) =>
      String(o.id ?? "").includes(s) ||
      String(o.customerId ?? "").includes(s) ||
      (o.customerName ?? "").toLowerCase().includes(s) ||
      String(o.status ?? "").toLowerCase().includes(s)
    );
  }, [orders, q]);

  async function onDelete(id) {
    if (!confirm("Supprimer cet order ?")) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      alert(readApiError(e));
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box>
            <Typography variant="h6">Orders</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Gérer la liste des commandes (CRUD)
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Recherche id / customer / status…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ width: { xs: "100%", sm: 360 } }}
            />
            <Button onClick={refresh} variant="outlined" disabled={loading}>
              Refresh
            </Button>
            <Button component={Link} to="/orders/new" startIcon={<AddIcon />}>
              New
            </Button>
          </Box>
        </Stack>

        {err && <Typography sx={{ mt: 2, color: "error.main" }}>{err}</Typography>}
      </Paper>

      <Paper sx={{ mt: 2, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>Chargement…</TableCell>
              </TableRow>
            )}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Aucune commande.</TableCell>
              </TableRow>
            )}

            {!loading && filtered.map((o) => (
              <TableRow key={o.id} hover>
                <TableCell>{o.id}</TableCell>
                <TableCell sx={{ opacity: 0.85 }}>
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={o.status ?? "—"} />
                </TableCell>
                <TableCell sx={{ opacity: 0.85 }}>
                  {o.customerName ? `${o.customerName} (#${o.customerId})` : `#${o.customerId ?? "—"}`}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Détails">
                    <IconButton component={Link} to={`/orders/${o.id}`}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => onDelete(o.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function readApiError(e) {
  const status = e?.response?.status;
  if (!status) return "Erreur réseau (backend pas accessible ?)";
  const data = e?.response?.data;
  return data?.message || data?.detail || `Erreur ${status}`;
}